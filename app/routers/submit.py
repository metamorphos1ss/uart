from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import constr, BaseModel
from uuid import uuid4
from datetime import datetime
from pathlib import Path
import hashlib
from sqlalchemy import text

from ..db import db_conn
from ..config import UPLOAD_ROOT, MAX_BODY_BYTES
from ..telegram_notify import notify_admins, notify_admins_document, format_feedback_msg, format_applicant_msg

router = APIRouter(prefix="/api", tags=["submit"])

UPLOAD_ROOT = Path(UPLOAD_ROOT)
class SubmissionFeedback(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=100) #type: ignore
    phone: constr(strip_whitespace=True, min_length=5, max_length=32) #type: ignore
    message: constr(strip_whitespace=True, max_length=2000) = "" #type: ignore
    call_me: bool = False


@router.post("/submit_feedback")
def submit(payload: SubmissionFeedback):
    try:
        with db_conn() as conn:
            res = conn.execute(
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
            row_id = res.lastrowid
        try:
            notify_admins(
                format_feedback_msg(
                    row_id=row_id,
                    name=payload.name,
                    phone=payload.phone,
                    message=payload.message,
                    call_me=1 if payload.call_me else 0,
                )
            )
        except Exception:
            pass
        
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="db error")



def _ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def _save_pdf(dst: Path, upload: UploadFile) -> tuple[int, str]:
    sha = hashlib.sha256()
    size = 0
    first = True
    with dst.open("wb") as file:
        while True:
            chunk = upload.file.read(512*1024)
            if not chunk:
                break
            if first:
                if not chunk.startswith(b"%PDF-"):
                    raise HTTPException(status_code=413, detail='resume must be pdf')
                first = False
            size += len(chunk)
            if size > MAX_BODY_BYTES:
                raise HTTPException(status_code=413, detail=f'file too large (>{MAX_BODY_BYTES/1024/1024}MB)')
            sha.update(chunk)
            file.write(chunk)
    return size, sha.hexdigest()

@router.post("/submit_applicants")
def submit_applicants(
    name: str = Form(...),
    phone: str = Form(...),
    message: str = Form(""),
    call_me: int = Form(0),
    resume: UploadFile = File(...),
):
    name = name.strip()
    phone = phone.strip()
    if not (1<=len(name) <= 100):
        raise HTTPException(status_code=422, detail='invalid name')
    if not (5 <= len(phone) <= 32):
        raise HTTPException(status_code=422, detail='inalid phone')
    if resume.content_type not in ('application/pdf', "application/octet-stream"):
        raise HTTPException(status_code=415, detail='resume must be PDF')
    
    
    subdir = f'{UPLOAD_ROOT}/{datetime.utcnow():%Y}/{datetime.utcnow():%m}'
    _ensure_dir(Path(subdir))
    filename = f"{uuid4().hex}.pdf"
    dst = Path(f'{subdir}/{filename}')

    try:
        size_bytes, sha256 = _save_pdf(dst, resume)
    finally:
        resume.file.close()

    try:
        with db_conn() as conn:
            res = conn.execute(
                text("""
                    INSERT INTO submission_applicants
                        (name, phone, message, call_me,
                        resume_path, original_name, mime_type, size_bytes, sha256)
                    VALUES
                        (:name, :phone, :message, :call_me,
                         :resume_path, :original_name, :mime_type, :size_bytes, :sha256)
                """),
                {
                    "name": name,
                    "phone": phone,
                    "message": message,
                    "call_me": 1 if call_me else 0,
                    "resume_path": str(dst),
                    "original_name": (resume.filename or "")[:255],
                    "mime_type": "application/pdf",
                    "size_bytes": size_bytes,
                    "sha256": sha256
                },
            )
            row_id = res.lastrowid
    except Exception:
        try:
            dst.unlink(missing_ok=True)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail='db error')

    caption = format_applicant_msg(
        row_id=row_id,
        name=name,
        phone=phone,
        message=message,
        call_me=1 if call_me else 0,
        original_name=(resume.filename or "resume.pdf"),
        size_bytes=size_bytes,
        sha256=sha256
    )


    try:
        notify_admins_document(dst, caption) #type: ignore
    except Exception:
        pass
    return {"ok": True}