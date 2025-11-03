import os
from dotenv import load_dotenv
from typing import Set

load_dotenv()

def _getenv(key: str, default: str | int = "") -> str:
    return os.getenv(key, default)

DATABASE_URL: str = _getenv(
    "DATABASE_URL",
    "None"
)

MAX_BODY_BYTES: int = 1024*1024 * int(_getenv("MAX_BODY_BYTES", str(1024 * 1024)))

RATE_SECONDS: int = int(_getenv("RATE_SECONDS", 20))

DB_POOL_SIZE: int = int(_getenv("DB_POOL_SIZE", "5"))

UPLOAD_ROOT: str = _getenv(
    "UPLOAD_ROOT",
    "/srv/uart/uploads/resume"
)

TOKEN: str = _getenv(
    "TOKEN",
    "None"
)

_admin_ids = _getenv(
    "ADMIN_IDS",
    "None"
)

ADMIN_IDS = {int(x) for x in _admin_ids.split(',') if x.strip().isdigit()}

TELEGRAM_API_BASE = f"https://api.telegram.org/bot{TOKEN}"
