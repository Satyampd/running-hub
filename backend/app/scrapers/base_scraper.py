from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import aiohttp
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        self._session: Optional[aiohttp.ClientSession] = None

    async def get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp session."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(headers=self.headers, timeout=timeout)
        return self._session

    async def close(self):
        """Close the session if it exists."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def fetch_page(self, url: str) -> str:
        """Fetch page content asynchronously."""
        try:
            session = await self.get_session()
            async with session.get(url, allow_redirects=True, ssl=False) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.error(f"Error fetching {url}: Status {response.status}")
                    return ""
        except aiohttp.ClientError as e:
            logger.error(f"Network error fetching {url}: {str(e)}")
            return ""
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {str(e)}")
            return ""

    @abstractmethod
    async def scrape_events(self) -> List[Dict[str, Any]]:
        """
        Abstract method to be implemented by specific scrapers.
        Returns a list of event dictionaries with standardized format:
        {
            'title': str,
            'date': str,
            'location': str,
            'categories': List[str],
            'price': str,
            'url': str,
            'source': str
        }
        """
        pass

    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content using BeautifulSoup with lxml parser."""
        return BeautifulSoup(html, 'lxml')

    async def __aenter__(self):
        """Support for async context manager."""
        await self.get_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cleanup for async context manager."""
        await self.close() 