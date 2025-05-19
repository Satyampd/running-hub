#!/usr/bin/env python
import schedule
import time
import asyncio
import logging
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Import our scraper
from app.scripts.smart_scraper import run_smart_scraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def job():
    """Run the smart scraper as a scheduled job"""
    logger.info("Running scheduled scraping job")
    try:
        asyncio.run(run_smart_scraper())
        logger.info("Scheduled scraping job completed successfully")
    except Exception as e:
        logger.error(f"Error in scheduled scraping job: {e}")

def main():
    # Schedule the job
    schedule_time = os.getenv("SCRAPER_SCHEDULE", "01:00")  # Default to 1:00 AM
    
    logger.info(f"Setting up scheduler to run smart scraper at {schedule_time} daily")
    schedule.every().day.at(schedule_time).do(job)
    
    # Run once at startup
    logger.info("Running initial scraping job on startup")
    job()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check schedule every minute

if __name__ == "__main__":
    main() 