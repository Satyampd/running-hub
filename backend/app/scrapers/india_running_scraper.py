from typing import List, Dict, Any
from .base_scraper import BaseScraper
# from bs4 import BeautifulSoup # No longer directly used here, BaseScraper handles parsing
from datetime import datetime
import re
# import json # No longer used
from app.core.logging_config import get_logger # Import the new logger
from sqlalchemy.orm import Session # Keep for type hinting
from .db_handler import EventDBHandler # Keep if db_handler is used

# Set up logging
# logging.basicConfig(level=logging.INFO) # Remove old logging config
logger = get_logger(__name__) # Use the new logger

class IndiaRunningScraper(BaseScraper):
    def __init__(self, db: Session = None):
        super().__init__("https://www.indiarunning.com")
        self.db = db # Keep for now, though db_handler seems to manage db ops
        self.db_handler = EventDBHandler(db) if db else None # Keep if db_handler is used
        logger.info("IndiaRunningScraper initialized.")

    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from IndiaRunning.com"""
        events = []
        source_name = self.__class__.__name__.replace("Scraper", "")
        try:
            logger.info(f"Starting event scraping for {source_name}.")
            html = await self.fetch_page(self.base_url)
            if not html:
                logger.error(f"Failed to fetch main page from {self.base_url}. Aborting scrape for {source_name}.")
                return events
                
            soup = self.parse_html(html) # Use BaseScraper's method
            
            event_links = soup.find_all('a', href=lambda x: x and 'registrations.indiarunning.com' in x)
            logger.info(f"Found {len(event_links)} potential event links on {self.base_url}.")
            
            for i, link_tag in enumerate(event_links):
                event_url = link_tag.get('href')
                if not event_url:
                    logger.warning(f"Skipping link {i+1} as it has no href.")
                    continue

                logger.debug(f"Processing event link {i+1}/{len(event_links)}: {event_url}")
                try:
                    event_card = link_tag.find('div', class_=lambda x: x and 'flex justify-between' in x)
                    if not event_card:
                        logger.debug(f"No event card found for link: {event_url}. Skipping.")
                        continue

                    title_tag = event_card.find('div', class_=lambda x: x and 'line-clamp-2' in x)
                    title = title_tag.text.strip() if title_tag else "Title Not Found"
                    logger.debug(f"Extracted title: {title}")

                    date_div = event_card.find('div', class_=lambda x: x and 'font-bold text-neutral-600' in x)
                    date_str = date_div.text.strip() if date_div else "Date TBD"
                    parsed_date = self.parse_date(date_str)
                    formatted_date = parsed_date.strftime("%d %b %Y") if parsed_date else None
                    logger.debug(f"Initial date string: '{date_str}', Parsed: {formatted_date}")

                    if not formatted_date or date_str.lower() in ['tbd', 'tba', 'date tbd', 'date tba']:
                        logger.info(f"Date for '{title}' is TBD or not found on card. Attempting to fetch from details page: {event_url}")
                        details_html = await self.fetch_page(event_url)
                        if details_html:
                            details_soup = self.parse_html(details_html)
                            date_candidates_tags = details_soup.find_all(string=re.compile(r'\b\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2}\b'))
                            if date_candidates_tags:
                                details_date_str = date_candidates_tags[0].strip()
                                details_parsed_date = self.parse_date(details_date_str)
                                if details_parsed_date:
                                    formatted_date = details_parsed_date.strftime("%d %b %Y")
                                    logger.info(f"Found date '{formatted_date}' on details page for '{title}'.")
                            else:
                                logger.warning(f"No specific date pattern found on details page for '{title}'.")
                        else:
                            logger.warning(f"Could not fetch details page for '{title}' to find date.")

                    formatted_date = formatted_date or "Date TBD"

                    location_div = event_card.find('span', class_='text-event-type-dark-yellow')
                    location = location_div.text.strip() if location_div else "Location TBD"
                    logger.debug(f"Extracted location: {location}")

                    categories = []
                    category_spans = event_card.find_all('span', {'data-testid': 'race-type'})
                    for span in category_spans:
                        cat_text = span.text.strip()
                        if cat_text:
                            categories.append(cat_text)
                    logger.debug(f"Extracted categories: {categories}")

                    price_div = event_card.find('span', class_=lambda x: x and 'font-bold md:text-2xl' in x)
                    price = price_div.text.strip() if price_div else "Price TBD"
                    logger.debug(f"Extracted price: {price}")

                    reg_date_tag = event_card.find('span', {'data-testid': 'reg-date-text'})
                    reg_closing = reg_date_tag.text.strip() if reg_date_tag else "Registration Date TBD"
                    logger.debug(f"Extracted registration closing: {reg_closing}")
                    
                    description = await self.fetch_event_description(event_url)
                    logger.debug(f"Extracted description (first 50 chars): {description[:50]}...")

                    event_data = {
                        'title': title,
                        'date': formatted_date,
                        'location': location,
                        'address': None, # IndiaRunning does not typically provide a full address on the card
                        'categories': categories,
                        'price': price,
                        'url': event_url,
                        'source': source_name, # Use dynamic source name
                        'description': description,
                        'registration_closes': reg_closing,
                        'photos': None # Placeholder, fetch if available/needed
                    }
                    events.append(event_data)
                    logger.info(f"Successfully scraped event '{title}' from {event_url}")

                except Exception as e:
                    logger.error(f"Error parsing event card for URL {event_url}: {e}", exc_info=True)
                    continue # Continue to next event link

            logger.info(f"Finished scraping {source_name}. Total events found: {len(events)}.")

            # Database saving logic (optional, depends on db_handler presence)
            if self.db_handler and events:
                try:
                    logger.info(f"Attempting to save {len(events)} events from {source_name} to database.")
                    # Ensure upsert_events is async or run in executor if it's blocking
                    # For now, assuming it's compatible or ScraperManager handles async execution
                    saved_count = self.db_handler.upsert_events(events) # Assuming this returns a count or similar
                    logger.info(f"Successfully saved/updated {getattr(saved_count, 'rowcount', len(saved_count) if isinstance(saved_count, list) else 'unknown number of')} events from {source_name} to database.")
                except Exception as e:
                    logger.error(f"Error saving events from {source_name} to database: {e}", exc_info=True)

        except Exception as e:
            logger.error(f"Major error during scraping {source_name}: {e}", exc_info=True)
        
        return events

    async def fetch_event_description(self, event_url: str) -> str:
        """Fetch and extract event description from the event page"""
        logger.debug(f"Fetching description from: {event_url}")
        try:
            html = await self.fetch_page(event_url)
            if not html:
                logger.warning(f"No HTML content returned from {event_url} for description.")
                return ""

            soup = self.parse_html(html)
            description_div = soup.find('div', class_=lambda x: x and 'event-description' in x)
            if description_div:
                description = description_div.get_text(separator='\n', strip=True)
                logger.debug(f"Found description for {event_url} (length: {len(description)}).")
                return description
            else:
                logger.debug(f"No 'event-description' div found on {event_url}.")
                return ""
        except Exception as e:
            logger.error(f"Error fetching or parsing event description from {event_url}: {e}", exc_info=True)
            return ""
        
    def parse_date(self, date_str: str) -> datetime:
        """Parse date string into datetime object. Handles various formats including ranges and TBD."""
        if not date_str or date_str.lower().strip() in ['tbd', 'tba', 'date tbd', 'date tba', '']:
            logger.debug(f"Date string is TBD or empty: '{date_str}'. Returning None.")
            return None

        original_date_str = date_str # Keep original for logging
        try:
            # Handle date ranges, take the start date
            if " - " in date_str:
                date_str = date_str.split(" - ")[0].strip()
                logger.debug(f"Date string '{original_date_str}' is a range. Using start date: '{date_str}'.")
            
            # Remove ordinal suffixes (st, nd, rd, th)
            date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str.strip())
            
            # Normalize month abbreviations to full names for consistent parsing
            month_map = {
                'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
                'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
                'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
            }
            for abbr, full in month_map.items():
                date_str = re.sub(r'\b' + abbr + r'\b', full, date_str, flags=re.IGNORECASE)

            # Define date formats to try, from more specific to more general
            # Added year to formats that might miss it, assuming current year or next if past
            formats_to_try = [
                "%B %d, %Y",  # January 15, 2024
                "%d %B %Y",  # 15 January 2024
                "%b %d, %Y",  # Jan 15, 2024 (covered by normalization, but keep for robustness)
                "%d %b %Y",  # 15 Jan 2024 (covered by normalization)
                "%Y-%m-%d",  # 2024-01-15
                "%d/%m/%Y",  # 15/01/2024
                "%m/%d/%Y",  # 01/15/2024
            ]

            parsed_dt = None
            for fmt in formats_to_try:
                try:
                    parsed_dt = datetime.strptime(date_str, fmt)
                    logger.debug(f"Successfully parsed date string '{original_date_str}' (processed as '{date_str}') using format '{fmt}'. Result: {parsed_dt}")
                    return parsed_dt
                except ValueError:
                    continue # Try next format
            
            # Fallback for formats like "Month Day" or "Day Month" (assuming current/next year)
            year_formats = [
                ("%B %d", True), # Month Day
                ("%d %B", False) # Day Month
            ]
            current_time = datetime.now()
            for fmt_str, month_first in year_formats:
                try:
                    temp_dt = datetime.strptime(date_str, fmt_str)
                    # Assume current year, then adjust if the date is in the past for this year
                    event_dt = temp_dt.replace(year=current_time.year)
                    if event_dt < current_time.replace(hour=0, minute=0, second=0, microsecond=0) and not (event_dt.month == current_time.month and event_dt.day == current_time.day):
                        event_dt = event_dt.replace(year=current_time.year + 1)
                    logger.debug(f"Parsed date string '{original_date_str}' (processed as '{date_str}') using format '{fmt_str}' with year adjustment. Result: {event_dt}")
                    return event_dt
                except ValueError:
                    continue

            logger.warning(f"Unable to parse date string: '{original_date_str}' (processed as '{date_str}') with any known format.")
            return None
        except Exception as e:
            logger.error(f"Unexpected error parsing date string '{original_date_str}': {e}", exc_info=True)
            return None
            
    # slugify method seems unused, can be removed or kept if planned for future use.
    # def slugify(self, text: str) -> str:
    #     """Convert text to URL-friendly slug"""
    #     text = text.lower()
    #     text = re.sub(r'[^\w\s-]', '', text)
    #     text = re.sub(r'[-\s]+', '-', text)
    #     return text.strip('-') 