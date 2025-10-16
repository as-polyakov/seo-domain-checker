import os
from typing import List, Dict, Any

import dao
from rules.rule_aggregator import evaluate_domain


def update_targets_with_lang(targets, lang_by_domain) -> List[Dict[str, Any]]:
    return [{**item, "lang": lang_by_domain[item["domain"]]} for item in targets]


def main():
    id = "a7cc50b3-4ba5-4ba1-970d-b35b7eede114"
    project_root = os.path.abspath(os.getcwd())
    db_path = os.path.join(project_root, "ahrefs_data.db")
    eval_results = [evaluate_domain(id, domain)
                    for domain in [
                         "ahrefs.com",
                       "google.com",
                    ]]
    print("Evaluation results:" + str(eval_results))
    dao.persist_rule_evaluations(id, eval_results)



if __name__ == "__main__":
    main()
    # get_domain_lang("www.ahrefs.com")
    # get_domain_lang("www.dzen.ru")
    # get_domain_lang("dimokratiki.gr")
