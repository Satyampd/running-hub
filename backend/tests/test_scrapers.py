import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock, patch
import aiohttp
from bs4 import BeautifulSoup
import logging

from app.scrapers.base_scraper import BaseScraper, logger as base_scraper_logger # Import the logger to check its calls

# A concrete implementation for testing BaseScraper's non-abstract methods
class ConcreteScraper(BaseScraper):
    async def scrape_events(self) -> list:
        return [] # Dummy implementation

@pytest.fixture
def scraper(request):  # Changed: now a synchronous fixture
    s = ConcreteScraper("http://test.com")
    
    def finalizer():
        # Get a running event loop or create a new one for teardown
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        if s._session and not s._session.closed:
            # print(f"Finalizing and closing session for {s.base_url} in loop {id(loop)}")
            loop.run_until_complete(s.close()) # Ensure close is run in an event loop
        # else:
            # print(f"Session for {s.base_url} already closed or None during finalization.")

    request.addfinalizer(finalizer)
    return s

@pytest.fixture
def mock_aiohttp_session():
    """Fixture to mock aiohttp.ClientSession and its get method."""
    mock_session = MagicMock(spec=aiohttp.ClientSession)
    mock_session.closed = False # Simulate an open session initially
    mock_response = AsyncMock(spec=aiohttp.ClientResponse)
    mock_session.get.return_value.__aenter__.return_value = mock_response # for async with session.get(...)
    # mock_session.get.return_value = mock_response # If not using async with
    return mock_session, mock_response

@pytest.mark.asyncio
async def test_base_scraper_initialization(scraper):
    assert scraper.base_url == "http://test.com"
    assert "User-Agent" in scraper.headers

@pytest.mark.asyncio
async def test_get_session_creates_new(scraper):
    assert scraper._session is None
    session = await scraper.get_session()
    assert isinstance(session, aiohttp.ClientSession)
    assert session is scraper._session
    assert not session.closed

@pytest.mark.asyncio
async def test_get_session_reuses_existing(scraper):
    session1 = await scraper.get_session()
    session2 = await scraper.get_session()
    assert session1 is session2

@pytest.mark.asyncio
async def test_get_session_creates_new_if_closed(scraper):
    session1 = await scraper.get_session()
    await session1.close() # Manually close it
    assert session1.closed
    session2 = await scraper.get_session()
    assert session1 is not session2 # Should be a new session instance
    assert isinstance(session2, aiohttp.ClientSession)
    assert not session2.closed

@pytest.mark.asyncio
async def test_close_session(scraper):
    session = await scraper.get_session()
    await scraper.close()
    assert session.closed
    assert scraper._session is None or scraper._session.closed # Accessing _session directly for test clarity

@pytest.mark.asyncio
@patch('aiohttp.ClientSession') # Patch the class itself
async def test_fetch_page_success(MockClientSession, scraper):
    mock_session_instance = MockClientSession.return_value
    mock_session_instance.closed = False
    mock_session_instance.close = AsyncMock() # Ensure 'close' is awaitable for teardown

    mock_response = AsyncMock(spec=aiohttp.ClientResponse)
    mock_response.status = 200
    mock_response.text.return_value = "<html><body>Test</body></html>"
    
    # Configure the context manager for session.get()
    async_get_context_manager = AsyncMock()
    async_get_context_manager.__aenter__.return_value = mock_response
    mock_session_instance.get.return_value = async_get_context_manager

    # Override scraper's internal session creation to use our patched one
    scraper._session = mock_session_instance 

    content = await scraper.fetch_page("http://test.com/page1")
    assert content == "<html><body>Test</body></html>"
    mock_session_instance.get.assert_called_once_with("http://test.com/page1", allow_redirects=True, ssl=False)

@pytest.mark.asyncio
@patch('aiohttp.ClientSession')
async def test_fetch_page_http_error(MockClientSession, scraper):
    mock_session_instance = MockClientSession.return_value
    mock_session_instance.closed = False
    mock_session_instance.close = AsyncMock() # Ensure 'close' is awaitable for teardown

    mock_response = AsyncMock(spec=aiohttp.ClientResponse)
    mock_response.status = 404

    async_get_context_manager = AsyncMock()
    async_get_context_manager.__aenter__.return_value = mock_response
    mock_session_instance.get.return_value = async_get_context_manager
    scraper._session = mock_session_instance

    with patch.object(base_scraper_logger, 'error') as mock_log_error:
        content = await scraper.fetch_page("http://test.com/notfound")
        assert content == ""
        mock_log_error.assert_called_once_with("Error fetching http://test.com/notfound: Status 404")

@pytest.mark.asyncio
@patch('aiohttp.ClientSession')
async def test_fetch_page_network_error(MockClientSession, scraper):
    mock_session_instance = MockClientSession.return_value
    mock_session_instance.closed = False
    mock_session_instance.close = AsyncMock() # Ensure 'close' is awaitable for teardown

    mock_session_instance.get.side_effect = aiohttp.ClientError("Network down")
    scraper._session = mock_session_instance

    with patch.object(base_scraper_logger, 'error') as mock_log_error:
        content = await scraper.fetch_page("http://test.com/networkissue")
        assert content == ""
        mock_log_error.assert_called_once_with("Network error fetching http://test.com/networkissue: Network down")

@pytest.mark.asyncio
async def test_parse_html(scraper):
    html_content = "<html><head><title>Test</title></head><body><p>Hello</p></body></html>"
    soup = scraper.parse_html(html_content)
    assert isinstance(soup, BeautifulSoup)
    assert soup.title.string == "Test"
    assert soup.p.string == "Hello"

@pytest.mark.asyncio
async def test_async_context_manager(scraper):
    session_before_enter = scraper._session
    async with scraper as s:
        assert s._session is not None
        assert not s._session.closed
        # If session was None before, it should be created now
        if session_before_enter is None:
            assert s._session is not session_before_enter 
        else: # If a session existed (e.g. from a previous get_session call in the same test)
            assert s._session is session_before_enter
        
        session_in_context = s._session
    
    assert session_in_context.closed
    # BaseScraper.__aexit__ calls self.close(), which sets self._session to None
    # if it was the session it managed and closed.
    # If get_session() was called multiple times, self._session might point to the last one.
    # The key is that the session active *during* the context was closed.
    assert scraper._session is None or scraper._session.closed 

# --- Tests for IndiaRunningScraper ---
from app.scrapers.india_running_scraper import IndiaRunningScraper, logger as ir_logger
from datetime import datetime as dt # Alias to avoid conflict with the datetime module itself

@pytest.fixture
def india_running_scraper_fixture(request): # Synchronous fixture
    s = IndiaRunningScraper(db=None)
    def finalizer():
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        if hasattr(s, '_session') and s._session and not s._session.closed:
            loop.run_until_complete(s.close())
    request.addfinalizer(finalizer)
    return s

# Tests for IndiaRunningScraper.parse_date() - now synchronous tests
@pytest.mark.parametrize("date_str, expected_date_tuple", [
    ("31 May 2024", (2024, 5, 31)),
    ("May 31, 2024", (2024, 5, 31)),
    ("May 31,2024", (2024, 5, 31)),
    ("May 31 2024", (2024, 5, 31)),
    ("1st Jun 2025", (2025, 6, 1)),
    ("JUL 22nd, 2023", (2023, 7, 22)),
    ("05/08/2024", (2024, 8, 5)),
    ("2024-12-25", (2024, 12, 25)),
    ("Oct 10", (dt.now().year if dt.now().month < 10 or (dt.now().month == 10 and dt.now().day <=10) else dt.now().year + 1, 10, 10)), # Refined year logic slightly
    ("15 Jan", (dt.now().year if dt.now().month == 1 and dt.now().day <=15 else (dt.now().year + 1 if dt.now().month > 1 else dt.now().year), 1, 15)),
    ("Invalid Date", None),
    ("TBD", None),
    ("Date TBA", None),
    (None, None),
    ("Feb 29, 2024", (2024, 2, 29)),
    ("Feb 29, 2023", None),
    ("20th March 2023 - 22nd March 2023", (2023, 3, 20)),
])
def test_ir_parse_date(india_running_scraper_fixture, date_str, expected_date_tuple):
    # This test is now synchronous
    scraper = india_running_scraper_fixture
    parsed_dt_obj = scraper.parse_date(date_str)
    if expected_date_tuple:
        assert parsed_dt_obj is not None
        assert (parsed_dt_obj.year, parsed_dt_obj.month, parsed_dt_obj.day) == expected_date_tuple
    else:
        assert parsed_dt_obj is None

@patch('app.scrapers.india_running_scraper.datetime')
def test_ir_parse_date_year_assumption(mock_datetime, india_running_scraper_fixture):
    # This test is now synchronous
    scraper = india_running_scraper_fixture
    mock_datetime.now.return_value = dt(2024, 1, 15)
    parsed = scraper.parse_date("Oct 10")
    assert parsed == dt(2024, 10, 10)
    mock_datetime.now.return_value = dt(2024, 11, 1)
    parsed = scraper.parse_date("May 20")
    assert parsed == dt(2025, 5, 20)
    mock_datetime.now.return_value = dt(2024, 3, 10)
    parsed = scraper.parse_date("Mar 25")
    assert parsed == dt(2024, 3, 25)
    mock_datetime.now.return_value = dt(2024, 3, 20)
    parsed = scraper.parse_date("Mar 15")
    assert parsed == dt(2025, 3, 15)

@pytest.mark.parametrize("input_text, expected_slug", [
    ("Hello World", "hello-world"),
    ("  Multiple   Spaces  ", "multiple-spaces"),
    ("Special!@#Characters%^&*(+=", "specialcharacters"),
    ("Already-a-slug", "already-a-slug"),
    ("  Leading-and-trailing-dashes--  ", "leading-and-trailing-dashes"),
    ("UPPERCASE TEXT", "uppercase-text"),
    ("தமிழ் சோதனை", "தமிழ்-சோதனை"),
    ("", ""),
])
def test_ir_slugify(india_running_scraper_fixture, input_text, expected_slug):
    # This test is now synchronous
    scraper = india_running_scraper_fixture
    # Removed the skip logic for unicode, assuming direct pass/fail is better.
    assert scraper.slugify(input_text) == expected_slug


@pytest.mark.asyncio
async def test_fetch_event_description_success(india_running_scraper_fixture, mock_aiohttp_session):
    scraper = india_running_scraper_fixture
    mock_session, mock_response = mock_aiohttp_session
    mock_response.status = 200
    mock_response.text.return_value = """
        <html><body>
            <div class=\"event-description other-class\">Event description text here.</div>
        </body></html>
    """
    scraper._session = mock_session # Assign the mock session
    mock_session.close = AsyncMock() # Ensure the mock session has an awaitable close

    description = await scraper.fetch_event_description("http://test.com/event_details")
    assert description == "Event description text here."
    mock_session.get.assert_called_once_with("http://test.com/event_details", allow_redirects=True, ssl=False)

@pytest.mark.asyncio
async def test_fetch_event_description_no_div(india_running_scraper_fixture, mock_aiohttp_session):
    scraper = india_running_scraper_fixture
    mock_session, mock_response = mock_aiohttp_session
    mock_response.status = 200
    mock_response.text.return_value = "<html><body>No description div.</body></html>"
    scraper._session = mock_session
    mock_session.close = AsyncMock()

    description = await scraper.fetch_event_description("http://test.com/no_div_event")
    assert description == ""

@pytest.mark.asyncio
async def test_fetch_event_description_fetch_error(india_running_scraper_fixture, mock_aiohttp_session):
    scraper = india_running_scraper_fixture
    mock_session, mock_response = mock_aiohttp_session
    mock_response.status = 404
    scraper._session = mock_session
    mock_session.close = AsyncMock()

    # Patch the logger from base_scraper module where the actual logging happens for fetch_page errors
    with patch.object(base_scraper_logger, 'error') as mock_base_log:
        description = await scraper.fetch_event_description("http://test.com/error_event")
        assert description == ""
        mock_base_log.assert_any_call("Error fetching http://test.com/error_event: Status 404")

@pytest.mark.asyncio
async def test_ir_scrape_events_fetch_main_page_fails(india_running_scraper_fixture, caplog):
    scraper = india_running_scraper_fixture
    caplog.set_level(logging.ERROR, logger='app.scrapers.india_running_scraper')

    # If fetch_page is called with scraper.base_url, it should return "" (empty string)
    # We expect it to be called only once with this URL.
    with patch.object(scraper, 'fetch_page', AsyncMock(return_value="")) as mock_fetch_page:
        events = await scraper.scrape_events()
        
        assert events == []
        mock_fetch_page.assert_called_once_with(scraper.base_url)
        assert any(record.levelname == 'ERROR' and "Failed to fetch page from IndiaRunning.com" in record.message for record in caplog.records)

@pytest.mark.asyncio
async def test_ir_scrape_events_no_event_links_found(india_running_scraper_fixture, caplog):
    scraper = india_running_scraper_fixture
    caplog.set_level(logging.INFO, logger='app.scrapers.india_running_scraper')
    
    mock_main_page_html = "<html><body><p>No events here.</p></body></html>"
    
    # fetch_page should be called with scraper.base_url and return mock_main_page_html
    # We expect it to be called only once with this URL.
    with patch.object(scraper, 'fetch_page', AsyncMock(return_value=mock_main_page_html)) as mock_fetch_main_page,
         patch.object(scraper, 'fetch_event_description', AsyncMock(return_value="Mocked description")) as mock_fetch_desc:

        events = await scraper.scrape_events()
        
        assert events == []
        mock_fetch_main_page.assert_called_once_with(scraper.base_url) # Verifies it was called correctly
        mock_fetch_desc.assert_not_called()
        assert any(record.levelname == 'INFO' and "Found 0 event links" in record.message for record in caplog.records)

# TODO: More complex tests for scrape_events with actual event cards, date parsing logic, DB interaction etc.

# TODO: Tests for IndiaRunningScraper.scrape_events()
# These will be more complex, requiring mock HTML for main page and event detail pages,
# and potentially mocking EventDBHandler. 