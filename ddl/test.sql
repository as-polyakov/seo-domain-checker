select * from batch_analysis


delete from batch_analysis
delete from ahrefs_org_traffic_country


-- Ahrefs DR > 30
select * from batch_analysis where domain_rating > 30
-- org_traffic >= 10000
select * from batch_analysis where org_traffic > 10000


select a.domain_rating, a.* from batch_analysis a
                            where domain_rating >= 60
                            and backlinks_dofollow < 1500

select * from ahrefs_metrics_history

drop table  ahrefs_top_pages
-- Table for top pages
CREATE TABLE ahrefs_top_pages (
                                  target_id TEXT NOT NULL,
                                  domain TEXT, -- ISO country code (2 chars)
                                  country_code TEXT, -- ISO country code (2 chars)
                                  date TEXT, --SO-8601 strings (YYYY-MM-DDTHH:MM:SSZ)
                                  position INTEGER,
                                  top_keyword_best_position_title TEXT,
                                  sum_traffic INTEGER,
                                  PRIMARY KEY (target_id, domain, country_code, date, position)
);

drop table  ahrefs_metrics_history;

CREATE TABLE ahrefs_metrics_history (
                                        target_id TEXT NOT NULL,
                                        domain TEXT, -- ISO country code (2 chars)
                                        country_code TEXT, -- ISO country code (2 chars)
                                        date TEXT, --SO-8601 strings (YYYY-MM-DDTHH:MM:SSZ)
                                        org_cost INTEGER,
                                        org_traffic INTEGER,
                                        paid_cost INTEGER,
                                        paid_traffic INTEGER,
                                        PRIMARY KEY (target_id, domain, country_code, date)
);

