"""
Ahrefs API Python Client

This module provides a Python client for interacting with the Ahrefs API,
specifically for batch analysis operations.
"""

import json
import os
from datetime import datetime
from http.client import HTTPConnection
from typing import List, Dict, Any, Optional

import requests

from query_utils import construct_or
import logging

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("requests").setLevel(logging.DEBUG)


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


class AhrefsClient:
    BASE_URL = "https://api.ahrefs.com/v3"
    BATCH_ANALYSIS_ENDPOINT = "/batch-analysis/batch-analysis"
    METRICS_HISTORY_ENDPOINT = "/site-explorer/metrics-history"
    TOP_PAGES_ENDPOINT = "/site-explorer/top-pages"
    BACKLINKS_ENDPOINT = "/site-explorer/all-backlinks"

    def __init__(self, api_token: str, timeout: int = 90,
                 db_path: str = None):
        self.api_token = api_token
        self.timeout = timeout
        self.session = requests.Session()

        # Database file path
        self.db_path = db_path

        # Set default headers
        self.session.headers.update({
            'Accept': 'application/json, application/xml',
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        })

    def batch_analysis(self,
                       targets: List[Dict[str, str]]) -> Dict[str, Any]:
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
            "targets": targets,
            "select": select
        }

        return self.query("post", self.BATCH_ANALYSIS_ENDPOINT, payload)

    def query_top_pages(self,
                        target_id,
                        date: str,
                        targets: List[Dict[str, str]]) -> Dict[str, Any]:
        select = ",".join(["top_keyword_best_position_title", "sum_traffic"])
        result_by_domain = {}
        for target in targets:
            query_params = {"date": date,
                            "target": target['domain'],
                            "protocol": target['protocol'],
                            "mode": target['mode'],
                            "select": select,
                            "order_by": "sum_traffic",
                            "limit": 10, }
            result = self.query("get", self.TOP_PAGES_ENDPOINT, query_params)
            result_by_domain[target['domain']] = result
        return result_by_domain

    def query_metric_history(self,
                             target_id,
                             date_from: str,
                             targets: List[Dict[str, str]]) -> Dict[str, Any]:
        select = ",".join(["date", "org_cost", "org_traffic", "paid_cost", "paid_traffic"])
        result_by_domain = {}
        for target in targets:
            query_params = {"date_from": date_from,
                            "target": target['domain'],
                            "protocol": target['protocol'],
                            "mode": target['mode'],
                            "select": select}
            result = self.query("get", self.METRICS_HISTORY_ENDPOINT, query_params)
            result_by_domain[target['domain']] = result
        return result_by_domain

    def persist_backlinks_badwords(self, conn, target_id, backlinks: Dict[str, Any]):
        try:
            cur = conn.cursor()
            for domain, entry in backlinks.items():
                backlinks_ = entry['backlinks']
                backlink_entry = backlinks_
                for backlink in backlink_entry:
                    insert_query = """
                                    INSERT OR REPLACE INTO ahrefs_backlinks_badwords (
                                        target_id, domain, anchor, title, url_from, snippet_left, snippet_right
                                    ) VALUES (
                                        ?, ?, ?, ?, ?, ?, ?
                                    )
                                """

                    values = (
                        target_id,
                        domain,
                        backlink['anchor'],
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
        finally:
            conn.close()

    def query_backlinks_badwords(self,
                                 target_id,
                                 badwords: List[str],
                                 targets: List[Dict[str, str]]) -> Dict[str, Any]:
        select = ["anchor", "title", "url_from", "snippet_left", "snippet_right"]
        result_by_domain = {}
        for target in targets:
            query_params = {
                "target": target['domain'],
                "protocol": target['protocol'],
                "mode": target['mode'],
                "select": ",".join(select),
                "limit": 50,
                "where": json.dumps(
                    construct_or("anchor", badwords))}
            result = self.query("get", self.BACKLINKS_ENDPOINT, query_params)
            result_by_domain[target['domain']] = result
        return result_by_domain

    def query(self, method: str, endpoint, data: Dict[str, Any], save_to_cache=True) -> Dict[str, Any]:
        url = f"{self.BASE_URL}{endpoint}"
        response = None
        if method == "get":
            response = self.session.get(url, params=data, timeout=self.timeout)
        elif method == "post":
            response = self.session.post(url, json=data, timeout=self.timeout)
        if response.status_code != requests.codes.ok:
            raise RuntimeError(response.text)
        resp_json = response.json()
        self.save_to_cache(endpoint.replace("/", "_"), resp_json, "cache")
        return resp_json

    def persist_top_pages(self, conn, target_id, domain: str, country_code, date: str,
                          top_pages: Dict[str, Any]):
        try:
            cur = conn.cursor()
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
        finally:
            conn.close()

    def persist_metric_history(self, conn, target_id, domain: str, country_code, metrics_history: Dict[str, Any]):
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
        finally:
            conn.close()

    def persist_batch_analysis(self, conn, target_id, batch_results: Dict[str, Any]) -> List[str]:
        saved_target_ids = []
        try:
            cur = conn.cursor()
            for result in batch_results['targets']:
                insert_query = """
                    INSERT OR REPLACE INTO batch_analysis (
                        target_id, url, ip, protocol, mode, ahrefs_rank, domain_rating, url_rating,
                        backlinks, backlinks_dofollow, backlinks_internal, backlinks_nofollow, 
                        backlinks_redirect, refdomains, refdomains_dofollow, refdomains_nofollow,
                        refips, refips_subnets, linked_domains, linked_domains_dofollow,
                        outgoing_links, outgoing_links_dofollow, org_cost, org_traffic, org_keywords,
                        org_keywords_1_3, org_keywords_4_10, org_keywords_11_20, org_keywords_21_50,
                        org_keywords_51_plus, paid_cost, paid_traffic, paid_keywords, paid_ads,
                        created_at, updated_at
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """

                values = (
                    target_id,
                    result.get('url'),
                    result.get('ip'),
                    result.get('protocol'),
                    result.get('mode'),
                    self._safe_int(result.get('ahrefs_rank')),
                    self._safe_float(result.get('domain_rating')),
                    self._safe_float(result.get('url_rating')),
                    self._safe_int(result.get('backlinks')),
                    self._safe_int(result.get('backlinks_dofollow')),
                    self._safe_int(result.get('backlinks_internal')),
                    self._safe_int(result.get('backlinks_nofollow')),
                    self._safe_int(result.get('backlinks_redirect')),
                    self._safe_int(result.get('refdomains')),
                    self._safe_int(result.get('refdomains_dofollow')),
                    self._safe_int(result.get('refdomains_nofollow')),
                    self._safe_int(result.get('refips')),
                    self._safe_int(result.get('refips_subnets')),
                    self._safe_int(result.get('linked_domains')),
                    self._safe_int(result.get('linked_domains_dofollow')),
                    self._safe_int(result.get('outgoing_links')),
                    self._safe_int(result.get('outgoing_links_dofollow')),
                    self._safe_int(result.get('org_cost')),
                    self._safe_int(result.get('org_traffic')),
                    self._safe_int(result.get('org_keywords')),
                    self._safe_int(result.get('org_keywords_1_3')),
                    self._safe_int(result.get('org_keywords_4_10')),
                    self._safe_int(result.get('org_keywords_11_20')),
                    self._safe_int(result.get('org_keywords_21_50')),
                    self._safe_int(result.get('org_keywords_51_plus')),
                    self._safe_int(result.get('paid_cost')),
                    self._safe_int(result.get('paid_traffic')),
                    self._safe_int(result.get('paid_keywords')),
                    self._safe_int(result.get('paid_ads'))
                )

                cur.execute(insert_query, values)
                org_traffic_countries = result.get('org_traffic_top_by_country', [])
                if isinstance(org_traffic_countries, list):
                    self.persist_batch_analysis_country_traffic(cur, target_id, org_traffic_countries)

                saved_target_ids.append(target_id)

            conn.commit()

        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
        return saved_target_ids

    def persist_batch_analysis_country_traffic(self, cursor, target_id: str, country_data: List[Dict[str, Any]]):
        cursor.execute(
            "DELETE FROM ahrefs_org_traffic_country WHERE target_id = ?",
            (target_id,)
        )

        # Insert new country data
        for country_item in country_data:
            if isinstance(country_item, list):
                cursor.execute("""
                    INSERT OR REPLACE INTO ahrefs_org_traffic_country 
                    (target_id, country_code, traffic)
                    VALUES (?, ?, ?)
                """, (
                    target_id,
                    country_item[0],
                    country_item[1]
                ))

    def _safe_int(self, value) -> Optional[int]:
        return int(value) if value else None

    def _safe_float(self, value) -> Optional[float]:
        return float(value) if value else None

    def save_to_cache(self, cache_name, results: Dict[str, Any], cache_dir: str = "cache") -> str:
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
