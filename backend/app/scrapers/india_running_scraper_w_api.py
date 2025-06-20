import asyncio
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.logging_config import get_logger
from .base_scraper import BaseScraper 

logger = get_logger(__name__)

# Assuming BaseScraper is defined as above or imported
class IndiaRunningAPI(BaseScraper): # Inherit from BaseScraper
    def __init__(self):
        # Call BaseScraper's init. base_url here is for the API endpoint.
        super().__init__("https://registrations-api.indiarunning.com")
        
        # Override headers as BaseScraper's default headers are for HTML GET requests.
        # These are specific to the IndiaRunning API POST request.
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Sec-Fetch-Site": "same-site",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Sec-Fetch-Mode": "cors",
            "Origin": "https://www.indiarunning.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
            "Referer": "https://www.indiarunning.com/",
            "Sec-Fetch-Dest": "empty",
            "Priority": "u=3, i",
        }
        logger.info("IndiaRunningAPI scraper initialized.")

    # Implement the abstract method from BaseScraper
    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Fetch and process events from IndiaRunning.com API."""
        all_events = []
        page_number = 1
        has_more_events = True 
        source_name = self.__class__.__name__.replace("API", "")
        logger.info(f"Starting event scraping for {source_name} using API.")

        while has_more_events:
            logger.debug(f"Fetching page {page_number} for {source_name} API.")
            events_data = await self._fetch_events_api(page_number)
            if not events_data:
                logger.info(f"No more events found for {source_name} API on page {page_number}. Ending scrape.")
                has_more_events = False
                break

            logger.info(f"Processing {len(events_data)} events from page {page_number} for {source_name} API.")
            for i, event_data in enumerate(events_data):
                try:
                    title = event_data.get("title", "Title Not Found")
                    logger.debug(f"Processing event {i+1}/{len(events_data)} on page {page_number}: '{title}'")
                    
                    parsed_date = self._parse_date(event_data.get("eventDate", {}).get("start"))
                    location_info = event_data.get("locationInfo", {})
                    raw_location_str = self._extract_raw_location(location_info)
                    city = location_info.get("city", "Unknown City") # Keep city separate for potential filtering

                    # Try to get a cleaner location, falling back to city if specific parts are missing
                    location_parts = [part.strip() for part in raw_location_str.split(',') if part.strip()]
                    display_location = location_parts[-1] if location_parts else city

                    categories = [
                        cat.get("category", "Unknown Category").strip()
                        for cat in event_data.get("categories", []) if cat.get("category")
                    ]
                    if not categories: categories = ["General"]

                    event = {
                        "title": title,
                        "date": parsed_date,
                        "location": display_location, # Use the cleaner last part or city
                        "address": raw_location_str, # Store the full address if available
                        "categories": categories,
                        "price": event_data.get("price", "Price TBD"),
                        "url": f"https://registrations.indiarunning.com/{event_data.get('slug', '')}",
                        "source": source_name, # Dynamic source name
                        "description": event_data.get("aboutRace", [{}])[0].get("content", "No description available").strip(),
                        "registration_closes": self._parse_date(event_data.get("registrationDate", {}).get("end")), # Assuming similar structure
                        "photos": event_data.get("eventImage", {}).get("url") # Extract image URL if present
                    }
                    all_events.append(event)
                    logger.debug(f"Successfully processed event: {event['title']}")
                except Exception as e:
                    logger.error(f"Error processing event data (title: '{event_data.get('title')}'): {e}. Data: {str(event_data)[:500]}", exc_info=True)

            if len(events_data) < 12: # IndiaRunning API returns max 12 events per page
                logger.info(f"Last page reached for {source_name} API (got {len(events_data)} events, expected < 12).")
                has_more_events = False
            else:
                page_number += 1
                await asyncio.sleep(0.5) # Small delay to be polite to the API
        
        logger.info(f"Finished scraping for {source_name} API. Total events processed: {len(all_events)}.")
        return all_events

    async def _fetch_events_api(self, page_no: int = 1) -> List[Dict[str, Any]]:
        """Internal method to fetch raw event data from the API."""
        url = f"{self.base_url}/ir/events/filters"
        payload = {
            "pageNo": page_no,
            "sortBy": "event-date-closest",
            "filters": {
                "distance": [], "price": [], "eventType": [], "sportType": "",
                "cities": [], "certifications": [], "eventDateDays": [],
            },
        }
        # Session is managed by BaseScraper, use its get_session method
        # client = await self.get_session() # This would get the BaseScraper session, which might not be configured for JSON POST
        # For direct httpx usage when BaseScraper session isn't suitable:
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0) as client: # Use headers defined in __init__
            try:
                logger.debug(f"Posting to API: {url} with payload for page {page_no}")
                response = await client.post(url, json=payload) # Removed self.headers as it's in AsyncClient constructor
                response.raise_for_status()
                data = response.json()
                events_list = data.get("events", [])
                logger.debug(f"API call for page {page_no} successful, received {len(events_list)} events.")
                return events_list
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error fetching events from API (page {page_no}): {e.response.status_code} - {e.response.text[:200]}", exc_info=True)
                return []
            except httpx.RequestError as e:
                 logger.error(f"Request error fetching events from API (page {page_no}): {e}", exc_info=True)
                 return []
            except Exception as e:
                logger.error(f"Unexpected error fetching events from API (page {page_no}): {e}", exc_info=True)
                return []

    def _parse_date(self, date_str: Optional[str]) -> str:
        """Parse ISO date string into 'dd Mon YYYY' format. Returns 'Date TBD' on failure or if None."""
        if not date_str:
            logger.debug("Date string is None or empty, returning 'Date TBD'.")
            return "Date TBD"
        try:
            # Handle potential 'Z' for UTC, common in ISO strings
            dt_object = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            formatted_date = dt_object.strftime("%d %b %Y")
            logger.debug(f"Parsed date string '{date_str}' to '{formatted_date}'.")
            return formatted_date
        except ValueError as e:
            logger.warning(f"Could not parse date string: '{date_str}'. Error: {e}. Returning 'Date TBD'.")
            return "Date TBD"

    def _extract_raw_location(self, location_info: Dict[str, Any]) -> str:
        """Extracts a raw, comma-separated location string from locationInfo dictionary."""
        if not location_info:
            logger.debug("Location info is empty, returning 'Location TBD'.")
            return "Location TBD"
        
        parts = []
        if location_info.get("addressLine1"): parts.append(location_info["addressLine1"])
        if location_info.get("addressLine2"): parts.append(location_info["addressLine2"])
        if location_info.get("area"): parts.append(location_info["area"])
        if location_info.get("city"): parts.append(location_info["city"])
        if location_info.get("state"): parts.append(location_info["state"])
        if location_info.get("country"): parts.append(location_info["country"])
        
        raw_location = ", ".join(filter(None, parts))
        if not raw_location:
            logger.debug("No location parts found in location_info, returning 'Location TBD'.")
            return "Location TBD"
        logger.debug(f"Extracted raw location: '{raw_location}' from {location_info}.")
        return raw_location