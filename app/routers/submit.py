from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy import text

from ..db import db_conn

router = APIRouter(prefix="/api", tags=["submit"])

class Submission(BaseModel):
    """
    Валидация данных, аккуратные длины и валидный email
    """

    name: constr(strip_whitespace=True, min_length=1, max_length=100) #type: ignore
    email: EmailStr
    message: constr(strip_whitespace=True, max_length=2000) = "" #type: ignore


@router.post("/submit")
def submit(payload: Submission):
    """
    принимаем json из формы и сохраняем в бд 
    """

    try:
        with db_conn() as conn:
            conn.execute(
                text("""
                     INSERT INTO form_submissions (name, email, message)
                     VALUES (:name, :email, :message)
                     """),
                     {"name": payload.name, "email": payload.email, "message": payload.message}
            )
            return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="db error")