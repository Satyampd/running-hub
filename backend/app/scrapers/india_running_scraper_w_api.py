import asyncio
import httpx
from typing import List, Dict, Any
from datetime import datetime
import logging
from .base_scraper import BaseScraper 


logger = logging.getLogger(__name__)

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

    # Implement the abstract method from BaseScraper
    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Fetch and process events from IndiaRunning.com API."""
        all_events = []
        page_number = 1
        has_more_events = True 

        while has_more_events:
            events_data = await self._fetch_events_api(page_number)
            if not events_data:
                has_more_events = False # No more events to fetch
                break

            for event_data in events_data:
                try:
                    event = {
                        "title": event_data.get("title", "Unknown Event"),
                        "date": self._parse_date(event_data["eventDate"]["start"]) if event_data.get("eventDate") else "Date TBD",
                        "location": self._extract_location(event_data.get("locationInfo", {})).split(',')[-1] ,
                        "categories": [
                            cat.get("category", "Unknown Category")
                            for cat in event_data.get("categories", [])
                        ],
                        "price": event_data.get("price", "Price TBD"),
                        "url": f"https://registrations.indiarunning.com/{event_data.get('slug', '')}",
                        "source": "IndiaRunning",
                        "description": event_data["aboutRace"][0]["content"] if event_data.get("aboutRace") else "No description available",
                    }
                    all_events.append(event)
                    logger.info(f"Successfully processed event: {event['title']}")
                except Exception as e:
                    logger.error(f"Error processing event: {e}, data: {event_data}")

            # IndiaRunning API returns a maximum of 12 events per page.
            # If we get less than 12, it means we are on the last page.
            if len(events_data) < 12:
                has_more_events = False
            else:
                page_number += 1
        return all_events

    async def _fetch_events_api(self, page_no: int = 1) -> List[Dict[str, Any]]:
        """Internal method to fetch raw event data from the API using httpx."""
        url = f"{self.base_url}/ir/events/filters"
        payload = {
            "pageNo": page_no,
            "sortBy": "event-date-closest",
            "filters": {
                "distance": [],
                "price": [],
                "eventType": [],
                "sportType": "",
                "cities": [],
                "certifications": [],
                "eventDateDays": [],
            },
        }
        async with httpx.AsyncClient() as client:
            try:
                # Use self.headers here for the API call (which were overridden in __init__)
                response = await client.post(url, headers=self.headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("events", [])
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error fetching events from API: {e}")
                return []
            except httpx.RequestError as e:
                 logger.error(f"Request error fetching events from API: {e}")
                 return []
            except Exception as e:
                logger.error(f"Error fetching events from API: {e}")
                return []

    def _parse_date(self, date_str: str) -> str:
        """Parse date string into a consistent format."""
        try:
            if not date_str:
                return "Date TBD"

            dt_object = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt_object.strftime("%d %b %Y")
        except ValueError:
            logger.warning(f"Could not parse date: {date_str}")
            return "Date TBD"

    def _extract_location(self, location_info: Dict[str, str]) -> str:
        """Extract location string from locationInfo dictionary."""
        if not location_info:
            return "Location TBD"
        city = location_info.get("city", "Unknown City")
        area = location_info.get("area", "")
        return f"{area}, {city}".strip(", ")