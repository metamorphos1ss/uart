import time
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.config import RATE_SECONDS


class CooldownMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.cooldowns = {}
        self.paths = {
            "/api/submit_feedback",
            "/api/submit_applicants",
        }

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if request.method != "POST" or request.url.path not in self.paths:
            return await call_next(request)

        ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host
        key = (ip, request.url.path)
        now = time.time()
        last = self.cooldowns.get(key, 0)

        if now - last < RATE_SECONDS:
            retry_after = RATE_SECONDS - (now - last)
            return JSONResponse(
                status_code=429,
                content={"detail": "wait before retry", "retry_after": int(retry_after)},
                headers={"Retry-After": str(int(retry_after))}
            )

        self.cooldowns[key] = now
        return await call_next(request)
