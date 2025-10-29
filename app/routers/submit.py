from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy import text

from ..db import db_conn

router = APIRouter(prefix="/api", tags=["submit"])

class SubmissionFeedback(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=100) #type: ignore
    phone: constr(strip_whitespace=True, min_length=5, max_length=32) #type: ignore
    message: constr(strip_whitespace=True, max_length=2000) = "" #type: ignore
    call_me: bool = False


@router.post("/submit_feedback")
def submit(payload: SubmissionFeedback):
    try:
        with db_conn() as conn:
            conn.execute(
                text("""
                     INSERT INTO submission_feedback(name, phone, message, call_me)
                     VALUES (:name, :phone, :message, :call_me)
                     """),
                     {
                         "name": payload.name,
                         "phone": payload.phone,
                         "message": payload.message,
                         "call_me": 1 if payload.call_me else 0,
                     }
            )
            return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="db error")