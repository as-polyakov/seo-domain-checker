import os
import sqlite3
from functools import wraps
from sqlite3 import Connection

from alembic import command
from alembic.config import Config
from enum import Enum

class LinkDirection(str, Enum):
    IN = "in"
    OUT = "out"

project_root = os.path.abspath(os.getcwd())
DB_PATH = os.path.join(project_root, "ahrefs_data.db")

def init_database(db_path:str = DB_PATH, alembic_ini_path: str = "alembic.ini", use_alembic: bool = True) -> Connection:
    if not db_path:
        raise RuntimeError("Database not configured. Provide db_path during initialization.")
    alembic_cfg = Config(alembic_ini_path)
    db_url = f"sqlite:///{db_path}"
    print(alembic_cfg.get_alembic_option("script_location"))
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(alembic_cfg, "head")

    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
    # Enable foreign key constraints
    conn.execute("PRAGMA foreign_keys = ON")
    return conn



def persist_domain_categories(conn: Connection, target_id: str, domain_categories):
    try:
        cur = conn.cursor()
        for domain, category in domain_categories.items():
            update_query = """
                            UPDATE batch_analysis SET domain_category = ? WHERE target_id = ? AND domain = ?
                        """

            values = (
                category,
                target_id,
                domain
            )
            cur.execute(update_query, values)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
