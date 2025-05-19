from typing import List, Dict, Any
from bs4 import BeautifulSoup
from datetime import datetime
import json
import re
import logging
from .base_scraper import BaseScraper
import aiohttp
import asyncio

logger = logging.getLogger(__name__)

class BhaagoIndiaScraper(BaseScraper):
    def __init__(self, db=None):
        super().__init__("https://bhaagoindia.com")
        self.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.event_details_cache = {}
        self.db_handler = None
        if db:
            from .db_handler import EventDBHandler
            self.db_handler = EventDBHandler(db)

    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from BhaagoIndia, only fetch details for new events."""
        events = []
        new_events = []
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                # Fetch events from JSON endpoint
                json_url = f"{self.base_url}/search/?format=json"
                async with session.get(json_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        for item in data:
                            if item.get('datatype') == 'event':
                                title = item['content']
                                url = item['url']
                                if not url or not url.strip():
                                    logger.warning(f"Skipping event with missing URL: {title}")
                                    continue
                                if not url.startswith('http'):
                                    url = f"{self.base_url}{url}"
                                # Check if event exists in DB
                                if self.db_handler and self.db_handler.event_exists(url, title):
                                    logger.info(f"Skipping existing event: {title}")
                                    continue
                                # Fetch event details
                                event = {
                                    'title': title,
                                    'url': url,
                                    'source': 'BhaagoIndia.com',
                                    'date': 'Date TBD',
                                    'price': 'Price TBD',
                                    'location': 'Location TBD',
                                    'categories': self._extract_categories(title, item),
                                    'description': None,
                                    'registration_closes': None,
                                    'scraped_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                                }
                                await self._fetch_event_details(session, event)
                                events.append(event)
                                new_events.append(event)
                    else:
                        logger.error(f"Failed to fetch events from JSON endpoint: {response.status}")
        except Exception as e:
            logger.error(f"Error scraping BhaagoIndia.com: {str(e)}")
        logger.info(f"Total events scraped: {len(events)}")
        # Save only new events to DB
        if self.db_handler and new_events:
            try:
                logger.info(f"Saving {len(new_events)} new events to database")
                self.db_handler.upsert_events(new_events)
            except Exception as e:
                logger.error(f"Error saving BhaagoIndia events to database: {str(e)}")
        return events

    async def _fetch_event_details(self, session: aiohttp.ClientSession, event: Dict[str, Any]) -> None:
        """Fetch detailed information for a single event with improved date and price extraction"""
        try:
            if event['url'] in self.event_details_cache:
                details = self.event_details_cache[event['url']]
                event.update(details)
                return

            async with session.get(event['url']) as detail_response:
                if detail_response.status == 200:
                    detail_html = await detail_response.text()
                    detail_soup = BeautifulSoup(detail_html, 'html.parser')

                    # Extract description
                    desc_elem = detail_soup.find(class_=['event-description', 'description', 'desc'])
                    if desc_elem:
                        event['description'] = desc_elem.get_text(separator='\n', strip=True)

                    # Update categories after fetching full details
                    event['categories'] = self._extract_categories(event['title'], detail_soup)

                    # --- IMPROVED DATE EXTRACTION ---
                    date_found = False
                    # 1. Try to find date in known classes
                    date_elem = detail_soup.find(class_=['event-date', 'date', 'event-datetime'])
                    if date_elem:
                        date_text = date_elem.text.strip()
                        parsed_date = self.parse_date(date_text)
                        if parsed_date:
                            event['date'] = parsed_date.strftime('%d %b %Y')
                            date_found = True
                    # 2. Try regex search for date patterns in the whole page
                    if not date_found:
                        text_content = detail_soup.get_text(separator=' ', strip=True)
                        date_patterns = [
                            r'\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2}',  # 31 May 2024
                            r'[A-Za-z]{3,9}\s+\d{1,2},\s*20\d{2}',  # May 31, 2024
                            r'\d{4}-\d{2}-\d{2}',  # 2024-05-31
                            r'\d{1,2}/\d{1,2}/\d{4}',  # 31/05/2024
                            r'\d{1,2}-[A-Za-z]{3,9}-20\d{2}',  # 31-May-2024
                            r'[A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s*20\d{2}', # May 31st, 2024
                        ]
                        for pattern in date_patterns:
                            match = re.search(pattern, text_content)
                            if match:
                                parsed_date = self.parse_date(match.group(0))
                                if parsed_date:
                                    event['date'] = parsed_date.strftime('%d %b %Y')
                                    date_found = True
                                    break
                    # 3. Fallback: look for keywords
                    if not date_found:
                        for keyword in ['event date', 'race date', 'date']:
                            match = re.search(rf'{keyword}[:\-\s]*([A-Za-z0-9,\-/ ]+)', text_content, re.I)
                            if match:
                                parsed_date = self.parse_date(match.group(1))
                                if parsed_date:
                                    event['date'] = parsed_date.strftime('%d %b %Y')
                                    break

                    # --- IMPROVED PRICE EXTRACTION ---
                    price_found = False
                    # 1. Try to find price in known classes
                    price_elem = detail_soup.find(class_=['event-price', 'price', 'fee'])
                    if price_elem:
                        price_text = price_elem.get_text(strip=True)
                        if price_text:
                            price_text = re.sub(r'[^\d\-,.]+', '', price_text)
                            if price_text:
                                event['price'] = f"₹{price_text}"
                                price_found = True
                    # 2. Try regex search for price patterns in the whole page
                    if not price_found:
                        price_patterns = [
                            r'(?:₹|Rs\.?|INR)\s*([\d,]+(?:\s*-\s*[\d,]+)?)',
                            r'([\d,]+)\s*(?:INR|Rs\.?|₹)',
                            r'Fee[:\-\s]*([\d,]+)',
                        ]
                        text_content = detail_soup.get_text(separator=' ', strip=True)
                        for pattern in price_patterns:
                            match = re.search(pattern, text_content, re.I)
                            if match:
                                price_val = match.group(1).replace(',', '').strip()
                                if price_val:
                                    event['price'] = f"₹{price_val}"
                                    price_found = True
                                    break
                    # 3. Fallback: look for 'Free', 'TBD', 'Onwards'
                    if not price_found:
                        if re.search(r'free', text_content, re.I):
                            event['price'] = 'Free'
                        elif re.search(r'onwards', text_content, re.I):
                            match = re.search(r'(?:₹|Rs\.?|INR)\s*([\d,]+)\s*onwards', text_content, re.I)
                            if match:
                                event['price'] = f"₹{match.group(1).replace(',', '').strip()} onwards"
                        else:
                            event['price'] = 'Price TBD'

                    # --- IMPROVED LOCATION EXTRACTION ---
                    # Try to find location in known classes first
                    location_elem = detail_soup.find(class_=['event-location', 'location'])
                    if location_elem:
                        event['location'] = location_elem.get_text(strip=True)
                    else:
                        # Try to find location in the new class as described by user
                        loc_elem = detail_soup.find('div', class_='flex text-lg font-normal text-gray-500 dark:text-gray-400')
                        if loc_elem:
                            # Sometimes the location is inside a span or direct text
                            location_text = loc_elem.get_text(strip=True)
                            if location_text:
                                event['location'] = location_text
                        else:
                            # Fallback: try to find a div with similar class pattern (partial match)
                            for div in detail_soup.find_all('div'):
                                class_attr = div.get('class')
                                if class_attr and 'text-lg' in class_attr and 'text-gray-500' in class_attr:
                                    location_text = div.get_text(strip=True)
                                    if location_text:
                                        event['location'] = location_text
                                        break

                    # Extract registration closing date
                    reg_close_elem = detail_soup.find(string=re.compile(r'Registration.*Close', re.I))
                    if reg_close_elem:
                        reg_close_parent = reg_close_elem.find_parent()
                        if reg_close_parent:
                            reg_close_text = reg_close_parent.get_text(strip=True)
                            parsed_reg_date = self.parse_date(reg_close_text)
                            if parsed_reg_date:
                                event['registration_closes'] = parsed_reg_date.strftime('%d %b %Y')

                    # Extract organizer information
                    org_elem = detail_soup.find(class_=['organizer', 'event-organizer'])
                    if org_elem:
                        event['organizer'] = org_elem.get_text(strip=True)

                    # Extract amenities
                    amenities_keywords = [
                        'water station', 'aid station', 'medical support', 'ambulance',
                        'parking', 'toilet', 'restroom', 'bathroom', 'changing room',
                        'refreshment', 'energy drink', 'recovery zone', 'physio',
                        'timing chip', 'medal', 't-shirt', 'certificate', 'goodie bag',
                        'baggage counter', 'locker', 'shower', 'massage', 'stretching area'
                    ]
                    amenities = set()
                    desc_text = event.get('description', '')
                    if desc_text:
                        desc_text = desc_text.lower()
                        for keyword in amenities_keywords:
                            if keyword in desc_text:
                                amenities.add(keyword.title())
                        if amenities:
                            event['amenities'] = list(amenities)

                    # Extract start time
                    if desc_text:
                        start_time_match = re.search(r'Start\s*Time\s*[:\-]?\s*([0-9:apmAPM ]+)', desc_text)
                        if start_time_match:
                            event['start_time'] = start_time_match.group(1).strip()

                        # Extract cut-off time
                        cut_off_match = re.search(r'Cut[- ]?off\s*[:\-]?\s*([0-9:apmAPM ]+)', desc_text)
                        if cut_off_match:
                            event['cut_off_time'] = cut_off_match.group(1).strip()

                        # Extract elevation gain
                        elevation_match = re.search(r'Elevation\s*(?:Gain)?\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:m|meters?|ft|feet))', desc_text, re.I)
                        if elevation_match:
                            event['elevation_gain'] = elevation_match.group(1).strip()

                        # Extract terrain type
                        terrain_types = ['Road', 'Trail', 'Track', 'Cross Country', 'Mixed']
                        for terrain in terrain_types:
                            if terrain.lower() in desc_text:
                                event['terrain'] = terrain
                                break

                    # Cache the details
                    self.event_details_cache[event['url']] = {
                        k: v for k, v in event.items()
                        if k not in ['title', 'date', 'location', 'categories', 'url', 'source', 'scraped_at']
                    }

        except Exception as e:
            logger.error(f"Error fetching details for {event['url']}: {str(e)}")
            # Don't raise the exception, just log it and continue

    def _extract_date(self, element) -> str:
        """Extract date from event element"""
        try:
            # First try to find date in dedicated date elements
            date_elem = element.find(class_=['event-date', 'date', 'event-datetime'])
            if date_elem:
                date_text = date_elem.text.strip()
                parsed_date = self.parse_date(date_text)
                if parsed_date:
                    return parsed_date.strftime('%d %b %Y')

            # Try to find date in title or description
            title_elem = element.find(['h2', 'h3', 'h4', 'a'], class_='event-title')
            if title_elem:
                title_text = title_elem.text.strip()
                # Look for date patterns in title
                date_match = re.search(r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:202[4-9]|203[0-9]))', title_text)
                if date_match:
                    parsed_date = self.parse_date(date_match.group(1))
                    if parsed_date:
                        return parsed_date.strftime('%d %b %Y')

            # Try to find date in description
            desc_elem = element.find(class_=['event-description', 'description', 'desc'])
            if desc_elem:
                desc_text = desc_elem.text.strip()
                # Look for date patterns in description
                date_match = re.search(r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:202[4-9]|203[0-9]))', desc_text)
                if date_match:
                    parsed_date = self.parse_date(date_match.group(1))
                    if parsed_date:
                        return parsed_date.strftime('%d %b %Y')

            return "Date TBD"
        except Exception as e:
            logger.error(f"Error extracting date: {str(e)}")
            return "Date TBD"

    def _extract_location(self, element) -> str:
        """Extract location from event element"""
        location_elem = element.find(class_=['event-location', 'location'])
        if location_elem:
            return location_elem.text.strip()
        return "Location TBD"

    def _extract_categories(self, title: str, element) -> List[str]:
        """Extract and standardize categories from event title and description"""
        categories = set()
        
        # Category patterns with their standardized names
        category_patterns = {
            'Marathon': [r'marathon', r'42k', r'42\.2k', r'42\.2 km'],
            'Half Marathon': [r'half\s*marathon', r'21k', r'21\.1k', r'21\.1 km'],
            '10K': [r'10k', r'10\s*km', r'10\s*kilometer'],
            '5K': [r'5k', r'5\s*km', r'5\s*kilometer'],
            '3K': [r'3k', r'3\s*km', r'3\s*kilometer'],
            'Ultra': [r'ultra', r'ultramarathon', r'50k', r'50\s*km', r'100k', r'100\s*km'],
            'Fun Run': [r'fun\s*run', r'fun\s*race'],
            'Women\'s Run': [r'women\'?s?\s*run', r'women\'?s?\s*race', r'shero'],
            'Corporate Run': [r'corporate\s*run', r'corporate\s*race'],
            'Trail Run': [r'trail\s*run', r'trail\s*race'],
            'Night Run': [r'night\s*run', r'night\s*race'],
            'Relay': [r'relay', r'relay\s*race'],
            'Virtual Run': [r'virtual\s*run', r'virtual\s*race']
        }
        
        # Get description text if available
        description = ''
        if isinstance(element, BeautifulSoup):
            desc_elem = element.find(class_=['description', 'event-description'])
            if desc_elem:
                description = desc_elem.text.lower()
        elif isinstance(element, dict):
            description = element.get('description', '').lower()
        
        # Combine title and description for searching
        text_to_search = f"{title.lower()} {description}"
        
        # Look for category patterns
        for category, patterns in category_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_to_search, re.IGNORECASE):
                    categories.add(category)
                    break
        
        # If no categories found, check for distance patterns
        if not categories:
            distance_pattern = re.search(r'(\d+(?:\.\d+)?)\s*(?:k|km|kilometer)', text_to_search, re.IGNORECASE)
            if distance_pattern:
                distance = float(distance_pattern.group(1))
                if distance >= 42:
                    categories.add('Marathon')
                elif distance >= 21:
                    categories.add('Half Marathon')
                elif distance >= 10:
                    categories.add('10K')
                elif distance >= 5:
                    categories.add('5K')
                elif distance >= 3:
                    categories.add('3K')
        
        return sorted(list(categories)) if categories else ['General']

    def _extract_price(self, element) -> str:
        """Extract price from event element"""
        price_elem = element.find(class_=['event-price', 'price', 'fee'])
        if price_elem:
            price_text = price_elem.text.strip()
            if price_text:
                price_text = re.sub(r'[^\d\-,.]', '', price_text)
                return f"₹{price_text}"
        return "Price TBD"

    def parse_date(self, date_str: str) -> datetime:
        """Parse date string into datetime object"""
        try:
            if not date_str or date_str.lower() in ['tbd', 'tba', 'date tbd', 'date tba']:
                return None

            date_str = date_str.strip()
            # Remove ordinal indicators (st, nd, rd, th)
            date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
            # Map of month abbreviations to full names
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

    def _extract_organizer(self, element) -> str:
        """Extract organizer name from event element"""
        try:
            org_elem = element.find(class_=['organizer', 'event-organizer'])
            return org_elem.text.strip() if org_elem else "TBD"
        except Exception as e:
            logger.error(f"Error extracting organizer: {str(e)}")
        return "TBD"

    def _extract_contact(self, element) -> str:
        """Extract contact number from event element"""
        try:
            contact_elem = element.find(string=re.compile(r'\+91|\d{10}'))
            if contact_elem:
                phone = re.search(r'(?:\+91)?(\d{10})', contact_elem).group(1)
                return f"+91{phone}"
        except Exception as e:
            logger.error(f"Error extracting contact: {str(e)}")
        return None

    def _extract_email(self, element) -> str:
        """Extract email from event element"""
        try:
            email_elem = element.find(string=re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'))
            if email_elem:
                return re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', email_elem).group(0)
        except Exception as e:
            logger.error(f"Error extracting email: {str(e)}")
        return None

    def _extract_terrain(self, title: str, element) -> str:
        """Extract terrain type from event title and description"""
        terrain_keywords = {
            'Trail': ['trail', 'mountain', 'hill', 'forest', 'jungle'],
            'Mixed': ['mixed', 'cross country', 'cross-country'],
            'Road': ['road', 'city', 'street', 'highway']
        }
        
        try:
            description = ''
            desc_elem = element.find(class_=['description', 'event-description'])
            if desc_elem:
                description = desc_elem.text.lower()
            
            combined_text = f"{title.lower()} {description}"
            
            for terrain_type, keywords in terrain_keywords.items():
                if any(keyword in combined_text for keyword in keywords):
                    return terrain_type
        except Exception as e:
            logger.error(f"Error extracting terrain: {str(e)}")
        
        return 'Road'  # Default to road if no terrain type is found

    def _extract_amenities(self, element) -> List[str]:
        """Extract available amenities from event description"""
        amenities_keywords = [
            'water station', 'aid station', 'medical support', 'ambulance',
            'parking', 'toilet', 'restroom', 'bathroom', 'changing room',
            'refreshment', 'energy drink', 'recovery zone', 'physio'
        ]
        
        try:
            amenities = set()
            desc_elem = element.find(class_=['description', 'event-description'])
            if desc_elem:
                description = desc_elem.text.lower()
                for keyword in amenities_keywords:
                    if keyword in description:
                        amenities.add(keyword.title())
        except Exception as e:
            logger.error(f"Error extracting amenities: {str(e)}")
        
        return list(amenities)