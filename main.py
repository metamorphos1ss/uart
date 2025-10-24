import pymysql
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

conn = pymysql.connect(
    host="127.0.0.1",
    username="uart",
    password="password",
    database="uart_prod",
    charset="utf8mb4"
)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse("static/index.html")

@app.get("/healthz")
async def healthz():
    return {"ok": True}

@app.get("/api/submit")
async def submit():
    return {"api": True}