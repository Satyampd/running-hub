from typing import List, Dict, Any
from .base_scraper import BaseScraper
from bs4 import BeautifulSoup
import json
import re
import aiohttp
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class CityWooferScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://www.citywoofer.com")
        self.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        })
        
    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from CityWoofer"""
        events = []
        cities = ["bangalore", "delhi", "mumbai", "pune", "hyderabad", "chandigarh"]
        
        try:
            # Search for running events in each city
            for city in cities:
                try:
                    # Use their API to get events
                    api_url = f"{self.base_url}/api/events/search"
                    params = {
                        'q': 'running marathon',
                        'city': city,
                        'category': 'sports',
                        'limit': 50,
                        'offset': 0
                    }
                    
                    async with aiohttp.ClientSession(headers=self.headers) as session:
                        async with session.get(api_url, params=params) as response:
                            if response.status == 200:
                                try:
                                    data = await response.json()
                                    if 'events' in data:
                                        for event_data in data['events']:
                                            try:
                                                # Check if it's a running event
                                                title = event_data.get('title', '').lower()
                                                if not any(word in title for word in ['run', 'marathon', 'race', '5k', '10k', '21k', '42k']):
                                                    continue
                                                    
                                                # Extract categories
                                                categories = ["running"]
                                                for pattern in ['Marathon', 'Half Marathon', '10K', '5K', '3K', 'Ultra']:
                                                    if pattern.lower() in title:
                                                        categories.append(pattern)
                                                        
                                                # Get location details
                                                venue = event_data.get('venue', {})
                                                location = f"{venue.get('name', '')}, {city.title()}" if venue.get('name') else city.title()
                                                
                                                event = {
                                                    'title': event_data.get('title', 'Unknown Event'),
                                                    'date': event_data.get('start_date', 'Date TBD'),
                                                    'location': location,
                                                    'categories': categories,
                                                    'price': f"₹{event_data.get('price_starts_at', 'TBD')}",
                                                    'url': event_data.get('url') or f"{self.base_url}/e/{event_data.get('slug')}",
                                                    'source': 'CityWoofer'
                                                }
                                                
                                                # Only add if we haven't seen this event before
                                                if not any(e['url'] == event['url'] for e in events):
                                                    events.append(event)
                                                    
                                            except Exception as e:
                                                logger.error(f"Error parsing event data: {e}")
                                                continue
                                except json.JSONDecodeError:
                                    logger.error(f"Invalid JSON response from {api_url}")
                                    continue
                            else:
                                logger.error(f"API request failed for {city} with status {response.status}")
                                continue
                                
                except Exception as e:
                    logger.error(f"Error fetching events for city {city}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error fetching CityWoofer events: {e}")
            
        return events 