from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import PlainTextResponse
from fastapi import Request

from ..config import MAX_BODY_BYTES

class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            cl = request.headers.get("content-length")
            if cl and cl.isdigit() and int(cl) > MAX_BODY_BYTES:
                return PlainTextResponse("Payload is too large", status_code=413)
            
            body = await request.body()
            if len(body) > MAX_BODY_BYTES:
                return PlainTextResponse("Payload is too large", status_code=413)
            request._body = body
        return await call_next(request)