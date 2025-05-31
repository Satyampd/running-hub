from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks, Request
from fastapi.security import APIKeyHeader
from typing import Annotated

from app.scrapers.scraper_manager import ScraperManager
from app.core.config import settings # Assuming you have a settings module for config
from app.core.logging_config import get_logger # Import the new logger

logger = get_logger(__name__) # Initialize logger
router = APIRouter()

# Simple secret key authentication (replace with a more robust solution if needed)
API_KEY_NAME = "X-API-Key" 
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    logger.debug("Attempting API key validation.")
    if api_key == settings.SCRAPING_API_KEY: # Store your actual key in settings
        logger.info("API key validated successfully.")
        return api_key
    else:
        logger.warning("API key validation failed.")
        raise HTTPException(status_code=403, detail="Could not validate credentials")

@router.post("/trigger-scrape", summary="Trigger a full scrape of all event sources")
async def trigger_scrape_all(
    request: Request, # Add Request
    background_tasks: BackgroundTasks,
    api_key: str = Depends(get_api_key),
    secret_message: Annotated[str, Body(embed=True)] = None
):
    logger.info(f"POST /trigger-scrape request from {request.client.host}")
    """
    Triggers a background task to scrape all events from all configured sources.
    Requires a valid API key and an optional secret message.
    """
    if secret_message != settings.SCRAPING_SECRET_MESSAGE: # Add a secret message for extra check
         logger.warning("Invalid secret message for /trigger-scrape.")
         raise HTTPException(status_code=403, detail="Invalid secret message")
    logger.info("Secret message validated for /trigger-scrape.")

    scraper_manager = ScraperManager() # You might want to manage this instance via dependency injection

    async def scrape_task():
        logger.info("Starting background scraping task for all sources...")
        await scraper_manager.scrape_all_events()
        logger.info("Background scraping task for all sources finished.")

    background_tasks.add_task(scrape_task)
    logger.info("Scraping all events task added to background.")
    return {"message": "Scraping process initiated in the background."}

@router.post("/trigger-source-scrape/{source_name}", summary="Trigger a scrape for a specific source")
async def trigger_scrape_source(
    source_name: str,
    request: Request, # Add Request
    background_tasks: BackgroundTasks,
    api_key: str = Depends(get_api_key),
    secret_message: Annotated[str, Body(embed=True)] = None
):
    logger.info(f"POST /trigger-source-scrape/{source_name} request from {request.client.host}")
    """
    Triggers a background task to scrape events from a specific source.
    Requires a valid API key and an optional secret message.
    """
    if secret_message != settings.SCRAPING_SECRET_MESSAGE:
        logger.warning(f"Invalid secret message for /trigger-source-scrape/{source_name}.")
        raise HTTPException(status_code=403, detail="Invalid secret message")
    logger.info(f"Secret message validated for /trigger-source-scrape/{source_name}.")

    scraper_manager = ScraperManager() 

    async def scrape_task():
        logger.info(f"Starting background scraping task for source: {source_name}...")
        await scraper_manager.scrape_events_from_source(source_name)
        logger.info(f"Background scraping task for source {source_name} finished.")

    background_tasks.add_task(scrape_task)
    logger.info(f"Scraping task for source {source_name} added to background.")
    return {"message": f"Scraping process for source {source_name} initiated in the background."}

@router.post("/clear-cache", summary="Clear scraper cache")
async def clear_scraper_cache(
    request: Request, # Add Request
    api_key: str = Depends(get_api_key),
    source: Annotated[str, Body(embed=True, description="Optional: specific source to clear cache for. If omitted, clears all.")] = None,
    secret_message: Annotated[str, Body(embed=True)] = None
):
    logger.info(f"POST /clear-cache request from {request.client.host} for source: {source if source else 'all'}")
    """
    Clears the cache for a specific event source or all sources.
    Requires a valid API key and an optional secret message.
    """
    if secret_message != settings.SCRAPING_SECRET_MESSAGE:
        logger.warning("Invalid secret message for /clear-cache.")
        raise HTTPException(status_code=403, detail="Invalid secret message")
    logger.info("Secret message validated for /clear-cache.")

    scraper_manager = ScraperManager()
    scraper_manager.clear_cache(source=source if source else None)
    if source:
        logger.info(f"Cache cleared for source: {source}")
        return {"message": f"Cache cleared for source: {source}"}
    else:
        logger.info("All scraper caches cleared.")
        return {"message": "All scraper caches cleared."}

