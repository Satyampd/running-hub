from typing import List, Dict, Any
import uuid
from .india_running_scraper import IndiaRunningScraper
from .citywoofer_scraper import CityWooferScraper
from .bhaago_india_scraper import BhaagoIndiaScraper
from ..cache.cache_manager import CacheManager
import asyncio
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperManager:
    def __init__(self, cache_duration_hours: int = 6, max_retries: int = 3):
        self.scrapers = [
            IndiaRunningScraper(),
            CityWooferScraper(),
            BhaagoIndiaScraper()
        ]
        self.cache_manager = CacheManager(cache_duration_hours=cache_duration_hours)
        self.max_retries = max_retries
    
    async def _scrape_with_retry(self, scraper) -> List[Dict[str, Any]]:
        """Attempt to scrape with retries on failure"""
        source = scraper.__class__.__name__.replace('Scraper', '')
        
        # Check cache first
        if self.cache_manager.is_cache_valid(source):
            logger.info(f"Using cached data for {source}")
            try:
                return self.cache_manager.get_cached_events(source)
            except Exception as e:
                logger.error(f"Error reading cache for {source}: {e}")
                logger.info(f"Clearing corrupt cache for {source}")
                self.cache_manager.clear_cache(source)
                # Continue to scrape
            
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Scraping {source} (Attempt {attempt + 1}/{self.max_retries})")
                async with scraper:  # Use context manager to handle session
                    events = await scraper.scrape_events()
                
                # Add timestamp and source to events
                for event in events:
                    event['scraped_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    if 'source' not in event:
                        event['source'] = source
                    if "id" not in event:
                        event["id"] = str(uuid.uuid4())
                
                # Cache the results if we got any events
                if events:
                    logger.info(f"Caching {len(events)} events for {source}")
                    self.cache_manager.cache_events(source, events)
                    return events
                
                if attempt < self.max_retries - 1:
                    logger.warning(f"No events found for {source}, retrying...")
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"All attempts failed for {source}")
                    return []
                    
            except Exception as e:
                logger.error(f"Error scraping {source} (Attempt {attempt + 1}): {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"All attempts failed for {source}")
                    return []
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

    async def scrape_all_events(self) -> List[Dict[str, Any]]:
        """Scrape events from all configured sources"""
        all_events = []
        
        for scraper in self.scrapers:
            try:
                events = await self._scrape_with_retry(scraper)
                all_events.extend(events)
            except Exception as e:
                logger.error(f"Error scraping {scraper.__class__.__name__}: {str(e)}")
                continue
            
        logger.info(f"Total events scraped: {len(all_events)}")
        return all_events

    async def scrape_events_from_source(self, source: str) -> List[Dict[str, Any]]:
        """Scrape events from a specific source"""
        scraper = next(
            (s for s in self.scrapers if s.__class__.__name__.lower().replace('scraper', '') == source.lower()),
            None
        )
        
        if not scraper:
            logger.error(f"No scraper found for source: {source}")
            return []
            
        try:
            events = await self._scrape_with_retry(scraper)
            return events
        except Exception as e:
            logger.error(f"Error scraping {source}: {str(e)}")
            return []

    def clear_cache(self, source: str = None):
        """Clear cache for a specific source or all sources"""
        self.cache_manager.clear_cache(source) 