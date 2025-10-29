import os
from dotenv import load_dotenv
from typing import Set

load_dotenv()

def _getenv(key: str, default: str = "") -> str:
    return os.getenv(key, default)

DATABASE_URL: str = _getenv(
    "DATABASE_URL",
    "mysql+pymysql://uart:GE1EW4wxJwaBP4ZP9Yew@192.168.1.7:3306/uart_prod?charset=utf8mb4"
)

MAX_BODY_BYTES: int = 1024*1024 * int(_getenv("MAX_BODY_BYTES", str(1024 * 1024)))

DB_POOL_SIZE: int = int(_getenv("DB_POOL_SIZE", "5"))

UPLOAD_ROOT: str = _getenv(
    "UPLOAD_ROOT",
    "/srv/uart/uploads/resume"
)


TOKEN: str = _getenv(
    "TOKEN",
    "None"
)
print(TOKEN)