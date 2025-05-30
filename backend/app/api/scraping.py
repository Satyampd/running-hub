from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from fastapi.security import APIKeyHeader
from typing import Annotated

from app.scrapers.scraper_manager import ScraperManager
from app.core.config import settings # Assuming you have a settings module for config

router = APIRouter()

# Simple secret key authentication (replace with a more robust solution if needed)
API_KEY_NAME = "X-API-Key" 
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key == settings.SCRAPING_API_KEY: # Store your actual key in settings
        return api_key
    else:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

@router.post("/trigger-scrape", summary="Trigger a full scrape of all event sources")
async def trigger_scrape_all(
    background_tasks: BackgroundTasks,
    api_key: str = Depends(get_api_key),
    secret_message: Annotated[str, Body(embed=True)] = None
):
    """
    Triggers a background task to scrape all events from all configured sources.
    Requires a valid API key and an optional secret message.
    """
    if secret_message != settings.SCRAPING_SECRET_MESSAGE: # Add a secret message for extra check
         raise HTTPException(status_code=403, detail="Invalid secret message")

    scraper_manager = ScraperManager() # You might want to manage this instance via dependency injection

    async def scrape_task():
        print("Starting background scraping task...")
        await scraper_manager.scrape_all_events()
        print("Background scraping task finished.")

    background_tasks.add_task(scrape_task)
    return {"message": "Scraping process initiated in the background."}

@router.post("/trigger-source-scrape/{source_name}", summary="Trigger a scrape for a specific source")
async def trigger_scrape_source(
    source_name: str,
    background_tasks: BackgroundTasks,
    api_key: str = Depends(get_api_key),
    secret_message: Annotated[str, Body(embed=True)] = None
):
    """
    Triggers a background task to scrape events from a specific source.
    Requires a valid API key and an optional secret message.
    """
    if secret_message != settings.SCRAPING_SECRET_MESSAGE:
        raise HTTPException(status_code=403, detail="Invalid secret message")

    scraper_manager = ScraperManager() 

    async def scrape_task():
        print(f"Starting background scraping task for source: {source_name}...")
        await scraper_manager.scrape_events_from_source(source_name)
        print(f"Background scraping task for source {source_name} finished.")

    background_tasks.add_task(scrape_task)
    return {"message": f"Scraping process for source {source_name} initiated in the background."}

@router.post("/clear-cache", summary="Clear scraper cache")
async def clear_scraper_cache(
    api_key: str = Depends(get_api_key),
    source: Annotated[str, Body(embed=True, description="Optional: specific source to clear cache for. If omitted, clears all.")] = None,
    secret_message: Annotated[str, Body(embed=True)] = None
):
    """
    Clears the cache for a specific event source or all sources.
    Requires a valid API key and an optional secret message.
    """
    if secret_message != settings.SCRAPING_SECRET_MESSAGE:
        raise HTTPException(status_code=403, detail="Invalid secret message")

    scraper_manager = ScraperManager()
    scraper_manager.clear_cache(source=source if source else None)
    if source:
        return {"message": f"Cache cleared for source: {source}"}
    else:
        return {"message": "All scraper caches cleared."}

