from typing import List, Dict, Any
from .base_scraper import BaseScraper
from bs4 import BeautifulSoup
import json
import re
import aiohttp

class AllEventsScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://allevents.in")
        self.headers.update({
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest'
        })

    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from AllEvents.in"""
        events = []
        cities = ["mumbai", "delhi", "bangalore", "pune", "chennai", "hyderabad", "kolkata", "ahmedabad"]
        
        for city in cities:
            try:
                # Use their API to get events
                api_url = f"{self.base_url}/api/events/list?category=sports-fitness&subcategory=running-marathon&city={city}&page=1&limit=50"
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    async with session.get(api_url) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            if 'data' in data and 'events' in data['data']:
                                for event_data in data['data']['events']:
                                    try:
                                        # Extract event details
                                        title = event_data.get('title', 'Unknown Event')
                                        
                                        # Extract categories
                                        categories = []
                                        for pattern in ['Marathon', 'Half Marathon', '10K', '5K', '3K', 'Ultra']:
                                            if pattern.lower() in title.lower():
                                                categories.append(pattern)
                                                
                                        # Get location details
                                        venue = event_data.get('venue', {})
                                        location_parts = []
                                        if venue.get('name'):
                                            location_parts.append(venue['name'])
                                        if venue.get('city'):
                                            location_parts.append(venue['city'])
                                        location = ', '.join(location_parts) if location_parts else city.title()
                                        
                                        # Get date
                                        start_date = event_data.get('start_time', 'Date TBD')
                                        if start_date != 'Date TBD':
                                            # Convert timestamp to readable date
                                            from datetime import datetime
                                            start_date = datetime.fromtimestamp(int(start_date)).strftime('%d %b %Y')
                                        
                                        event = {
                                            'title': title,
                                            'date': start_date,
                                            'location': location,
                                            'categories': categories,
                                            'url': event_data.get('url') or f"{self.base_url}/e/{event_data.get('slug')}",
                                            'source': 'AllEvents.in'
                                        }
                                        
                                        # Only add if we haven't seen this event before
                                        if not any(e['url'] == event['url'] for e in events):
                                            events.append(event)
                                            
                                    except Exception as e:
                                        print(f"Error parsing AllEvents.in event: {e}")
                                        continue
                        else:
                            print(f"API request failed for {city} with status {response.status}")
                            
            except Exception as e:
                print(f"Error fetching AllEvents.in events for city {city}: {e}")
                continue
                
        return events 