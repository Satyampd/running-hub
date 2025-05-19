from typing import List, Dict, Any
from .base_scraper import BaseScraper
from bs4 import BeautifulSoup
from datetime import datetime
import re
import json
import logging
from sqlalchemy.orm import Session
from .db_handler import EventDBHandler

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IndiaRunningScraper(BaseScraper):
    def __init__(self, db: Session = None):
        super().__init__("https://www.indiarunning.com")
        self.db = db
        self.db_handler = EventDBHandler(db) if db else None

    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from IndiaRunning.com"""
        events = []
        try:
            # Fetch the main page which has all events
            logger.info("Fetching events from IndiaRunning.com")
            html = await self.fetch_page(self.base_url)
            if not html:
                logger.error("Failed to fetch page from IndiaRunning.com")
                return events
                
            soup = self.parse_html(html)
            
            # Find all event cards - they use event containers with links
            event_links = soup.find_all('a', href=lambda x: x and 'registrations.indiarunning.com' in x)
            logger.info(f"Found {len(event_links)} event links")
            
            for link in event_links:
                try:
                    event_card = link.find('div', class_=lambda x: x and 'flex justify-between' in x)
                    if not event_card:
                        continue

                    # Extract event details
                    title = event_card.find('div', class_=lambda x: x and 'line-clamp-2' in x)
                    title = title.text.strip() if title else "Unknown Event"

                    # Extract date
                    date_div = event_card.find('div', class_=lambda x: x and 'font-bold text-neutral-600' in x)
                    date_str = date_div.text.strip() if date_div else "Date TBD"
                    parsed_date = self.parse_date(date_str)
                    formatted_date = parsed_date.strftime("%d %b %Y") if parsed_date else None

                    # If date is not found or is 'Date TBD', try to extract from event details page
                    if not formatted_date or date_str.lower() in ['tbd', 'tba', 'date tbd', 'date tba']:
                        event_url = link['href']
                        details_html = await self.fetch_page(event_url)
                        if details_html:
                            details_soup = self.parse_html(details_html)
                            # Try to find a date in the details page (look for common date patterns)
                            date_candidates = details_soup.find_all(string=re.compile(r'\b\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2}\b'))
                            if date_candidates:
                                # Use the first match
                                details_date_str = date_candidates[0].strip()
                                details_parsed_date = self.parse_date(details_date_str)
                                if details_parsed_date:
                                    formatted_date = details_parsed_date.strftime("%d %b %Y")

                    if not formatted_date:
                        formatted_date = "Date TBD"  # final fallback

                    # Extract location
                    location_div = event_card.find('span', class_='text-event-type-dark-yellow')
                    location = location_div.text.strip() if location_div else "Location TBD"

                    # Extract categories
                    categories = []
                    category_spans = event_card.find_all('span', {'data-testid': 'race-type'})
                    for span in category_spans:
                        if span.text.strip():
                            categories.append(span.text.strip())

                    # Extract price
                    price_div = event_card.find('span', class_=lambda x: x and 'font-bold md:text-2xl' in x)
                    price = price_div.text.strip() if price_div else "Price TBD"

                    # Extract registration closing date
                    reg_date = event_card.find('span', {'data-testid': 'reg-date-text'})
                    reg_closing = reg_date.text.strip() if reg_date else "Registration Date TBD"

                    # Try to get event description from the event page
                    event_url = link['href']
                    description = await self.fetch_event_description(event_url)

                    event = {
                        'title': title,
                        'date': formatted_date,
                        'location': location,
                        'categories': categories,
                        'price': price,
                        'url': event_url,
                        'source': 'IndiaRunning.com',
                        'description': description
                    }
                    events.append(event)
                    logger.info(f"Successfully scraped event: {title}")

                except Exception as e:
                    logger.error(f"Error parsing event card: {str(e)}")
                    continue

            # Save to database if available
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
            logger.error(f"Error fetching event description: {str(e)}")
            return ""
        
    def parse_date(self, date_str: str) -> datetime:
        """Parse date string into datetime object"""
        try:
            if not date_str or date_str.lower() in ['tbd', 'tba', 'date tbd', 'date tba']:
                return None

            date_str = date_str.strip()
            if " - " in date_str:
                date_str = date_str.split(" - ")[0]
            date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
            month_map = {
                'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
                'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
                'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
            }
            for abbr, full in month_map.items():
                date_str = re.sub(r'\b' + abbr + r'\b', full, date_str, flags=re.IGNORECASE)
            formats = [
                (r"([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})", "%B %d, %Y"),  # May 31, 2024
                (r"([A-Za-z]{3,9})\s+(\d{1,2})\s*,?\s*(\d{4})", "%B %d %Y"),  # May 31 2024
                (r"(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})", "%d %B %Y"),  # 31 May 2024
                (r"(\d{1,2})/(\d{1,2})/(\d{4})", "%d/%m/%Y"),  # DD/MM/YYYY
                (r"(\d{4})-(\d{2})-(\d{2})", "%Y-%m-%d"),  # YYYY-MM-DD
                (r"([A-Za-z]{3,9})\s+(\d{1,2})", "%B %d %Y"),  # May 31 (assumes current year)
                (r"(\d{1,2})\s+([A-Za-z]{3,9})", "%d %B %Y"),  # 31 May (assumes current year)
            ]
            for idx, (pattern, date_format) in enumerate(formats):
                match = re.match(pattern, date_str)
                if match:
                    # If the format does not include a year, add it and possibly increment
                    if idx >= 5:  # Only the last two formats are missing a year
                        if date_format == "%d %B %Y":
                            day, month = match.groups()
                        else:
                            month, day = match.groups()
                        year = datetime.now().year
                        current_month = datetime.now().month
                        event_month = datetime.strptime(month, "%B").month
                        if event_month < current_month or (event_month == current_month and int(day) < datetime.now().day):
                            year += 1
                        date_str = f"{day} {month} {year}" if date_format == "%d %B %Y" else f"{month} {day} {year}"
                        try:
                            return datetime.strptime(date_str, "%d %B %Y")
                        except ValueError:
                            continue
                    else:
                        try:
                            # Special handling for YYYY-MM-DD
                            if date_format == "%Y-%m-%d":
                                year, month, day = match.groups()
                                return datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")
                            return datetime.strptime(date_str, date_format)
                        except ValueError:
                            continue
            logger.warning(f"Unable to parse date string: {date_str}")
            return None
        except Exception as e:
            logger.error(f"Error parsing date {date_str}: {str(e)}")
            return None
            
    def slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug"""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-') 