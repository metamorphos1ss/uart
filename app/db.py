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
    create_feedback = """
    CREATE TABLE IF NOT EXISTS submission_feedback(
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        message TEXT,
        call_me TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone (phone)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """ 

    create_applicants = """
    CREATE TABLE IF NOT EXISTS submission_applicants(
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        -- база
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        message TEXT,
        call_me TINYINT(1) NOT NULL DEFAULT 0,

        -- файл + мета
        resume_path VARCHAR(1024) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
        size_bytes BIGINT UNSIGNED NOT NULL,
        sha256 CHAR(64) NOT NULL,
        uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        -- скан + ав
        scan_status ENUM('pending', 'clean', 'infected', 'error') NOT NULL DEFAULT 'pending',
        scanned_at TIMESTAMP NULL,
        scan_vendor VARCHAR(64) NULL,
        scan_meta JSON NULL,
        expires_at TIMESTAMP NULL,
        deleted_at TIMESTAMP NULL,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone(phone),
        INDEX idx_scan_status(scan_status),
        INDEX idx_expires(expires_at),
        INDEX idx_deleted(deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """

    with engine.begin() as conn:
        conn.execute(text(create_feedback))
        conn.execute(text(create_applicants))

@contextmanager
def db_conn():
    with engine.begin() as conn:
        yield conn


def execute(query: str, params: dict | tuple | None = None) -> Result:
    with engine.begin() as conn:
        return conn.execute(text(query), params or {})