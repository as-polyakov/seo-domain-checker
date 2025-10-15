import sqlite3
from datetime import datetime
from typing import Dict, List, Tuple

from db.db import init_database, LinkDirection
from model import Analysis, AnalysisStatus
from resources.disallowed_words import ForbiddenWordCategory
from model.models import RuleEvaluation
from utils import _safe_int

conn = init_database()
conn.row_factory = sqlite3.Row


def select_one(query: str, params: tuple = ()) -> dict | None:
    cur = conn.cursor()
    cur.execute(query, params)
    row = cur.fetchone()
    return dict(row) if row else None


def select_all(query: str, params: tuple = ()) -> list[dict]:
    cur = conn.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    return [dict(r) for r in rows]


def insert_one(query: str, params: tuple = ()):
    cur = conn.cursor()
    cur.execute(query, params)
    conn.commit()


def update_analysis_status(analysis_id: str, status: AnalysisStatus) -> None:
    cur = conn.cursor()
    cur.execute("update analysis set status = ? where target_id = ?", (status, analysis_id))
    conn.commit()


# CREATE TABLE rules_evaluation_results
# (
#     target_id          TEXT NOT NULL,
#     domain             TEXT, -- ISO country code (2 chars)
#     rule               text,
#     score              int,
#     critical_violation BOOLEAN,
#     details            TEXT,
#     PRIMARY KEY (target_id, domain)
# );
def persist_rule_evaluations(analysis_id: str, evals: list[list[RuleEvaluation]]) -> None:
    cur = conn.cursor()
    for eval_by_domain in evals:
        for eval in eval_by_domain:
            cur.execute(
                "insert into rules_evaluation_results (target_id, domain, rule, score, critical_violation, details) VALUES (?, ?, ?, ?, ?, ?)",
                (analysis_id, eval.domain, eval.rule, eval.score, eval.critical_violation, eval.details))
    conn.commit()


def persist_analysis(analysis: Analysis) -> None:
    insert_one(
        "insert into analysis (target_id, name, status, created_at, completed_at) VALUES (?, ?, ?, ?, ?)",
        (
            analysis.target_id, analysis.name, analysis.status, safe_date_to_str(analysis.created_at),
            safe_date_to_str(analysis.completed_at)))
    for domain in analysis.domains:
        insert_one("insert into analysis_domains (target_id, domain, price_usd, notes) VALUES (?, ?, ?, ?)",
                   (analysis.target_id, domain.domain, domain.price_usd, domain.notes))
    conn.commit()


def safe_date_to_str(date: datetime) -> str:
    return date.strftime("%Y-%m-%d %H:%M:%S") if date else None


def safe_date_from_str(datestr: str) -> datetime:
    return datetime.strptime(datestr, "%Y-%m-%d %H:%M:%S") if datestr else None


def get_recent_analysis() -> list[dict]:
    return select_all(
        """
        select target_id,
       name,
       status,
       created_at,
       completed_at,
       (select count(*) from analysis_domains where target_id = analysis.target_id) as "total_domains"
        from analysis
        order by created_at, completed_at desc
        """, ())


def get_analysis(analysis_id: str) -> dict[str, str]:
    return select_one(
        """
        select target_id,
       name,
       status,
       created_at,
       completed_at,
       (select count(*) from analysis_domains where target_id = analysis.target_id) as "total_domains"
        from analysis where target_id = ?
        """, (analysis_id,))


def store_rule_evaluations(analysis_id: str, res: List[RuleEvaluation]) -> None:
    cur = conn.cursor()
    for rule_ev in res:
        cur.execute(
            "insert into rules_evaluation_results (target_id, domain, rule, score, critical_violation, details) VALUES (?, ?, ?, ?, ?, ?)",
            (analysis_id, rule_ev.domain, rule_ev.__class__.__name__, rule_ev.score, rule_ev.critical_violation,
             rule_ev.details))


def get_organic_keywords(target_id: str, domain: str, category: ForbiddenWordCategory) -> list[dict[str, str]]:
    return select_all(
        "select keyword, keyword_country, is_best_position_set_top_3,is_best_position_set_top_4_10, is_best_position_set_top_11_50, best_position_url from ahrefs_organic_keywords where " +
        "target_id = ? and domain = ? and forbidden_word_category = ?",
        (target_id, domain, category))


def get_anchors_forbidden_words(target_id: str, domain: str,
                                direction: LinkDirection, category: ForbiddenWordCategory) -> list[dict[str, str]]:
    return select_all(
        "select anchor, forbidden_word_category, title from anchors_forbidden_words where " +
        "target_id = ? and domain = ? and direction = ? and forbidden_word_category = ?",
        (target_id, domain, direction, category))


def get_top_pages_traffic(target_id: str, domain: str) -> Dict[str, Tuple[str, int]]:
    return {r["position"]:
                (r["top_keyword_best_position_title"], int(r["sum_traffic"])) for r in select_all(
        "select position, top_keyword_best_position_title, sum_traffic from ahrefs_top_pages where target_id = ? and domain = ?",
        (target_id, domain))}


def get_in_out_num_domains(target_id: str, domain: str) -> (int, int):
    res = select_one(
        "select linked_domains_dofollow, refdomains_dofollow from batch_analysis where target_id = ? and domain = ?",
        (target_id, domain))
    return _safe_int(res["linked_domains_dofollow"]), _safe_int(res["refdomains_dofollow"])


def get_domain_top_traffic_geography(target_id: str, domain: str) -> str:
    traffic_by_country = get_domain_traffic_by_country(target_id, domain)
    return max(traffic_by_country, key=traffic_by_country.get)


def get_domain_traffic_by_date(target_id: str, domain: str) -> Dict[str, int]:
    organic_traffic_by_date = select_all(
        "select date, org_traffic from ahrefs_metrics_history where target_id = ? and domain = ?",
        (target_id, domain))
    res = {e["date"]: int(e["org_traffic"]) for e in organic_traffic_by_date}
    return res


def get_domain_traffic_by_country(target_id: str, domain: str) -> Dict[str, int]:
    organic_traffic = select_all(
        "select country_code, traffic from ahrefs_org_traffic_country where target_id = ? and domain = ?",
        (target_id, domain))
    res = {e["country_code"]: int(e["traffic"]) for e in organic_traffic}
    return res


def get_domain_dr(target_id: str, domain: str) -> int | None:
    rating = select_one(
        "SELECT domain_rating FROM batch_analysis WHERE target_id = ? AND domain = ?",
        (target_id, domain),
    )
    if rating:
        return rating["domain_rating"]
    return None


def get_domain_category(target_id: str, domain: str) -> str:
    return select_one("select domain_category from batch_analysis WHERE target_id = ? AND domain = ?",
                      (target_id, domain))["domain_category"]
