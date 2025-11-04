"""
Ahrefs API Python Client

This module provides a Python client for interacting with the Ahrefs API,
specifically for batch analysis operations.
"""

import functools
import json
import logging
import os
import threading
import time
import traceback
from concurrent.futures import as_completed
from concurrent.futures.thread import ThreadPoolExecutor
from datetime import datetime, date
from functools import wraps
from http.client import HTTPConnection
from typing import List, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import requests

import db.db
from db.db import init_database, LinkDirection, get_thread_connection
from lang import get_domain_lang_by_top_traffic, build_lang_by_domain
from model import Analysis
from model.models import TargetQueryableDomain
from query_utils import construct_field_or
from resources.disallowed_words import get_disallowed_words
from utils import url_to_domain, get_disallowed_words_by_lang_fallback, _safe_int, _safe_float

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("requests").setLevel(logging.DEBUG)


def store_errors(fn):
    @wraps(fn)
    def wrapper(self, conn, target_id, res: MultipleDomainQueryResult, *args, **kwargs):
        try:
            return fn(self, conn, target_id, res, *args, **kwargs)
        finally:
            cur = conn.cursor()
            try:
                for domain, error in res.failed_domains.items():
                    insert_query = """
                                INSERT INTO query_errors (target_id, domain, api, error) VALUES(?, ?, ?, ?)
                            """
                    values = (
                        target_id,
                        domain,
                        str(fn.__name__),
                        str(error)
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    return wrapper


class MultipleDomainQueryResult:
    def __init__(self, api: str) -> None:
        self.results_by_domain = {}
        self.failed_domains = {}

    def record_success(self, domain: str, result: dict):
        self.results_by_domain[domain] = result

    def record_failure(self, domain: str, error: Exception):
        self.failed_domains[domain] = error


def debug_requests_on():
    '''Switches on logging of the requests module.'''
    HTTPConnection.debuglevel = 1

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.DEBUG)
    requests_log.propagate = True


def debug_requests_off():
    '''Switches off logging of the requests module, might be some side-effects'''
    HTTPConnection.debuglevel = 0

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.WARNING)
    root_logger.handlers = []
    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.WARNING)
    requests_log.propagate = False

@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout))
)
def query(session: requests.Session, url: str, timeout, method: str, endpoint, data: Dict[str, Any],
          save_to_cache=True) -> Dict[
    str, Any]:
    response = None
    if method == "get":
        response = session.get(url, params=data, timeout=timeout)
    elif method == "post":
        response = session.post(url, json=data, timeout=timeout)
    response.raise_for_status()
    resp_json = response.json()
    if save_to_cache:
        cache(endpoint.replace("/", "_"), resp_json, "cache")
    return resp_json


class SimilarWebClient:
    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'api-key': f'{api_token}',
            'Content-Type': 'application/json'
        })
        self.BASE_URLv4 = "https://api.similarweb.com/batch/v4"
        self.BASE_URLv3 = "https://api.similarweb.com/v3/batch/"

    def submit_request_report(self, domains):
        payload = {
            "report_name": "domain categories",
            "delivery_information": {
                "response_format": "json"
            },
            "report_query": {
                "tables": [
                    {
                        "vtable": "website",
                        "granularity": "monthly",
                        "latest": True,
                        "filters": {
                            "domains": domains,
                            "include_subdomains": True
                        },
                        "metrics": [
                            "main_category"
                        ]
                    }
                ]
            }
        }
        return query(self.session, f"{self.BASE_URLv4}/request-report", self.timeout, "post", "request-report", payload)

    def download_report_as_domain_categories(self, report_id) -> Dict[str, str]:
        counter = 0;

        def _query():
            return query(self.session, f"{self.BASE_URLv3}/request-status/{report_id}", self.timeout, "get",
                         "request-status", {})

        status = _query()
        while counter < 10 and (status is None or status["status"] != "completed"):
            time.sleep(10)
            status = _query()
            counter += 1

        if status is None or status["status"] != "completed":
            raise RuntimeError(
                f"Couldn't get report from Similar Web afte {counter} attempts. What I got was: {status}")

        download_url = status["download_url"]
        response = requests.get(download_url)
        response.raise_for_status()  # raises error if the request failed
        domain_categories = {}
        for line in response.text.splitlines():
            if line.strip():  # skip empty lines
                obj = json.loads(line)
                domain_categories[obj["domain"]] = obj["main_category"]
        return domain_categories


def sanitize_url_to_domain(targets: Dict[str, List[Dict[str, any]]]) -> Dict[str, Any]:
    for target in targets['targets']:
        target['domain'] = url_to_domain(target.pop('url'))
    return targets


class AhrefsClient:
    BASE_URL = "https://api.ahrefs.com/v3"
    BATCH_ANALYSIS_ENDPOINT = "/batch-analysis/batch-analysis"
    METRICS_HISTORY_ENDPOINT = "/site-explorer/metrics-history"
    TOP_PAGES_ENDPOINT = "/site-explorer/top-pages"
    BACKLINKS_ENDPOINT = "/site-explorer/all-backlinks"
    OUTGOING_EXTERNAL_ANCHORS_ENDPOINT = "/site-explorer/linked-anchors-external"
    ORGANIC_KEYWORDS_ENDPOINT = "/site-explorer/organic-keywords"

    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()

        # Log API token info (first/last 4 chars only for security)
        if api_token:
            token_preview = f"{api_token[:4]}...{api_token[-4:]}" if len(api_token) > 8 else "***"
            logging.info(f"🔑 AhrefsClient initialized with token: {token_preview}")
        else:
            logging.warning(f"⚠️  AhrefsClient initialized with NO TOKEN!")

        # Set default headers
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        })
        logging.info(f"✅ Ahrefs session headers configured")

    def record_failures(fn):
        @functools.wraps(fn)
        def wrapper(self, res: MultipleDomainQueryResult, domain: str, *args, **kwargs):
            try:
                result = fn(self, res, domain, *args, **kwargs)
                if result is not None:
                    res.record_success(domain, result)
            except Exception as e:
                logging.warning(f"{fn.__name__} failed for {domain}: {e}")
                res.record_failure(domain, e)
            return res

        return wrapper

    @record_failures
    def safe_query_per_domain(self, result: MultipleDomainQueryResult, domain: str, method: str, endpoint,
                              data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return self.unsafe_query(method, endpoint, data, save_to_cache=save_to_cache)

    def unsafe_query(self, method: str, endpoint, data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        return query(self.session, f"{self.BASE_URL}{endpoint}", self.timeout, method, endpoint, data, save_to_cache)

    def batch_analysis(self,
                       targets: List[TargetQueryableDomain]) -> Dict[str, Any]:
        logging.info(f"🌐 Preparing Ahrefs batch analysis request for {len(targets)} domains...")
        logging.info(f"   Domains: {[t.domain for t in targets]}")
        
        select = [
            "ahrefs_rank",
            "backlinks",
            "backlinks_dofollow",
            "backlinks_internal",
            "backlinks_nofollow",
            "backlinks_redirect",
            "domain_rating",
            "index",
            "ip",
            "linked_domains",
            "linked_domains_dofollow",
            "mode",
            "org_cost",
            "org_keywords",
            "org_keywords_11_20",
            "org_keywords_1_3",
            "org_keywords_21_50",
            "org_keywords_4_10",
            "org_keywords_51_plus",
            "org_traffic",
            "org_traffic_top_by_country",
            "outgoing_links",
            "outgoing_links_dofollow",
            "paid_ads",
            "paid_cost",
            "paid_keywords",
            "paid_traffic",
            "protocol",
            "refdomains",
            "refdomains_dofollow",
            "refdomains_nofollow",
            "refips",
            "refips_subnets",
            "url",
            "url_rating"
        ]

        # Build request payload
        payload = {
            "targets": [{"url": d.domain, "mode": d.mode, "protocol": d.protocol} for d in targets],
            "select": select
        }
        
        logging.info(f"📤 Sending POST request to {self.BASE_URL}{self.BATCH_ANALYSIS_ENDPOINT}")
        try:
            result = sanitize_url_to_domain(self.unsafe_query("post", self.BATCH_ANALYSIS_ENDPOINT, payload))
            logging.info(f"✅ Batch analysis request successful!")
            return result
        except Exception as e:
            logging.error(f"❌ Batch analysis request failed: {str(e)}")
            logging.error(f"   Error type: {type(e).__name__}")
            raise

    def query_organic_keywords_forbidden_words(self, target_id, date: str,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["keyword", "keyword_country", "is_best_position_set_top_3", "is_best_position_set_top_4_10",
                           "is_best_position_set_top_11_50", "best_position_url"])
        res = MultipleDomainQueryResult("query_organic_keywords")
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "date": date,
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("keyword", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.ORGANIC_KEYWORDS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for raw_res_entity in raw_result["keywords"]:
                    raw_res_entity["forbidden_word_category"] = None
                    keyword = raw_res_entity["keyword"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in keyword:
                            raw_res_entity["forbidden_word_category"] = category
        return res

    def query_top_pages(self,
                        target_id,
                        date: str,
                        targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["top_keyword_best_position_title", "sum_traffic"])
        res = MultipleDomainQueryResult("query_top_pages")
        for target in targets:
            query_params = {"date": date,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select,
                            "order_by": "sum_traffic",
                            "limit": 10, }
            self.safe_query_per_domain(res, target.domain, "get", self.TOP_PAGES_ENDPOINT, query_params)
        return res

    def query_metric_history(self,
                             target_id,
                             date_from: str,
                             targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["date", "org_cost", "org_traffic", "paid_cost", "paid_traffic"])
        res = MultipleDomainQueryResult("query_metric_history")
        for target in targets:
            query_params = {"date_from": date_from,
                            "target": target.domain,
                            "protocol": target.protocol,
                            "mode": target.mode,
                            "select": select}
            self.safe_query_per_domain(res, target.domain, "get", self.METRICS_HISTORY_ENDPOINT, query_params)
        return res

    def query_outgoing_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets: List[TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ",".join(["anchor", "dofollow_links"])
        res = MultipleDomainQueryResult("query_outgoing_external_anchors")
        for target in targets:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": select,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.OUTGOING_EXTERNAL_ANCHORS_ENDPOINT,
                                       query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["linkedanchors"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category

        return res

    @store_errors
    def persist_outgoing_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['linkedanchors']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                           INSERT OR REPLACE INTO anchors_forbidden_words (
                                               target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.OUT,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        "",
                        "",
                        "",
                        ""
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_incoming_anchors_forbidden_words(self, conn, target_id, res: MultipleDomainQueryResult):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                backlinks_ = entry['backlinks']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                    INSERT OR REPLACE INTO anchors_forbidden_words (
                                        target_id, domain, direction, anchor, forbidden_word_category, title, url_from, snippet_left, snippet_right
                                    ) VALUES (
                                        ?, ?, ?, ?, ?, ?, ?, ?, ?
                                    )
                                """

                    values = (
                        target_id,
                        domain,
                        LinkDirection.IN,
                        backlink['anchor'],
                        backlink['forbidden_word_category'],
                        backlink['title'],
                        backlink['url_from'],
                        backlink['snippet_left'],
                        backlink['snippet_right']
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    def query_incoming_anchors_forbidden_words(self,
                                               target_id,
                                               forbidden_class_by_forbidden_word_by_lang: Dict[str, Dict[str, str]],
                                               targets_with_lang: List[
                                                   TargetQueryableDomain]) -> MultipleDomainQueryResult:
        select = ["anchor", "title", "url_from", "snippet_left", "snippet_right"]
        res = MultipleDomainQueryResult("query_backlinks_badwords")
        result_by_domain = {}
        for target in targets_with_lang:
            forbidden_class_by_forbidden_word = forbidden_class_by_forbidden_word_by_lang[target.lang]
            all_forbidden_words = [word for word in forbidden_class_by_forbidden_word.keys()]
            query_params = {
                "target": target.domain,
                "protocol": target.protocol,
                "mode": target.mode,
                "select": ",".join(select),
                "limit": 50,
                "where": json.dumps(
                    construct_field_or("anchor", all_forbidden_words))}

            self.safe_query_per_domain(res, target.domain, "get", self.BACKLINKS_ENDPOINT, query_params)
            if not target.domain in res.failed_domains:
                raw_result = res.results_by_domain[target.domain]
                for linked_anchor in raw_result["backlinks"]:
                    linked_anchor["forbidden_word_category"] = None
                    anchor = linked_anchor["anchor"]
                    for word, category in forbidden_class_by_forbidden_word.items():
                        if word in anchor:
                            linked_anchor["forbidden_word_category"] = category
        return res

    @store_errors
    def persist_top_pages(self, conn, target_id, res: MultipleDomainQueryResult, country_code, date: str):
        cur = conn.cursor()
        try:
            for domain, top_pages in res.results_by_domain.items():
                position = 1
                for page_entry in top_pages['pages']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_top_pages (
                            target_id, country_code, date, domain, position, top_keyword_best_position_title, sum_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?
                        )
                    """
                    values = (
                        target_id,
                        country_code,
                        date,
                        domain,
                        position,
                        page_entry['top_keyword_best_position_title'],
                        page_entry['sum_traffic']
                    )
                    cur.execute(insert_query, values)
                    position += 1
            conn.commit()
        except Exception:
            conn.rollback()
            raise

    @store_errors
    def persist_metric_history(self, conn, target_id, res: MultipleDomainQueryResult, country_code):
        for domain, metrics_history in res.results_by_domain.items():
            try:
                cur = conn.cursor()
                for metric_entry in metrics_history['metrics']:
                    insert_query = """
                        INSERT OR REPLACE INTO ahrefs_metrics_history (
                            target_id, country_code, date, domain, org_cost, org_traffic, paid_cost, paid_traffic
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?
                        )
                    """

                    values = (
                        target_id,
                        country_code,
                        metric_entry['date'],
                        domain,
                        metric_entry['org_cost'],
                        metric_entry['org_traffic'],
                        metric_entry['paid_cost'],
                        metric_entry['paid_traffic']
                    )
                    cur.execute(insert_query, values)
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    def persist_batch_analysis(self, conn, target_id, batch_results: Dict[str, Any], lang_by_domain: Dict[str, str]) -> \
            List[str]:
        saved_domains = []
        try:
            cur = conn.cursor()
            for result in batch_results['targets']:
                insert_query = """
                    INSERT OR REPLACE INTO batch_analysis (
                        target_id, domain, ip, protocol, mode, ahrefs_rank, domain_rating, url_rating,
                        backlinks, backlinks_dofollow, backlinks_internal, backlinks_nofollow, 
                        backlinks_redirect, refdomains, refdomains_dofollow, refdomains_nofollow,
                        refips, refips_subnets, linked_domains, linked_domains_dofollow,
                        outgoing_links, outgoing_links_dofollow, org_cost, org_traffic, org_keywords,
                        org_keywords_1_3, org_keywords_4_10, org_keywords_11_20, org_keywords_21_50,
                        org_keywords_51_plus, paid_cost, paid_traffic, paid_keywords, paid_ads, lang_by_top_traffic, detected_lang,
                        created_at, updated_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """

                values = (
                    target_id,
                    result.get('domain'),
                    result.get('ip'),
                    result.get('protocol'),
                    result.get('mode'),
                    _safe_int(result.get('ahrefs_rank')),
                    _safe_float(result.get('domain_rating')),
                    _safe_float(result.get('url_rating')),
                    _safe_int(result.get('backlinks')),
                    _safe_int(result.get('backlinks_dofollow')),
                    _safe_int(result.get('backlinks_internal')),
                    _safe_int(result.get('backlinks_nofollow')),
                    _safe_int(result.get('backlinks_redirect')),
                    _safe_int(result.get('refdomains')),
                    _safe_int(result.get('refdomains_dofollow')),
                    _safe_int(result.get('refdomains_nofollow')),
                    _safe_int(result.get('refips')),
                    _safe_int(result.get('refips_subnets')),
                    _safe_int(result.get('linked_domains')),
                    _safe_int(result.get('linked_domains_dofollow')),
                    _safe_int(result.get('outgoing_links')),
                    _safe_int(result.get('outgoing_links_dofollow')),
                    _safe_int(result.get('org_cost')),
                    _safe_int(result.get('org_traffic')),
                    _safe_int(result.get('org_keywords')),
                    _safe_int(result.get('org_keywords_1_3')),
                    _safe_int(result.get('org_keywords_4_10')),
                    _safe_int(result.get('org_keywords_11_20')),
                    _safe_int(result.get('org_keywords_21_50')),
                    _safe_int(result.get('org_keywords_51_plus')),
                    _safe_int(result.get('paid_cost')),
                    _safe_int(result.get('paid_traffic')),
                    _safe_int(result.get('paid_keywords')),
                    _safe_int(result.get('paid_ads')),
                    get_domain_lang_by_top_traffic(result.get('org_traffic_top_by_country', [])),
                    lang_by_domain[result.get('domain')]
                )

                cur.execute(insert_query, values)
                org_traffic_countries = result.get('org_traffic_top_by_country', [])
                if isinstance(org_traffic_countries, list):
                    self.persist_batch_analysis_country_traffic(cur, target_id, result.get('domain'),
                                                                org_traffic_countries)

                saved_domains.append(target_id)

            conn.commit()

        except Exception:
            conn.rollback()
            raise
        return saved_domains

    def persist_batch_analysis_country_traffic(self, cursor, target_id: str, domain: str,
                                               country_data: List[Dict[str, Any]]):
        # Insert new country data
        for country_item in country_data:
            if isinstance(country_item, list):
                cursor.execute("""
                        INSERT OR REPLACE INTO ahrefs_org_traffic_country 
                        (target_id, domain, country_code, traffic)
                        VALUES (?, ?, ?, ?)
                    """, (
                    target_id,
                    domain,
                    country_item[0],
                    country_item[1]
                ))

    def persist_organic_keywords_forbiddne_words(self, conn, target_id: str, res: MultipleDomainQueryResult,
                                                 cure_date: str):
        try:
            cur = conn.cursor()
            for domain, entry in res.results_by_domain.items():
                items = entry['keywords']
                for item in items:
                    insert_query = """
                                           INSERT OR REPLACE INTO ahrefs_organic_keywords (
                                               target_id, domain, date, keyword, keyword_country, forbidden_word_category, is_best_position_set_top_3,
                                               is_best_position_set_top_4_10, is_best_position_set_top_11_50 
                                           ) VALUES (
                                               ?, ?, ?, ?, ?, ?, ?, ?, ?
                                           )
                                       """

                    values = (
                        target_id,
                        domain,
                        cure_date,
                        item['keyword'],
                        item['keyword_country'],
                        item['forbidden_word_category'],
                        item['is_best_position_set_top_3'],
                        item['is_best_position_set_top_4_10'],
                        item['is_best_position_set_top_11_50'],
                    )
                    cur.execute(insert_query, values)
            conn.commit()
        except Exception:
            conn.rollback()
            raise


def cache(cache_name, results: Dict[str, Any], cache_dir: str = "cache") -> str:
    print("\nSaving results to cache...")
    os.makedirs(cache_dir, exist_ok=True)

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    cache_filename = f"{cache_name}_{timestamp}.json"
    cache_filepath = os.path.join(cache_dir, cache_filename)

    with open(cache_filepath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to cache file: {cache_filepath}")

    return cache_filepath


def update_targets_with_lang(targets: list[TargetQueryableDomain], lang_by_domain) -> None:
    for target in targets:
        target.lang = lang_by_domain[target.domain]


class DataExtractor:
    def __init__(self, parallelization_level=50) -> None:
        import logging
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.debug("Initializing DataExtractor...")

        project_root = os.path.abspath(os.getcwd())
        self.logger.info(f"Project root determined as: {project_root}")

        self.db_path = os.path.join(project_root, "ahrefs_data.db")
        self.logger.info(f"Database path set to: {self.db_path}")

        self.cache_dir = os.path.join(project_root, "cache")
        self.logger.info(f"Cache directory set to: {self.cache_dir}")

        ahrefs_api_token = os.environ.get("AHREFS_API_TOKEN")
        self.logger.info(f"AHREFS_API_TOKEN key: {'SET' if ahrefs_api_token else 'NOT SET'}")
        self.ahrefs_client = AhrefsClient(
            api_token=ahrefs_api_token,
            db_path=self.db_path  # SQLite database file path
        )
        self.logger.info("AhrefsClient initialized.")

        # For completeness, log about SimilarWeb key as well (if it will be used in this class)
        similarweb_key = os.environ.get("SIMILAR_WEB_KEY")
        self.logger.info(f"SIMILAR_WEB_KEY: {'SET' if similarweb_key else 'NOT SET'}")

        self.similar_web_client = SimilarWebClient(api_token=os.environ.get("SIMILAR_WEB_KEY"))
        self.parallelization_level = parallelization_level

    def flusher_thread(self, analysis_id, done_domains, stop_event, interval=2):
        while not stop_event.is_set():
            time.sleep(interval)
            count = len(done_domains)
            get_thread_connection().execute(
                "update analysis set processed_domains = ? where target_id = ?",
                (count, analysis_id),
            )
            get_thread_connection().commit()
            print(f"[Flusher] {analysis_id}: {count} domains completed")
        # Final flush on stop
        get_thread_connection().execute(
            "update analysis set processed_domains = ? where target_id = ?",
            (analysis_id, len(done_domains)),
        )
        get_thread_connection().commit()

    def run_extract(self, analysis: Analysis):
        target_id = analysis.target_id

        print(f"\nExtracting data for analysis {analysis.target_id}...")

        # similar_web_client = SimilarWebClient(api_token=os.environ.get("SIMILAR_WEB_KEY"))

        # Initialize database (creates tables if they don't exist)
        print("Initializing database...")
        print("Database initialized successfully!")

        domains = analysis.domains
        target_queryable_domains = [TargetQueryableDomain(domain=d.domain) for d in domains]
        print(f"Target domains: {[d.domain for d in target_queryable_domains]}", flush=True)
        # sim_web_report_id = similar_web_client.submit_request_report([d['domain'] for d in targets])["report_id"]
        # {'report_id': '5b096600-2c1e-4d0b-9adb-f035baabfb94', 'status': 'pending'}
        
        # Split large batches into smaller chunks (Ahrefs API works better with smaller batches)
        BATCH_SIZE = 10  # Process 10 domains at a time
        total_domains = len(target_queryable_domains)
        
        if total_domains > BATCH_SIZE:
            print(f"🔍 Large batch detected ({total_domains} domains). Splitting into chunks of {BATCH_SIZE}...", flush=True)
            all_targets = []  # Collect all targets from chunks
            
            for i in range(0, total_domains, BATCH_SIZE):
                chunk = target_queryable_domains[i:i+BATCH_SIZE]
                chunk_num = (i // BATCH_SIZE) + 1
                total_chunks = (total_domains + BATCH_SIZE - 1) // BATCH_SIZE
                
                print(f"📦 Processing chunk {chunk_num}/{total_chunks} ({len(chunk)} domains)...", flush=True)
                try:
                    chunk_results = self.ahrefs_client.batch_analysis(targets=chunk)
                    if chunk_results and 'targets' in chunk_results:
                        all_targets.extend(chunk_results['targets'])
                    print(f"✅ Chunk {chunk_num}/{total_chunks} completed", flush=True)
                except Exception as e:
                    print(f"❌ Chunk {chunk_num}/{total_chunks} failed: {e}", flush=True)
                    raise
            
            # Combine all chunks into single result structure
            batch_analysis_results = {'targets': all_targets}
            print(f"✅ All chunks completed! Total results: {len(all_targets)}", flush=True)
        else:
            # Small batch - process normally
            print("🔍 Querying Ahrefs batch analysis API...", flush=True)
            try:
                batch_analysis_results = self.ahrefs_client.batch_analysis(targets=target_queryable_domains)
                print(f"✅ Batch analysis API returned {len(batch_analysis_results) if batch_analysis_results else 0} results", flush=True)
            except Exception as e:
                print(f"❌ Batch analysis API failed: {e}", flush=True)
                raise
        
        print("💾 Saving batch analysis to database...", flush=True)
        lang_by_domain = build_lang_by_domain(batch_analysis_results)
        saved_target_ids = self.ahrefs_client.persist_batch_analysis(db.db.get_thread_connection(), target_id,
                                                                     batch_analysis_results,
                                                                     lang_by_domain)
        print(f"Successfully saved {len(saved_target_ids)} records to database")

        update_targets_with_lang(target_queryable_domains, lang_by_domain)

        results, failures = self.process_all_domains(analysis.target_id, target_queryable_domains)

        print(f"ALL DATA EXTRACTED, success: {len(results)} failures: {len(failures)}")

        # sim_web_report_id = "5b096600-2c1e-4d0b-9adb-f035baabfb94"
        # domain_categories = similar_web_client.download_report_as_domain_categories(sim_web_report_id)
        # db.persist_domain_categories(conn, target_id, domain_categories)

    def process_all_domains(self, target_id, target_queryable_domains: List[TargetQueryableDomain]):
        done_domains = set()
        done_lock = threading.Lock()
        stop_event = threading.Event()
        flusher = threading.Thread(
            target=self.flusher_thread,
            args=(target_id, done_domains, stop_event),
            daemon=True,
        )
        flusher.start()

        results = []
        failures = []

        with ThreadPoolExecutor(max_workers=self.parallelization_level) as executor:
            future_to_domain = {
                executor.submit(self.process_single_domain, target_id, domain): domain
                for domain in target_queryable_domains
            }

            for future in as_completed(future_to_domain):
                domain = future_to_domain[future]
                try:
                    result = future.result()
                    results.append((domain, result))
                except Exception as e:
                    print(traceback.format_exc())
                    failures.append((domain, e))

                finally:
                    with done_lock:
                        done_domains.add(domain)
        stop_event.set()
        flusher.join()
        return results, failures

    def process_single_domain(self, target_id: str,
                              domain: TargetQueryableDomain):
        date_from = "2022-01-01"
        query_date = date.today().strftime("%Y-%m-%d")
        client = self.ahrefs_client
        conn = db.db.get_thread_connection()

        target_queryable_domains = [domain]
        print(f"{domain.domain}: Querying metrics...")
        res = client.query_metric_history(target_id=target_id, targets=target_queryable_domains, date_from=date_from)
        client.persist_metric_history(conn, target_id, res, None)

        print(f"{domain.domain}: Querying top pages...")
        res = client.query_top_pages(target_id, query_date, target_queryable_domains)
        client.persist_top_pages(conn, target_id, res, None, query_date)

        # debug_requests_on()
        category_forbidden_words_by_lang = self.get_category_forbidden_words_by_lang(target_queryable_domains)
        print(f"{domain.domain}: Querying forbidden_words in backlinks anchors...")
        res = client.query_incoming_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_incoming_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in outgoing anchors...")
        res = client.query_outgoing_anchors_forbidden_words(target_id, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_outgoing_anchors_forbidden_words(conn, target_id, res)

        print(f"{domain.domain}: Querying forbidden_words in organic keywords...")
        res = client.query_organic_keywords_forbidden_words(target_id, query_date, category_forbidden_words_by_lang,
                                                            target_queryable_domains)
        client.persist_organic_keywords_forbiddne_words(conn, target_id, res, query_date)
        print(f"{domain.domain}: DONE")

    def get_category_forbidden_words_by_lang(self, targets_with_lang: list[TargetQueryableDomain]):
        category_forbidden_words_by_lang = {tgt.lang: {word: cat for cat in ["forbidden", "spam"] for word in
                                                       get_disallowed_words_by_lang_fallback(get_disallowed_words(),
                                                                                             tgt.lang).get(cat, [])}
                                            for tgt in targets_with_lang}
        return category_forbidden_words_by_lang
