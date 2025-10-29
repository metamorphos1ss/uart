# app/telegram_notify.py
from __future__ import annotations
import html
import logging
from typing import Iterable
from pathlib import Path

import httpx

from app.config import TELEGRAM_API_BASE, ADMIN_IDS

log = logging.getLogger(__name__)

def _escape(text: str) -> str:
    return html.escape(text, quote=False)

def _fmt_bytes(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024 #type: ignore
    return f"{n:.1f} GB"

def send_message(chat_id: int, text: str) -> None:
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        with httpx.Client(timeout=5.0) as client:
            r = client.post(f"{TELEGRAM_API_BASE}/sendMessage", json=payload)
            r.raise_for_status()
    except Exception as e:
        log.exception("Не смог отправить сообщение в TG: chat_id=%s err=%s", chat_id, e)

def send_document(chat_id: int, file_path: str | Path, caption_html: str = "") -> None:
    """
    Шлёт документ как загрузку файла (до ~50 МБ для ботов).
    """
    path = Path(file_path)
    if not path.exists():
        log.error("Файл не найден: %s", path)
        return
    files = {
        "document": (path.name, path.open("rb"), "application/pdf"),
    }
    data = {
        "chat_id": str(chat_id),
        "caption": caption_html,
        "parse_mode": "HTML",
    }
    try:
        with httpx.Client(timeout=20.0) as client:
            r = client.post(f"{TELEGRAM_API_BASE}/sendDocument", data=data, files=files)
            r.raise_for_status()
    except Exception as e:
        log.exception("Не смог отправить документ в TG: chat_id=%s file=%s err=%s", chat_id, path, e)

def notify_admins(text: str, admins: Iterable[int] | None = None) -> None:
    ids = list(admins or ADMIN_IDS)
    for cid in ids:
        send_message(cid, text)

def notify_admins_document(file_path: str | Path, caption_html: str = "", admins: Iterable[int] | None = None) -> None:
    ids = list(admins or ADMIN_IDS)
    for cid in ids:
        send_document(cid, file_path, caption_html)

def format_feedback_msg(row_id: int, name: str, phone: str, message: str, call_me: int) -> str:
    # call_me: 0 — обычная отправка, 1 — перезвонить
    tag = "📞 Перезвонить" if call_me else "📝 Заявка"
    return (
        f"{tag} <b>#{row_id}</b>\n"
        f"👤 <b>Имя:</b> {_escape(name)}\n"
        f"📱 <b>Телефон:</b> {_escape(phone)}\n"
        f"💬 <b>Комментарий:</b> {_escape(message or '—')}"
    )


def format_applicant_msg(
    *,
    row_id: int,
    name: str,
    phone: str,
    message: str,
    call_me: int,
    original_name: str,
    size_bytes: int,
    sha256: str,
) -> str:
    tag = "📞 Перезвонить" if call_me else "👔 Соискатель"
    sha_short = sha256[:12]
    return (
        f"{tag} <b>#{row_id}</b>\n"
        f"👤 <b>Имя:</b> {_escape(name)}\n"
        f"📱 <b>Телефон:</b> {_escape(phone)}\n"
        f"💬 <b>Комментарий:</b> {_escape(message or '—')}\n"
        f"📎 <b>Резюме:</b> {_escape(original_name or 'resume.pdf')} "
    )