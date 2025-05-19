import asyncio
import schedule
import time
from app.tasks.fetch_events import fetch_and_store_events
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def job():
    """Run the event fetching task"""
    logger.info("Starting scheduled event fetch")
    asyncio.run(fetch_and_store_events())
    logger.info("Completed scheduled event fetch")

def main():
    """Schedule and run the event fetching task"""
    # Run once at startup
    job()
    
    # Schedule to run daily at midnight
    schedule.every().day.at("00:00").do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main() 