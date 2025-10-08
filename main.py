import os
import uuid

from extract.extract import AhrefsClient, debug_requests_on
from db import db
from utils import get_badwords_by_language


def main():
    project_root = os.path.abspath(os.getcwd())
    db_path = os.path.join(project_root, "ahrefs_data.db")
    target_id = str(uuid.uuid4())
    date_from = "2022-01-01"
    query_date = "2025-01-01"

    client = AhrefsClient(
        api_token=os.environ.get("AHREFS_API_TOKEN"),
        db_path=db_path  # SQLite database file path
    )

    # Initialize database (creates tables if they don't exist)
    print("Initializing database...")
    conn = db.init_database(db_path)
    print("Database initialized successfully!")

    # Create targets for analysis
    targets = [
        {
            # "domain": "fmh.gr",
            "domain": "triestecafe.it",
            "mode": "subdomains",
            "protocol": "both",
        }
    ]

    # # Perform batch analysis
    # print(V"Querying batch analysis...")
    # results = client.batch_analysis(targets=targets)
    # print("Saving batch analysis to database...")
    # saved_target_ids = client.persist_batch_analysis(conn, target_id, results)
    # print(f"Successfully saved {len(saved_target_ids)} records to database")

    # print("Querying metrics...")
    # results_by_domain = client.query_metric_history(target_id=target_id, targets=targets, date_from=date_from)
    # for domain, result in results_by_domain.items():
    #     client.persist_metric_history(conn, target_id, domain, None, result)

    # print("Querying metrics...")
    # results_by_domain = client.query_top_pages(target_id, query_date, targets)
    # for domain, result in results_by_domain.items():
    #     client.persist_top_pages(conn, target_id, domain, None, query_date, result)

    # debug_requests_on()
    print("Querying badwords in backlinks anchors...")
    badwords = get_badwords_by_language("en")
    results_by_domain = client.query_backlinks_badwords(target_id, badwords, targets)
    client.persist_backlinks_badwords(conn, target_id, results_by_domain)
    for domain, result in results_by_domain.items():
        print("Domain:", domain)
        print("Result:", result)


if __name__ == "__main__":
    main()
    # get_domain_lang("www.ahrefs.com")
    # get_domain_lang("www.dzen.ru")
    # get_domain_lang("dimokratiki.gr")
