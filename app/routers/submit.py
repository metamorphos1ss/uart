from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import constr, BaseModel
from uuid import uuid4
from datetime import datetime
from pathlib import Path
import hashlib
from sqlalchemy import text
import zipfile

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

def _save_resume(dst_base: Path, upload: UploadFile) -> tuple[int, str, str, Path]:
    sha = hashlib.sha256()
    size = 0

    first_chunk = upload.file.read(512 * 1024)
    if not first_chunk:
        raise HTTPException(status_code=422, detail="empty file")

    is_pdf = first_chunk.startswith(b"%PDF-")
    is_zip = first_chunk.startswith(b"PK\x03\x04")

    if not (is_pdf or is_zip):
        raise HTTPException(status_code=415, detail='resume must be PDF or DOCX')

    ext = ".pdf" if is_pdf else ".docx"
    mime = "application/pdf" if is_pdf else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    dst = dst_base.with_suffix(ext)

    try:
        with dst.open("wb") as f:
            size += len(first_chunk)
            if size > MAX_BODY_BYTES:
                raise HTTPException(status_code=413, detail=f"file too large (>{MAX_BODY_BYTES/1024/1024}MB)")
            sha.update(first_chunk)
            f.write(first_chunk)

            while True:
                chunk = upload.file.read(512*1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_BODY_BYTES:
                    raise HTTPException(status_code=413, detail=f'file too large (>{MAX_BODY_BYTES/1024/1024}MB)')
                sha.update(chunk)
                f.write(chunk)
    finally:
        upload.file.close()

    if is_zip:
        try:
            with zipfile.ZipFile(dst) as zf:
                if "word/document.xml" not in zf.namelist():
                    dst.unlink(missing_ok=True)
                    raise HTTPException(status_code=415, detail='resume must be PDF or DOCX')
        except HTTPException:
            raise
        except Exception:
            dst.unlink(missing_ok=True)
            raise HTTPException(status_code=415, detail="resume must be PDF or DOCX")
    return size, sha.hexdigest(), mime, dst

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
    if resume.content_type not in ('application/pdf', "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", "application/zip"):
        raise HTTPException(status_code=415, detail='resume must be PDF or DOCX')
    
    now = datetime.utcnow()
    subdir = UPLOAD_ROOT / f"{now:%Y}" / f"{now:%m}" #type: ignore
    _ensure_dir(Path(subdir))


    base = subdir / uuid4().hex #type: ignore
    size_bytes, sha256, mime_type, dst = _save_resume(base, resume)

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
                    "mime_type": mime_type,
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