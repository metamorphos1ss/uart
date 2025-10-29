from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Result
from contextlib import contextmanager

from .config import DATABASE_URL, DB_POOL_SIZE

engine: Engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=DB_POOL_SIZE,
    max_overflow=DB_POOL_SIZE,
    future=True,
)

def init_db() -> None:
    create_str = """
    CREATE TABLE IF NOT EXISTS submission_feeback(
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        message TEXT,
        call_me TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone (phone)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """ 

    with engine.begin() as conn:
        conn.execute(text(create_str))

@contextmanager
def db_conn():
    with engine.begin() as conn:
        yield conn


def execute(query: str, params: dict | tuple | None = None) -> Result:
    with engine.begin() as conn:
        return conn.execute(text(query), params or {})