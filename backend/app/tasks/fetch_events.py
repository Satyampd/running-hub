import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models.event import Event
from app.scrapers.scraper_manager import ScraperManager
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def fetch_and_store_events():
    """Fetch events from all sources and store in database"""
    try:
        scraper_manager = ScraperManager()
        events = await scraper_manager.scrape_all_events()
        
        # Store in database
        db = SessionLocal()
        try:
            # Clear old events
            db.query(Event).delete()
            
            # Insert new events
            for event_data in events:
                event = Event(
                    id=event_data.get("id"),
                    title=event_data["title"],
                    date=event_data["date"],
                    location=event_data["location"],
                    categories=event_data.get("categories", []),
                    price=event_data.get("price", "Price TBD"),
                    url=event_data["url"],
                    source=event_data["source"],
                    description=event_data.get("description"),
                )
                db.add(event)
            
            db.commit()
            logger.info(f"Successfully stored {len(events)} events in database")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error storing events in database: {str(e)}")
            raise
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(fetch_and_store_events()) 