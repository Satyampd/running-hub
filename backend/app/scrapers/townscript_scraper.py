from typing import List, Dict, Any
from .base_scraper import BaseScraper
from bs4 import BeautifulSoup
import aiohttp
import re
from datetime import datetime, timedelta
import asyncio

class TownscriptScraper(BaseScraper):
    def __init__(self):
        super().__init__("https://www.townscript.com")
        self.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'DNT': '1'
        })

    async def scrape_events(self) -> List[Dict[str, Any]]:
        """Scrape running events from Townscript"""
        events = []
        cities = ["mumbai", "delhi", "bangalore", "pune", "chennai", "hyderabad"]
        search_terms = ["marathon", "running", "race", "run"]

        # Try different URL patterns
        url_patterns = [
            "/m/discover/sports?city={city}",
            "/m/discover?q={term}&city={city}",
            "/m/in/{city}/sports",
            "/m/in/{city}/running",
            "/m/in/india/running",
            "/m/in/india/marathon",
            "/m/sports/running",
            "/m/sports/marathon"
        ]

        async with aiohttp.ClientSession(headers=self.headers) as session:
            tasks = []
            for pattern in url_patterns:
                for city in cities:
                    for term in search_terms:
                        url = f"{self.base_url}{pattern.format(city=city, term=term)}"
                        tasks.append(self.fetch_and_parse_page(session, url, city))

            # Execute all tasks concurrently
            await asyncio.gather(*tasks, return_exceptions=True)

        return events

    async def fetch_and_parse_page(self, session: aiohttp.ClientSession, url: str, city: str) -> None:
        """Fetch and parse a single page"""
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Try multiple selectors for event containers
                    event_containers = []
                    
                    # Mobile specific class names
                    mobile_classes = [
                        'event-card-mobile',
                        'mobile-event-card',
                        'm-event-card',
                        'event-item-mobile',
                        'mobile-event-item'
                    ]
                    
                    for class_name in mobile_classes:
                        containers = soup.find_all(['div', 'article'], class_=lambda x: x and class_name in str(x).lower())
                        event_containers.extend(containers)
                    
                    # Try data attributes
                    containers = soup.find_all(['div', 'article'], attrs={'data-view': 'mobile'})
                    event_containers.extend(containers)
                    
                    # Try general event containers
                    containers = soup.find_all(['div', 'article'], class_=lambda x: x and 'event' in str(x).lower())
                    event_containers.extend(containers)
                    
                    for container in event_containers:
                        try:
                            # Try to find title
                            title = None
                            
                            # Try mobile specific title classes
                            title_classes = [
                                'event-title-mobile',
                                'mobile-event-title',
                                'event-name-mobile',
                                'mobile-event-name'
                            ]
                            
                            for title_class in title_classes:
                                title_elem = container.find(['h1', 'h2', 'h3', 'div'], 
                                    class_=lambda x: x and title_class in str(x).lower())
                                if title_elem:
                                    title = title_elem.get_text(strip=True)
                                    break
                            
                            # If no title found, try general title classes
                            if not title:
                                title_elem = container.find(['h1', 'h2', 'h3', 'div'], 
                                    class_=lambda x: x and any(c in str(x).lower() for c in ['title', 'name', 'heading']))
                                if title_elem:
                                    title = title_elem.get_text(strip=True)
                            
                            # If still no title, try first heading
                            if not title:
                                title_elem = container.find(['h1', 'h2', 'h3'])
                                if title_elem:
                                    title = title_elem.get_text(strip=True)
                            
                            if not title:
                                continue
                            
                            # Check if it's a running event
                            if not any(word in title.lower() for word in ['run', 'marathon', 'race', '5k', '10k', '21k', '42k']):
                                continue
                            
                            # Extract categories
                            categories = []
                            for pattern in ['Marathon', 'Half Marathon', '10K', '5K', '3K', 'Ultra']:
                                if pattern.lower() in title.lower():
                                    categories.append(pattern)
                            
                            # Try to find date
                            date = None
                            date_classes = [
                                'event-date-mobile',
                                'mobile-event-date',
                                'event-time-mobile',
                                'mobile-event-time'
                            ]
                            
                            for date_class in date_classes:
                                date_elem = container.find(['div', 'span', 'time'], 
                                    class_=lambda x: x and date_class in str(x).lower())
                                if date_elem:
                                    date = date_elem.get_text(strip=True)
                                    break
                            
                            if not date:
                                # Try general date classes
                                date_elem = container.find(['div', 'span', 'time'], 
                                    class_=lambda x: x and any(c in str(x).lower() for c in ['date', 'time', 'when']))
                                if date_elem:
                                    date = date_elem.get_text(strip=True)
                            
                            event_date = date if date else 'Date TBD'
                            
                            # Try to find location
                            location = None
                            location_classes = [
                                'event-venue-mobile',
                                'mobile-event-venue',
                                'event-location-mobile',
                                'mobile-event-location'
                            ]
                            
                            for location_class in location_classes:
                                location_elem = container.find(['div', 'span'], 
                                    class_=lambda x: x and location_class in str(x).lower())
                                if location_elem:
                                    location = location_elem.get_text(strip=True)
                                    break
                            
                            if not location:
                                # Try general location classes
                                location_elem = container.find(['div', 'span'], 
                                    class_=lambda x: x and any(c in str(x).lower() for c in ['venue', 'location', 'place', 'where']))
                                if location_elem:
                                    location = location_elem.get_text(strip=True)
                            
                            if not location:
                                location = city.title()
                            
                            # Try to find price
                            price = None
                            price_classes = [
                                'event-price-mobile',
                                'mobile-event-price',
                                'ticket-price-mobile',
                                'mobile-ticket-price'
                            ]
                            
                            for price_class in price_classes:
                                price_elem = container.find(['div', 'span'], 
                                    class_=lambda x: x and price_class in str(x).lower())
                                if price_elem:
                                    price = price_elem.get_text(strip=True)
                                    break
                            
                            if not price:
                                # Try general price classes
                                price_elem = container.find(['div', 'span'], 
                                    class_=lambda x: x and any(c in str(x).lower() for c in ['price', 'fee', 'cost', 'amount']))
                                if price_elem:
                                    price = price_elem.get_text(strip=True)
                            
                            if price:
                                if not price.startswith('₹'):
                                    price_match = re.search(r'(?:Rs\.?|₹)\s*(\d+)', price)
                                    if price_match:
                                        price = f'₹{price_match.group(1)}'
                                    else:
                                        price = f'₹{price}'
                            else:
                                price = 'Price TBD'
                            
                            # Try to find URL
                            url = None
                            link = container.find('a', href=True)
                            if link:
                                url = link['href']
                                if not url.startswith('http'):
                                    url = f"{self.base_url}{url}"
                            
                            if not url:
                                continue
                            
                            event = {
                                'title': title,
                                'date': event_date,
                                'location': location,
                                'categories': categories,
                                'price': price,
                                'url': url,
                                'source': 'Townscript.com'
                            }
                            
                            # Only add if we haven't seen this event before
                            if not any(e['url'] == event['url'] for e in events):
                                events.append(event)
                            
                        except Exception as e:
                            print(f"Error parsing event container: {e}")
                            continue
                            
        except Exception as e:
            print(f"Error fetching URL {url}: {e}")
            return 