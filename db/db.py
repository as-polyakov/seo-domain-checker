import sqlite3
from sqlite3 import Connection

from alembic import command
from alembic.config import Config


def init_database(db_path, alembic_ini_path: str = "alembic.ini", use_alembic: bool = True) -> Connection:
    if not db_path:
        raise RuntimeError("Database not configured. Provide db_path during initialization.")
    alembic_cfg = Config(alembic_ini_path)
    db_url = f"sqlite:///{db_path}"
    print(alembic_cfg.get_alembic_option("script_location"))
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(alembic_cfg, "head")

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
    # Enable foreign key constraints
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
