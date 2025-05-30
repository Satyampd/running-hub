from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.scrapers.scraper_manager import ScraperManager
from app.core.config import settings # Assuming settings are here
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Running Events Hub API",
    description="API for managing running events and clubs in India",
    version="1.0.0"
)

# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = [
    # Local development
    "http://localhost:5173",
    "http://192.168.1.33:5173",
    # Render domains
    "https://running-events-hub-frontend.onrender.com",
    "https://running-events-hub-api.onrender.com",
]

# In production, allow all origins if specified
if os.getenv("ALLOW_ALL_ORIGINS", "").lower() == "true":
    ALLOWED_ORIGINS.append("*")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

# # --- APScheduler Setup ---
# scheduler = AsyncIOScheduler()
# scraper_manager_instance = ScraperManager() # Create a single instance

# async def scheduled_scrape_job():
#     logger.info("Starting scheduled scraping job via APScheduler...")
#     try:
#         await scraper_manager_instance.scrape_all_events()
#         logger.info("Scheduled scraping job completed successfully.")
#     except Exception as e:
#         logger.error(f"Error during scheduled scraping job: {e}")

# @app.on_event("startup")
# async def startup_event():
#     # Schedule the job to run every 2 days.
#     # You can adjust 'days=2' or use 'hours', 'minutes' for more frequent runs.
#     # For example, cron expression: day_of_week='*', hour='3', minute='0', second='0', day='*/2'
#     # This runs at 3 AM every 2 days.
#     # For simpler "every 2 days from now", use days=2.
#     scheduler.add_job(scheduled_scrape_job, "interval", days=2, misfire_grace_time=3600) # Misfire grace time of 1 hour
#     scheduler.start()
#     logger.info("APScheduler started, scrape job scheduled.")

# @app.on_event("shutdown")
# async def shutdown_event():
#     scheduler.shutdown()
#     logger.info("APScheduler shut down.")
# # --- End APScheduler Setup ---

@app.get("/")
async def root():
    return {
        "message": "Welcome to Running Events Hub API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 