# --- Tests for IndiaRunningScraper ---
from app.scrapers.india_running_scraper import IndiaRunningScraper, logger as ir_logger
from datetime import datetime as dt_class # Alias for datetime.datetime class
import logging # Import for caplog

# Tests for IndiaRunningScraper.parse_date() - now synchronous tests
@pytest.mark.parametrize("date_str, expected_date_tuple", [
    ("31 May 2024", (2024, 5, 31)),
    ("May 31, 2024", (2024, 5, 31)), # This should now pass
    ("May 31,2024", (2024, 5, 31)), # This should also pass
    ("May 31 2024", (2024, 5, 31)),
    ("1st Jun 2025", (2025, 6, 1)),
    ("JUL 22nd, 2023", (2023, 7, 22)),
    ("05/08/2024", (2024, 8, 5)),
    ("2024-12-25", (2024, 12, 25)),
    # Corrected expectations for yearless, assuming dt_class.now() gives current date for calculation
    # The parametrize values for yearless dates will be calculated dynamically before test runs
    ("Oct 10", (dt_class.now().year if dt_class.now().month < 10 or (dt_class.now().month == 10 and dt_class.now().day <=10) else dt_class.now().year + 1, 10, 10)),
    ("15 Jan", (dt_class.now().year + 1 if dt_class.now().month > 1 or (dt_class.now().month == 1 and dt_class.now().day > 15) else dt_class.now().year, 1, 15)),
    ("Invalid Date", None),
    ("TBD", None),
    ("Date TBA", None),
    (None, None),
    ("Feb 29, 2024", (2024, 2, 29)),
    ("Feb 29, 2023", None), # Should correctly be None if parse_date doesn't find a valid leap day
    ("20th March 2023 - 22nd March 2023", (2023, 3, 20)),
])
def test_ir_parse_date(india_running_scraper_fixture, date_str, expected_date_tuple):
    scraper = india_running_scraper_fixture
    parsed_dt_obj = scraper.parse_date(date_str)
    if expected_date_tuple:
        assert parsed_dt_obj is not None, f"Expected date for '{date_str}', but got None"
        assert (parsed_dt_obj.year, parsed_dt_obj.month, parsed_dt_obj.day) == expected_date_tuple
    else:
        assert parsed_dt_obj is None, f"Expected None for '{date_str}', but got {parsed_dt_obj}"

def test_ir_parse_date_year_assumption(india_running_scraper_fixture, caplog):
    scraper = india_running_scraper_fixture
    caplog.set_level(logging.DEBUG, logger='app.scrapers.india_running_scraper')
    
    # Test Case 1
    now_val = dt_class(2024, 1, 15)
    parsed_date_obj = scraper.parse_date("Oct 10", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2024, 10, 10), f"Test Case 1a failed for Oct 10. Log: {caplog.text}"
    caplog.clear()
    parsed_date_obj = scraper.parse_date("10 Oct", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2024, 10, 10), f"Test Case 1b failed for 10 Oct. Log: {caplog.text}"

    # Test Case 2
    caplog.clear()
    now_val = dt_class(2024, 11, 1)
    parsed_date_obj = scraper.parse_date("May 20", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2025, 5, 20), f"Test Case 2a failed for May 20. Log: {caplog.text}"
    caplog.clear()
    parsed_date_obj = scraper.parse_date("20 May", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2025, 5, 20), f"Test Case 2b failed for 20 May. Log: {caplog.text}"

    # Test Case 3
    caplog.clear()
    now_val = dt_class(2024, 3, 10)
    parsed_date_obj = scraper.parse_date("Mar 25", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2024, 3, 25), f"Test Case 3a failed for Mar 25. Log: {caplog.text}"
    caplog.clear()
    parsed_date_obj = scraper.parse_date("25 Mar", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2024, 3, 25), f"Test Case 3b failed for 25 Mar. Log: {caplog.text}"

    # Test Case 4
    caplog.clear()
    now_val = dt_class(2024, 3, 20)
    parsed_date_obj = scraper.parse_date("Mar 15", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2025, 3, 15), f"Test Case 4a failed for Mar 15. Log: {caplog.text}"
    caplog.clear()
    parsed_date_obj = scraper.parse_date("15 Mar", now_dt_for_testing=now_val)
    assert parsed_date_obj == dt_class(2025, 3, 15), f"Test Case 4b failed for 15 Mar. Log: {caplog.text}"

@pytest.mark.parametrize("input_text, expected_slug", [
    ("Hello World", "hello-world"),
    ("  Multiple   Spaces  ", "multiple-spaces"),
    ("Special!@#Characters%^&*(+=", "specialcharacters"),
    ("Already-a-slug", "already-a-slug"),
    ("  Leading-and-trailing-dashes--  ", "leading-and-trailing-dashes"),
    ("UPPERCASE TEXT", "uppercase-text"),
    ("தமிழ் சோதனை", "தமழ-சதன"),
    ("", ""),
    (123, "123"), 
    (None, "none") 
])
def test_ir_slugify(india_running_scraper_fixture, input_text, expected_slug):
    scraper = india_running_scraper_fixture
    assert scraper.slugify(input_text) == expected_slug

# ... existing fetch_event_description tests (should be fine) ... 