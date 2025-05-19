import asyncio
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.scrapers.scraper_manager import ScraperManager
from app.db.base import SessionLocal
from app.models.event import Event
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import create_engine
from app.core.config import settings
import logging
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def scrape_and_save():
    """Scrape events and save them to the database"""
    try:
        # Initialize scraper
        scraper = ScraperManager()
        
        # Scrape events
        logger.info("Starting to scrape events...")
        events = await scraper.scrape_all_events()
        logger.info(f"Scraped {len(events)} events")
        
        # Save to database
        db = SessionLocal()
        try:
            for event_data in events:
                # Convert string UUID to UUID object if needed
                if isinstance(event_data.get('id'), str):
                    event_data['id'] = uuid.UUID(event_data['id'])
                elif 'id' not in event_data:
                    event_data['id'] = uuid.uuid4()

                # Check if event exists
                existing_event = db.query(Event).filter(Event.url == event_data['url']).first()
                
                if existing_event:
                    # Update existing event
                    for key, value in event_data.items():
                        setattr(existing_event, key, value)
                else:
                    # Create new event
                    new_event = Event(**event_data)
                    db.add(new_event)
            
            db.commit()
            logger.info("Successfully saved events to database")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving to database: {str(e)}")
            raise
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error in scrape_and_save: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(scrape_and_save()) 