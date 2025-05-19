import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Set
from sqlalchemy.orm import Session

from app.scrapers.scraper_manager import ScraperManager
from app.db.session import SessionLocal
from app.models.event import Event
from app.scrapers.db_handler import EventDBHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SmartScraper:
    def __init__(self, debug=False):
        self.manager = ScraperManager()
        self.db: Session = SessionLocal()
        self.db_handler = EventDBHandler(self.db)
        self.debug = debug
        
    async def get_existing_urls(self) -> Set[str]:
        """Get all existing URLs from the database to avoid re-scraping"""
        try:
            urls = self.db.query(Event.url).all()
            return set([url[0] for url in urls])
        except Exception as e:
            logger.error(f"Error fetching existing URLs: {e}")
            return set()
    
    async def smart_scrape_events(self) -> Dict[str, Any]:
        """
        Scrape events intelligently:
        1. Get existing URLs from database
        2. Pass them to scrapers to avoid re-scraping
        3. Process only new or updated events
        4. Handle duplicates based on URL
        """
        results = {
            "new_events": 0,
            "updated_events": 0,
            "skipped_urls": 0,
            "errors": 0,
            "details": []
        }
        
        try:
            # Clear cache if in debug mode to force fresh scraping
            if self.debug:
                logger.info("Debug mode enabled, clearing all cache...")
                self.manager.clear_cache()
            
            # Get existing URLs from database
            existing_urls = await self.get_existing_urls()
            logger.info(f"Found {len(existing_urls)} existing URLs in database")
            
            # Get all events from scrapers
            all_events = await self.manager.scrape_all_events()
            logger.info(f"Scraped {len(all_events)} total events from all sources")
            
            # Process events and handle duplicates
            new_or_updated_events = []
            urls_processed = set()
            
            for event in all_events:
                url = event.get('url')
                
                # Skip events without URL
                if not url:
                    logger.warning(f"Skipping event without URL: {event.get('title')}")
                    continue
                
                # Skip duplicate URLs within current scrape batch
                if url in urls_processed:
                    results["skipped_urls"] += 1
                    continue
                
                # Mark URL as processed
                urls_processed.add(url)
                
                # Check if URL exists in database
                if url in existing_urls:
                    # Get existing event to check for updates
                    existing_event = self.db.query(Event).filter(Event.url == url).first()
                    
                    # Check if we need to update (based on title, date, or price)
                    if (existing_event.title != event.get('title') or
                        existing_event.date != event.get('date') or
                        existing_event.price != event.get('price')):
                        new_or_updated_events.append(event)
                        results["updated_events"] += 1
                        results["details"].append({
                            "action": "updated",
                            "title": event.get('title'),
                            "url": url
                        })
                else:
                    # New event
                    new_or_updated_events.append(event)
                    results["new_events"] += 1
                    results["details"].append({
                        "action": "created",
                        "title": event.get('title'),
                        "url": url
                    })
            
            # Bulk upsert events to database
            if new_or_updated_events:
                logger.info(f"Upserting {len(new_or_updated_events)} events to database")
                self.db_handler.upsert_events(new_or_updated_events)
            
            logger.info(f"Smart scraping completed: {results['new_events']} new, "
                      f"{results['updated_events']} updated, {results['skipped_urls']} skipped")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in smart scraping: {e}", exc_info=self.debug)
            results["errors"] += 1
            return results
        finally:
            self.db.close()
    
    def close(self):
        """Close database connection"""
        if self.db:
            self.db.close()


async def run_smart_scraper(debug=False):
    """Run the smart scraper"""
    logger.info("Starting smart scraper...")
    scraper = SmartScraper(debug=debug)
    
    try:
        results = await scraper.smart_scrape_events()
        logger.info(f"Smart scraper results: {results}")
        
        # Print summary
        print("\n========== SMART SCRAPER SUMMARY ==========")
        print(f"New events added: {results['new_events']}")
        print(f"Events updated: {results['updated_events']}")
        print(f"Duplicate URLs skipped: {results['skipped_urls']}")
        print(f"Errors encountered: {results['errors']}")
        print("==========================================")
        
        # Print details of actions taken
        if results['details']:
            print("\nDetails:")
            for detail in results['details'][:10]:  # Show first 10 details
                print(f"- {detail['action'].upper()}: {detail['title']} ({detail['url']})")
            
            if len(results['details']) > 10:
                print(f"... and {len(results['details']) - 10} more")
        
    finally:
        scraper.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Run smart scraper')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    args = parser.parse_args()
    
    asyncio.run(run_smart_scraper(debug=args.debug)) 