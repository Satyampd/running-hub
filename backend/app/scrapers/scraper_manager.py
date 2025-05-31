from typing import List, Dict, Any
import uuid
from .india_running_scraper import IndiaRunningScraper
from .india_running_scraper_w_api import IndiaRunningAPI
from .citywoofer_scraper import CityWooferScraper
from .bhaago_india_scraper import BhaagoIndiaScraper
from ..cache.cache_manager import CacheManager
import asyncio
from datetime import datetime
from app.core.logging_config import get_logger

logger = get_logger(__name__)

class ScraperManager:
    def __init__(self, cache_duration_hours: int = 24, max_retries: int = 3):
        self.scrapers = [
            IndiaRunningAPI(),
            # CityWooferScraper(), 
            BhaagoIndiaScraper()
        ]
        self.cache_manager = CacheManager(cache_duration_hours=cache_duration_hours)
        self.max_retries = max_retries
        logger.info(f"ScraperManager initialized with {len(self.scrapers)} scrapers and cache duration {cache_duration_hours} hours.")
    
    async def _scrape_with_retry(self, scraper) -> List[Dict[str, Any]]:
        """Attempt to scrape with retries on failure"""
        source = scraper.__class__.__name__.replace('Scraper', '').replace('API', '')
        
        # Check cache first
        if self.cache_manager.is_cache_valid(source):
            logger.info(f"Using cached data for {source}.")
            try:
                cached_data = self.cache_manager.get_cached_events(source)
                if cached_data:
                    logger.debug(f"Retrieved {len(cached_data)} events from cache for {source}.")
                    return cached_data
                else:
                    logger.warning(f"Cache for {source} is valid but returned no data. Will attempt scrape.")
            except Exception as e:
                logger.error(f"Error reading cache for {source}: {e}. Clearing corrupt cache and attempting scrape.", exc_info=True)
                self.cache_manager.clear_cache(source)
                # Continue to scrape
            
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Scraping {source} (Attempt {attempt + 1}/{self.max_retries}).")
                async with scraper:  # Use context manager to handle session
                    events = await scraper.scrape_events()
                
                # Add timestamp and source to events
                for event in events:
                    event['scraped_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    if 'source' not in event:
                        event['source'] = source
                    if "id" not in event:
                        event["id"] = str(uuid.uuid4())
                
                if events:
                    logger.info(f"Successfully scraped {len(events)} events from {source}.")
                    logger.info(f"Caching {len(events)} events for {source}.")
                    self.cache_manager.cache_events(source, events)
                    return events
                else:
                    logger.warning(f"No events found for {source} on attempt {attempt + 1}.")
                
                if attempt < self.max_retries - 1:
                    wait_time = 2 ** attempt
                    logger.info(f"Retrying {source} in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)  # Exponential backoff
                else:
                    logger.error(f"All {self.max_retries} attempts failed for {source}. No events retrieved.")
                    return []
                    
            except Exception as e:
                logger.error(f"Error scraping {source} (Attempt {attempt + 1}/{self.max_retries}): {e}", exc_info=True)
                if attempt < self.max_retries - 1:
                    wait_time = 2 ** attempt
                    logger.info(f"Retrying {source} in {wait_time} seconds due to error...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"All {self.max_retries} attempts failed for {source} due to error: {e}", exc_info=True)
                    return []

    async def scrape_all_events(self) -> List[Dict[str, Any]]:
        logger.info("Starting scrape_all_events process.")
        """Scrape events from all configured sources"""
        all_events = []
        tasks = []

        for scraper in self.scrapers:
            tasks.append(self._scrape_with_retry(scraper))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            scraper_name = self.scrapers[i].__class__.__name__
            if isinstance(result, Exception):
                logger.error(f"Exception during scrape for {scraper_name}: {result}", exc_info=result)
            elif isinstance(result, list):
                logger.info(f"Successfully gathered {len(result)} events from {scraper_name}.")
                all_events.extend(result)
            else:
                logger.warning(f"Unexpected result type from {scraper_name}: {type(result)}. Data: {str(result)[:200]}")

        logger.info(f"Total events scraped from all sources: {len(all_events)}.")
        return all_events

    async def scrape_events_from_source(self, source_name_param: str) -> List[Dict[str, Any]]:
        logger.info(f"Starting scrape_events_from_source for source: {source_name_param}.")
        """Scrape events from a specific source"""
        normalized_source_name = source_name_param.lower().replace('scraper', '').replace('api', '')
        scraper = next(
            (s for s in self.scrapers if s.__class__.__name__.lower().replace('scraper', '').replace('api', '') == normalized_source_name),
            None
        )
        
        if not scraper:
            logger.error(f"No scraper found for source: {source_name_param} (normalized: {normalized_source_name}). Available: {[s.__class__.__name__ for s in self.scrapers]}")
            return []
            
        logger.info(f"Found scraper: {scraper.__class__.__name__} for source: {source_name_param}.")
        try:
            events = await self._scrape_with_retry(scraper)
            logger.info(f"Retrieved {len(events)} events from source: {source_name_param}.")
            return events
        except Exception as e:
            logger.error(f"Error scraping source {source_name_param}: {e}", exc_info=True)
            return []

    def clear_cache(self, source: str = None):
        logger.info(f"Clearing cache for source: {source if source else 'all'}.")
        """Clear cache for a specific source or all sources"""
        self.cache_manager.clear_cache(source)
        if source:
            logger.info(f"Cache cleared successfully for source: {source}.")
        else:
            logger.info("All scraper caches cleared successfully.") 