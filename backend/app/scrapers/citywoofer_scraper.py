from typing import List, Dict, Any, Optional
from .base_scraper import BaseScraper
# from bs4 import BeautifulSoup # Not used
import json
import re
import aiohttp # Keep for direct usage if BaseScraper session is not suitable
from app.core.logging_config import get_logger # Import the new logger
from datetime import datetime

logger = get_logger(__name__) # Use the new logger

class CityWooferScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://www.citywoofer.com")
        # Headers for CityWoofer API are different from BaseScraper's default HTML headers
        self.api_headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': self.base_url # Good practice to include Referer
        }
        logger.info("CityWooferScraper initialized.")
        
    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from CityWoofer API for multiple cities."""
        all_scraped_events = []
        # Cities known to have running events on CityWoofer, can be expanded
        cities_to_scrape = ["bangalore", "delhi", "mumbai", "pune", "hyderabad", "chandigarh", "kolkata", "chennai", "ahmedabad", "jaipur"]
        source_name = self.__class__.__name__.replace("Scraper", "")
        
        logger.info(f"Starting event scraping for {source_name} across {len(cities_to_scrape)} cities.")

        # Create a single session for all API calls to these cities for efficiency
        # BaseScraper.get_session() might be for HTML, API needs specific headers
        async with aiohttp.ClientSession(headers=self.api_headers) as session:
            for city in cities_to_scrape:
                logger.info(f"Fetching events for city: {city.title()} from {source_name}.")
                api_url = f"{self.base_url}/api/events/search"
                params = {
                    'q': 'run marathon race 5k 10k half full ultra', # Broader search query
                    'city': city,
                    'category': 'sports', # Sports category usually includes runs
                    'limit': 50, # Maximize events per city
                    'offset': 0
                }
                
                try:
                    async with session.get(api_url, params=params, timeout=30) as response:
                        response.raise_for_status() # Raise an exception for HTTP errors
                        try:
                            data = await response.json()
                            if 'events' in data and data['events']:
                                logger.info(f"Received {len(data['events'])} event items for {city.title()} from {source_name} API.")
                                for i, event_data in enumerate(data['events']):
                                    title = event_data.get('title', 'Title Not Found').strip()
                                    logger.debug(f"Processing event {i+1}/{len(data['events'])}: '{title}' in {city.title()}")
                                    
                                    # Filter for running events more reliably
                                    if not self._is_running_event(title, event_data.get('description', '')):
                                        logger.debug(f"Skipping non-running event: '{title}'.")
                                        continue
                                        
                                    parsed_date = self._parse_cw_date(event_data.get('start_date'))
                                    venue_info = event_data.get('venue', {})
                                    location_str = f"{venue_info.get('name', '').strip()}, {city.title()}".strip(", ")
                                    if not venue_info.get('name'): location_str = city.title()

                                    categories = ["Running"] # Default category
                                    extracted_cats = self._extract_categories_from_title(title)
                                    if extracted_cats: categories.extend(extracted_cats)
                                    else: categories.append("Fun Run") # Fallback if no specific distance
                                    categories = list(set(categories)) # Unique categories
                                        
                                    event_url = event_data.get('url') or f"{self.base_url}/e/{event_data.get('slug')}"
                                    description = await self._fetch_event_details(event_url) if event_url else event_data.get('short_description','')

                                    event_dict = {
                                        'title': title,
                                        'date': parsed_date,
                                        'location': location_str,
                                        'address': venue_info.get('address', None), # Add address if available
                                        'categories': categories,
                                        'price': f"₹{event_data.get('price_starts_at', 'TBD')}",
                                        'url': event_url,
                                        'source': source_name,
                                        'description': description.strip(),
                                        'photos': event_data.get('photos') # Capture image URL
                                    }
                                    
                                    # Add event if URL is unique to avoid duplicates from different city searches for same event
                                    if not any(e['url'] == event_dict['url'] for e in all_scraped_events):
                                        all_scraped_events.append(event_dict)
                                        logger.debug(f"Added event: '{title}' from {city.title()}.")
                                    else:
                                        logger.debug(f"Duplicate event URL skipped: '{title}' ({event_url}).")
                            else:
                                logger.info(f"No events found for {city.title()} in API response or 'events' key missing/empty.")
                        except json.JSONDecodeError as e_json:
                            logger.error(f"Invalid JSON response from {api_url} for city {city.title()}: {e_json}. Response text: {await response.text()[:200]}")
                        except aiohttp.ClientResponseError as e_http:
                             logger.error(f"HTTP error for {city.title()} from {api_url}: {e_http.status} - {e_http.message}", exc_info=True)
                        except Exception as e_parse: # Catch other parsing errors
                            logger.error(f"Error parsing event data for '{event_data.get('title')}' in {city.title()}: {e_parse}", exc_info=True)
                except aiohttp.ClientError as e_client: # Catch client-side network errors
                    logger.error(f"Client error fetching events for city {city.title()} from {source_name}: {e_client}", exc_info=True)
                except Exception as e_city: # Catch any other errors for a specific city
                    logger.error(f"General error fetching events for city {city.title()} from {source_name}: {e_city}", exc_info=True)
                await asyncio.sleep(0.5) # Be polite to the API
                    
        logger.info(f"Finished scraping {source_name}. Total unique events found: {len(all_scraped_events)}.")
        return all_scraped_events

    def _is_running_event(self, title: str, description: str) -> bool:
        """Check if the event is likely a running event based on title and description keywords."""
        keywords = ['run', 'marathon', 'race', 'jog', 'sprint', 'trail', 'ultra', '5k', '10k', '21k', '42k', 'fun run', 'charity run']
        title_lower = title.lower()
        description_lower = description.lower() if description else ""
        if any(keyword in title_lower for keyword in keywords):
            return True
        if any(keyword in description_lower for keyword in keywords):
            logger.debug(f"Identified running event '{title}' based on description keywords.")
            return True
        return False

    def _parse_cw_date(self, date_str: Optional[str]) -> str:
        """Parse CityWoofer date string (e.g., '2023-10-28') to 'dd Mon YYYY'."""
        if not date_str:
            return "Date TBD"
        try:
            # Common format from CityWoofer seems to be YYYY-MM-DD
            dt_object = datetime.strptime(date_str, "%Y-%m-%d")
            return dt_object.strftime("%d %b %Y")
        except ValueError:
            logger.warning(f"Could not parse CityWoofer date: '{date_str}'. Trying other formats.")
            # Try to handle if it's already in a different common format or includes time
            try:
                dt_object = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                return dt_object.strftime("%d %b %Y")
            except ValueError:
                logger.error(f"Failed to parse CityWoofer date string '{date_str}' with multiple formats.")
                return "Date TBD"

    def _extract_categories_from_title(self, title: str) -> List[str]:
        """Extracts potential running categories/distances from event title."""
        categories = []
        title_lower = title.lower()
        # More specific patterns first
        distance_patterns = {
            "Half Marathon": [r"half marathon", r"21k", r"21\.1k", r"13\.1\s*miles"],
            "Full Marathon": [r"full marathon", r"marathon", r"42k", r"42\.2k", r"26\.2\s*miles"],
            "10K Run": [r"10k", r"10\s*km", r"10000m"],
            "5K Run": [r"5k", r"5\s*km", r"5000m"],
            "Ultra Marathon": [r"ultra marathon", r"ultra run", r"50k", r"100k"],
            "3K Run": [r"3k", r"3\s*km"],
            "Trail Run": [r"trail run"],
        }
        for cat, patterns in distance_patterns.items():
            for p in patterns:
                if re.search(p, title_lower):
                    categories.append(cat)
                    # Once a major category like "Half Marathon" is found, we might not need to add "10k" if it was part of its name.
                    # However, some events list multiple distances, so allow multiple categories.
        return list(set(categories)) # Return unique categories found

    async def _fetch_event_details(self, event_url: str) -> str:
        """Fetch detailed description from the event's page using BaseScraper.fetch_page."""
        if not event_url or not event_url.startswith("http"):
            logger.debug(f"Invalid event URL for fetching details: {event_url}")
            return ""
        logger.debug(f"Fetching details from event page: {event_url}")
        try:
            # Using BaseScraper's fetch_page for HTML content
            # Need to ensure the session used by BaseScraper is appropriate or create a new one
            html_content = await self.fetch_page(event_url) # This uses BaseScraper session with its default HTML headers
            if html_content:
                soup = self.parse_html(html_content) # Use BaseScraper's parse_html
                # Common selectors for description, adjust based on CityWoofer's structure
                desc_selectors = ["div.event-description", "div.description", "section#about", "article.event-details"]
                for selector in desc_selectors:
                    description_tag = soup.select_one(selector)
                    if description_tag:
                        text = description_tag.get_text(separator="\n", strip=True)
                        logger.debug(f"Extracted description (length {len(text)}) from {event_url} using selector '{selector}'.")
                        return text
                logger.warning(f"No description found on {event_url} using common selectors.")
                return ""
            return ""
        except Exception as e:
            logger.error(f"Error fetching or parsing event details from {event_url}: {e}", exc_info=True)
            return "" 