from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.routing import APIRouter
import os
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager

from app.core.logging_config import get_logger # Import the new logger
# from app.scrapers.scraper_manager import ScraperManager  # Commented for now
from app.api.routes import router as api_router

# Logging
logger = get_logger(__name__) # Use the new logger

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
            logger.info(f"Ping successful. Status: {response.status_code}, Response: {response.text[:200]}...") # Log some response text
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error during ping: {e.response.status_code} - {e.response.text}", exc_info=True)
    except Exception as e:
        logger.error(f"Unexpected error during ping: {e}", exc_info=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup...")
    # Startup
    scheduler.add_job(scheduled_ping_job, "interval", minutes=14, misfire_grace_time=300)
    scheduler.start()
    logger.info("APScheduler started. Ping job scheduled every 14 minutes.")
    yield
    # Shutdown
    logger.info("Application shutdown...")
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
logger.info(f"CORS middleware added with allowed origins: {ALLOWED_ORIGINS}")

# API Routes
app.include_router(api_router, prefix="/api")
logger.info("API routes included.")

@app.get("/")
async def root(request: Request): # Add request for logging
    logger.info(f"Root endpoint accessed by {request.client.host}")
    return {
        "message": "Welcome to Running Events Hub API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }