from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import aiohttp
from bs4 import BeautifulSoup
from app.core.logging_config import get_logger

logger = get_logger(__name__)

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
        logger.debug(f"BaseScraper initialized for URL: {base_url}")

    async def get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp session."""
        if self._session is None or self._session.closed:
            logger.debug("Creating new aiohttp ClientSession.")
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(headers=self.headers, timeout=timeout)
        else:
            logger.debug("Reusing existing aiohttp ClientSession.")
        return self._session

    async def close(self):
        """Close the session if it exists."""
        if self._session and not self._session.closed:
            logger.debug("Closing aiohttp ClientSession.")
            await self._session.close()
        else:
            logger.debug("aiohttp ClientSession already closed or does not exist.")

    async def fetch_page(self, url: str) -> str:
        """Fetch page content asynchronously."""
        logger.debug(f"Fetching page: {url}")
        try:
            session = await self.get_session()
            async with session.get(url, allow_redirects=True, ssl=False) as response:
                response.raise_for_status()
                logger.info(f"Successfully fetched {url} with status {response.status}")
                return await response.text()
        except aiohttp.ClientResponseError as e:
            logger.error(f"HTTP error fetching {url}: Status {e.status}, Message: {e.message}", exc_info=True)
            return ""
        except aiohttp.ClientError as e:
            logger.error(f"Client error fetching {url}: {e}", exc_info=True)
            return ""
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}", exc_info=True)
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
        logger.debug(f"Entering async context for {self.__class__.__name__}.")
        await self.get_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cleanup for async context manager."""
        logger.debug(f"Exiting async context for {self.__class__.__name__}. Exc type: {exc_type}")
        await self.close() 