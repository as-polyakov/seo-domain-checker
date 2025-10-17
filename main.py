import dao
from db.db import init_database
from rules.rule_aggregator import evaluate_domain


def main():
    init_database()
    id = "0176e4b4-9a13-43d1-9eb1-5792f908126f"
    analysis = dao.get_analysis(id)
    eval_results = [evaluate_domain(id, domain.domain)
                    for domain in analysis.domains]

    print(f"{eval_results}")
    # for d in ["bitchipdigital.com"]:
    #     print(HistoricalOrganicTrafficRule().eval(EvalContext(id, d)))


if __name__ == "__main__":
    main()
    # get_domain_lang("www.ahrefs.com")
    # get_domain_lang("www.dzen.ru")
    # get_domain_lang("dimokratiki.gr")
