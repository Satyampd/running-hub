from typing import List, Dict, Any, Optional
from .base_scraper import BaseScraper
from bs4 import BeautifulSoup # Should be imported if BaseScraper.parse_html is used, or if used directly
from datetime import datetime # Import the datetime class itself
import re
import json # Not used in the snippet below, but might be in full class
import logging
from sqlalchemy.orm import Session # For type hinting
from .db_handler import EventDBHandler # For type hinting and usage

logger = logging.getLogger(__name__)

class IndiaRunningScraper(BaseScraper):
    def __init__(self, db: Optional[Session] = None):
        super().__init__("https://www.indiarunning.com")
        self.db = db
        self.db_handler = EventDBHandler(db) if db else None

    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from IndiaRunning.com"""
        events = []
        try:
            logger.info("Fetching events from IndiaRunning.com")
            html = await self.fetch_page(self.base_url)
            if not html:
                logger.error("Failed to fetch page from IndiaRunning.com")
                return events
                
            soup = self.parse_html(html)
            event_links = soup.find_all('a', href=lambda x: x and 'registrations.indiarunning.com' in x)
            logger.info(f"Found {len(event_links)} event links")
            
            for link in event_links:
                try:
                    event_card = link.find('div', class_=lambda x: x and 'flex justify-between' in x)
                    if not event_card: continue

                    title_div = event_card.find('div', class_=lambda x: x and 'line-clamp-2' in x)
                    title = title_div.text.strip() if title_div else "Unknown Event"

                    date_div = event_card.find('div', class_=lambda x: x and 'font-bold text-neutral-600' in x)
                    date_str_card = date_div.text.strip() if date_div else "Date TBD"
                    parsed_date_obj = self.parse_date(date_str_card)
                    formatted_date = parsed_date_obj.strftime("%d %b %Y") if parsed_date_obj else None

                    if not formatted_date or date_str_card.lower() in ['tbd', 'tba', 'date tbd', 'date tba']:
                        event_url_for_date = link['href']
                        details_html = await self.fetch_page(event_url_for_date)
                        if details_html:
                            details_soup = self.parse_html(details_html)
                            date_candidates = details_soup.find_all(string=re.compile(r'\\b\\d{1,2}\\s+[A-Za-z]{3,9}\\s+20\\d{2}\\b'))
                            if date_candidates:
                                details_date_str = date_candidates[0].strip()
                                details_parsed_date = self.parse_date(details_date_str)
                                if details_parsed_date:
                                    formatted_date = details_parsed_date.strftime("%d %b %Y")
                    if not formatted_date:
                        formatted_date = "Date TBD"

                    location_div = event_card.find('span', class_='text-event-type-dark-yellow')
                    location = location_div.text.strip() if location_div else "Location TBD"

                    categories = []
                    category_spans = event_card.find_all('span', {'data-testid': 'race-type'})
                    for span in category_spans:
                        if span.text.strip(): categories.append(span.text.strip())

                    price_div = event_card.find('span', class_=lambda x: x and 'font-bold md:text-2xl' in x)
                    price = price_div.text.strip() if price_div else "Price TBD"
                    
                    event_url = link['href']
                    description = await self.fetch_event_description(event_url)

                    event_data = {
                        'title': title,
                        'date': formatted_date,
                        'location': location,
                        'categories': categories,
                        'price': price,
                        'url': event_url,
                        'source': 'IndiaRunning.com',
                        'description': description
                    }
                    events.append(event_data)
                    logger.info(f"Successfully scraped event: {title}")
                except Exception as e:
                    logger.error(f"Error parsing event card for link {link.get('href', 'N/A')}: {str(e)}")
                    continue
            if self.db_handler:
                try:
                    logger.info("Saving events to database")
                    saved_events = self.db_handler.upsert_events(events)
                    logger.info(f"Successfully saved {len(saved_events)} events to database")
                except Exception as e:
                    logger.error(f"Error saving events to database: {str(e)}")
        except Exception as e:
            logger.error(f"Error scraping IndiaRunning.com: {str(e)}")
        return events

    async def fetch_event_description(self, event_url: str) -> str:
        """Fetch and extract event description from the event page"""
        try:
            html = await self.fetch_page(event_url)
            if not html:
                return ""
            soup = self.parse_html(html)
            description_div = soup.find('div', class_=lambda x: x and 'event-description' in x)
            if description_div:
                return description_div.text.strip()
            return ""
        except Exception as e:
            logger.error(f"Error fetching event description from {event_url}: {str(e)}")
            return ""
        
    def parse_date(self, date_str: str, now_dt_for_testing: Optional[datetime] = None) -> Optional[datetime]:
        """Parse date string into datetime object. Optionally accept now_dt for testing."""
        original_date_str_for_log = str(date_str) 
        try:
            if not date_str or str(date_str).lower() in ['tbd', 'tba', 'date tbd', 'date tba']:
                return None

            current_date_str = str(date_str).strip()
            if " - " in current_date_str:
                current_date_str = current_date_str.split(" - ")[0].strip()
            current_date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', current_date_str)
            
            month_map = {
                'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
                'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
                'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
            }
            for abbr, full in month_map.items():
                current_date_str = re.sub(r'\b' + abbr + r'\b', full, current_date_str, flags=re.IGNORECASE)
            
            formats_to_try = [
                (r"([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})", "%B %d, %Y", False),
                (r"([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})",    "%B %d %Y",  False),
                (r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})",    "%d %B %Y",  False),
                (r"(\d{1,2})/(\d{1,2})/(\d{4})",          "%d/%m/%Y",  False),
                (r"(\d{4})-(\d{2})-(\d{2})",              "%Y-%m-%d",  False),
                (r"([A-Za-z]+)\s+(\d{1,2})",               "%B %d",     True),
                (r"(\d{1,2})\s+([A-Za-z]+)",               "%d %B",     True),
            ]
            
            now_dt = now_dt_for_testing if now_dt_for_testing else datetime.now()
            current_year = now_dt.year
            current_month_val = now_dt.month
            current_day_val = now_dt.day

            for pattern, strptime_fmt, needs_year_logic in formats_to_try:
                match = re.match(pattern, current_date_str)
                if match:
                    string_to_parse = current_date_str 
                    final_strptime_fmt = strptime_fmt

                    if needs_year_logic:
                        year_to_use = current_year
                        day_val_str, month_val_str = "", ""
                        if strptime_fmt == "%B %d":
                            month_val_str, day_val_str = match.groups()
                        elif strptime_fmt == "%d %B":
                            day_val_str, month_val_str = match.groups()
                        else: continue

                        try:
                            event_month_val = datetime.strptime(month_val_str, "%B").month
                        except ValueError: 
                            continue 
                        day_int = int(day_val_str)
                        
                        logger.debug(f"Debug parse_date year logic: event_month_val={event_month_val} (type {type(event_month_val)}), current_month_val={current_month_val} (type {type(current_month_val)}), day_int={day_int} (type {type(day_int)}), current_day_val={current_day_val} (type {type(current_day_val)})")

                        if event_month_val < current_month_val or \
                           (event_month_val == current_month_val and day_int < current_day_val):
                            year_to_use += 1
                        
                        if strptime_fmt == "%B %d":
                            string_to_parse = f"{month_val_str} {day_val_str} {year_to_use}"
                            final_strptime_fmt = "%B %d %Y"
                        elif strptime_fmt == "%d %B":
                            string_to_parse = f"{day_val_str} {month_val_str} {year_to_use}"
                            final_strptime_fmt = "%d %B %Y"
                    
                    try:
                        return datetime.strptime(string_to_parse, final_strptime_fmt)
                    except ValueError:
                        logger.debug(f"ValueError parsing '{string_to_parse}' with format '{final_strptime_fmt}'")
                        continue 
            
            logger.warning(f"Unable to parse date string: {original_date_str_for_log}")
            return None
        except Exception as e:
            logger.error(f"Error parsing date '{original_date_str_for_log}': {str(e)}")
            return None
            
    def slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug"""
        text = str(text).lower() # Ensure text is string, then lowercase
        text = re.sub(r'[^\\w\\s-]', '', text) # Remove non-word, non-space, non-hyphen chars
        text = re.sub(r'[-\\s]+', '-', text)   # Replace spaces/multiple hyphens with single hyphen
        return text.strip('-')                # Remove leading/trailing hyphens 