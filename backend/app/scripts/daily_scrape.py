import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime
import logging
from sqlalchemy.orm import Session

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.db.base import SessionLocal
from app.scrapers.scraper_manager import ScraperManager
from app.scrapers.db_handler import EventDBHandler
from app.models.event import Event

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

async def run_daily_scrape():
    """Run BhaagoIndia and IndiaRunning scrapers and update the database with new events"""
    try:
        logger.info("Starting daily scraping process...")
        
        # Initialize scraper manager
        scraper_manager = ScraperManager()
        
        # Get events from specific sources
        logger.info("Scraping events from BhaagoIndia and IndiaRunning...")
        events = []
        
        # Scrape IndiaRunning
        india_running_events = await scraper_manager.scrape_events_from_source('indiarunning')
        if india_running_events:
            events.extend(india_running_events)
            logger.info(f"Found {len(india_running_events)} events from IndiaRunning")
        
        # Scrape BhaagoIndia
        bhaago_events = await scraper_manager.scrape_events_from_source('bhaagoindia')
        if bhaago_events:
            events.extend(bhaago_events)
            logger.info(f"Found {len(bhaago_events)} events from BhaagoIndia")
        
        if not events:
            logger.warning("No events found from any source")
            return
            
        logger.info(f"Found {len(events)} total events")
        
        # Save events to database
        db = SessionLocal()
        try:
            # Clear old events
            logger.info("Clearing old events from database...")
            db.query(Event).delete()
            
            # Save new events
            logger.info("Saving new events to database...")
            db_handler = EventDBHandler(db)
            saved_events = db_handler.upsert_events(events)
            logger.info(f"Successfully saved {len(saved_events)} events to database")
            
        except Exception as e:
            logger.error(f"Error managing database: {str(e)}")
            raise
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error in daily scraping process: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(run_daily_scrape()) 