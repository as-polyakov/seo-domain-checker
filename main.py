import os
from typing import List, Dict, Any

import dao
from rules.rule_aggregator import evaluate_domain


def update_targets_with_lang(targets, lang_by_domain) -> List[Dict[str, Any]]:
    return [{**item, "lang": lang_by_domain[item["domain"]]} for item in targets]


def main():
    project_root = os.path.abspath(os.getcwd())
    db_path = os.path.join(project_root, "ahrefs_data.db")
    eval_results = [evaluate_domain("86caba33-c284-4939-80db-46267493cf28", domain)
                    for domain in ["dimokratiki.gr"]]

    dao.persist_rule_evaluations("86caba33-c284-4939-80db-46267493cf28", eval_results)



if __name__ == "__main__":
    main()
    # get_domain_lang("www.ahrefs.com")
    # get_domain_lang("www.dzen.ru")
    # get_domain_lang("dimokratiki.gr")
