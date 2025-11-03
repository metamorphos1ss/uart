from fastapi import APIRouter
from sqlalchemy import text
from ..db import engine

router = APIRouter(tags=["health"])

@router.get("/healthz")
def healthz():
    try:
        with engine.connect() as conn:
            row = conn.execute(text("SELECT 1 as ok")).scalar_one()
        return {"ok": True, "db": (row == 1)}
    except Exception:
        return {"ok": True, "db": False}