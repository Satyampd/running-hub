import os
import sys
from pathlib import Path
import subprocess
import logging

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_cron_job():
    """Set up a daily cron job to run the scraper"""
    try:
        # Get the absolute path to the daily_scrape.py script
        script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'daily_scrape.py'))
        
        # Create the cron command to run at 1 AM every day
        cron_command = f"0 1 * * * cd {os.path.dirname(script_path)} && python3 {script_path} >> scraper.log 2>&1"
        
        # Get existing crontab
        result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
        existing_crontab = result.stdout
        
        # Check if our job already exists
        if cron_command not in existing_crontab:
            # Add our new job
            new_crontab = existing_crontab + '\n' + cron_command if existing_crontab else cron_command
            
            # Write the new crontab
            subprocess.run(['crontab', '-'], input=new_crontab, text=True)
            logger.info("Successfully set up daily cron job")
        else:
            logger.info("Cron job already exists")
            
    except Exception as e:
        logger.error(f"Error setting up cron job: {str(e)}")
        raise

if __name__ == "__main__":
    setup_cron_job() 