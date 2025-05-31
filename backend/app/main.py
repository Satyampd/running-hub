
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.routing import APIRouter
import os
import logging
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager

# from app.scrapers.scraper_manager import ScraperManager  # Commented for now
from app.api.routes import router as api_router

# Logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# CORS Origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.1.33:5173",
    "https://running-events-hub-frontend.onrender.com",
    "https://running-events-hub-api.onrender.com",
]

if os.getenv("ALLOW_ALL_ORIGINS", "").lower() == "true":
    ALLOWED_ORIGINS.append("*")

# APScheduler setup
scheduler = AsyncIOScheduler()
EVENTS_URL = "https://running-events-hub-api.onrender.com/api/events"

async def scheduled_ping_job():
    logger.info(f"Pinging URL: {EVENTS_URL}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(EVENTS_URL)
            response.raise_for_status()
            logger.info(f"Ping successful. Status: {response.status_code}")
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        logger.error(f"Unexpected error during ping: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler.add_job(scheduled_ping_job, "interval", minutes=14, misfire_grace_time=300)
    scheduler.start()
    logger.info("APScheduler started. Ping job scheduled every 14 minutes.")
    yield
    # Shutdown
    scheduler.shutdown()
    logger.info("APScheduler shut down.")

# FastAPI app with lifespan handler
app = FastAPI(
    title="Running Events Hub API",
    description="API for managing running events and clubs in India",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Running Events Hub API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }