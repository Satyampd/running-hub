import asyncio
import sys
import os
from pathlib import Path
import logging
from datetime import datetime

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.db.base import SessionLocal
from app.scrapers.bhaago_india_scraper import BhaagoIndiaScraper
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

async def main():
    """Run the BhaagoIndia scraper and save events to the database"""
    try:
        # Initialize database session
        db = SessionLocal()
        try:
            # Clear existing events
            logger.info("Clearing existing events from database...")
            db.query(Event).delete()
            db.commit()
            logger.info("Successfully cleared existing events")
            
            # Initialize scraper with database connection
            scraper = BhaagoIndiaScraper(db=db)
            
            # Get events from BhaagoIndia
            logger.info("Starting BhaagoIndia scraper...")
            events = await scraper.scrape_events()
            
            if not events:
                logger.warning("No events found from BhaagoIndia")
                return
                
            logger.info(f"Found {len(events)} events from BhaagoIndia")
            
            # Save events to database
            db_handler = EventDBHandler(db)
            saved_events = db_handler.upsert_events(events)
            logger.info(f"Successfully saved {len(saved_events)} events to database")
            
            # Print summary of saved events
            print("\nSaved Events Summary:")
            print("=" * 80)
            for event in saved_events:
                print(f"\nTitle: {event.title}")
                print(f"Date: {event.date}")
                print(f"Location: {event.location}")
                print(f"Categories: {', '.join(event.categories) if event.categories else 'None'}")
                print(f"Price: {event.price}")
                print(f"URL: {event.url}")
                if event.description:
                    print(f"Description: {event.description[:200]}...")
                if event.registration_closes:
                    print(f"Registration Closes: {event.registration_closes}")
                print("-" * 40)
            
        except Exception as e:
            logger.error(f"Error saving events to database: {str(e)}")
            db.rollback()
            raise
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error running BhaagoIndia scraper: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 