from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse

from .db import init_db
from .middleware.body_limit import BodySizeLimitMiddleware

from .routers.health import router as health_router
from .routers.submit import router as submit_router

app = FastAPI(title="Backend", version="1.0.0")

#static and root
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def root():
    return FileResponse("static/index.html") 

#middlewares
app.add_middleware(BodySizeLimitMiddleware)


#routers
app.include_router(health_router)
app.include_router(submit_router)

@app.on_event("startup")
def on_startup():
    init_db()