#!/usr/bin/env python3
import asyncio
import argparse
import sys
import logging
from pathlib import Path

# Add parent directory to path to import from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.scripts.smart_scraper import run_smart_scraper, SmartScraper
from app.scrapers.scraper_manager import ScraperManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def run_source_scraper(source: str, debug=False):
    """Run the scraper for a specific source"""
    logger.info(f"Running scraper for source: {source}")
    
    scraper = SmartScraper(debug=debug)
    manager = ScraperManager()
    
    try:
        # Force clear cache if in debug mode
        if debug:
            logger.info(f"Debug mode enabled, clearing cache for {source}...")
            manager.clear_cache(source)
        
        existing_urls = await scraper.get_existing_urls()
        logger.info(f"Found {len(existing_urls)} existing URLs in database")
        
        # Scrape events from the specified source
        events = await manager.scrape_events_from_source(source)
        logger.info(f"Scraped {len(events)} events from {source}")
        
        # Process events with the smart scraper logic
        new_or_updated_events = []
        results = {
            "new_events": 0,
            "updated_events": 0,
            "skipped_urls": 0,
            "details": []
        }
        
        urls_processed = set()
        
        for event in events:
            url = event.get('url')
            
            # Skip events without URL
            if not url:
                logger.warning(f"Skipping event without URL: {event.get('title')}")
                continue
            
            # Skip duplicate URLs within current batch
            if url in urls_processed:
                results["skipped_urls"] += 1
                continue
            
            urls_processed.add(url)
            
            # Check if URL exists in database
            if url in existing_urls:
                # Get existing event to check for updates
                existing_event = scraper.db.query(Event).filter(Event.url == url).first()
                
                # Check if we need to update
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
            scraper.db_handler.upsert_events(new_or_updated_events)
        
        # Print summary
        print(f"\n========== {source.upper()} SCRAPER SUMMARY ==========")
        print(f"New events added: {results['new_events']}")
        print(f"Events updated: {results['updated_events']}")
        print(f"Duplicate URLs skipped: {results['skipped_urls']}")
        print("==========================================")
        
        # Print details
        if results['details']:
            print("\nDetails:")
            for detail in results['details'][:10]:
                print(f"- {detail['action'].upper()}: {detail['title']} ({detail['url']})")
            
            if len(results['details']) > 10:
                print(f"... and {len(results['details']) - 10} more")
                
    except Exception as e:
        logger.error(f"Error scraping {source}: {e}", exc_info=debug)
    finally:
        scraper.close()


async def list_sources():
    """List all available scraper sources"""
    manager = ScraperManager()
    sources = [scraper.__class__.__name__.replace('Scraper', '') for scraper in manager.scrapers]
    
    print("\nAvailable scraper sources:")
    for idx, source in enumerate(sources, 1):
        print(f"{idx}. {source}")
    
    return sources


def main():
    parser = argparse.ArgumentParser(description="Run event scrapers intelligently")
    
    # Scraping options
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--all", action="store_true", help="Scrape all sources")
    group.add_argument("--source", type=str, help="Scrape a specific source")
    
    # Other options
    parser.add_argument("--list", action="store_true", help="List all available sources")
    parser.add_argument("--verbose", action="store_true", help="Show detailed output")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode (clears cache)")
    
    args = parser.parse_args()
    
    # Set log level based on verbose flag
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Run the appropriate command
    if args.list:
        asyncio.run(list_sources())
    elif args.source:
        asyncio.run(run_source_scraper(args.source, debug=args.debug))
    elif args.all:
        asyncio.run(run_smart_scraper(debug=args.debug))
    else:
        parser.print_help()


if __name__ == "__main__":
    # Import Event only here to avoid circular imports
    from app.models.event import Event
    main() 