 # Backend Testing Results

## Summary

This document tracks the progress and results of testing the backend application.

**Overall Status (as of last full Pytest run - some tests subsequently focused):**
- **Total Tests:** 80
- **Passed:** 70 (Initial count. API "not found" tests attempted and still fail.)
- **Failed:** 8 (4 model-related, 4 scraper-related - see below) + 2 API "not found" tests currently failing with 500 instead of 404.
- **Skipped:** 0
- **Coverage:** Needs re-evaluation.

## Detailed Breakdown by Module/Component

### 1. Core Application (`app/main.py`)
- **File:** `tests/test_main.py`
- **Tests:** 1
  - `test_read_root`: PASSED
- **Status:** All PASSED

### 2. Database Models (`app/models/`)
- **File:** `tests/test_models.py`
- **SQLAlchemy Client-Side Default Issue:**
  - A persistent issue has been observed where SQLAlchemy client-side defaults (e.g., `default=uuid.uuid4`, `default=[]`) are not being applied when model instances are created directly without a database session commit. This affects tests that rely on these defaults being present immediately upon instantiation.
  - **File:** `tests/test_minimal_sqlalchemy.py` (isolated test for this issue)
    - `test_minimal_standalone_model_defaults`: FAILED (Demonstrates the core SQLAlchemy default issue)
- **`Club` Model Tests:**
  - `test_create_club_instance`: PASSED
  - `test_club_nullable_fields`: PASSED
- **`Event` Model Tests (Affected by default issue):**
  - `test_event_id_generation`: FAILED (due to `id` being `None` instead of default UUID)
  - `test_create_event_instance`: FAILED (due to `id` being `None`)
  - `test_event_with_specific_id`: PASSED (ID is explicitly provided)
- **Standalone SQLAlchemy default test within `test_models.py`**:
  - `test_standalone_model_defaults`: FAILED
- **Status:** 4 FAILED (all related to SQLAlchemy client-side default behavior on the current test setup/environment), 3 PASSED.

### 3. Pydantic Schemas (`app/schemas/`)
- **File:** `tests/test_schemas.py`
- **`Club` Schemas (`SocialMediaBase`, `ClubBase`, `Club`, `ClubCreate`, `ClubUpdate`):**
  - `test_social_media_base_valid`: PASSED
  - `test_social_media_base_optional_fields`: PASSED
  - `test_social_media_base_empty`: PASSED
  - `test_club_base_valid_data`: PASSED
  - `test_club_base_default_social_media`: PASSED
  - `test_club_base_invalid_email`: PASSED
  - `test_club_base_social_media_validator_with_instance`: PASSED
  - `test_club_schema_from_orm`: PASSED
  - `test_club_create_schema`: PASSED
  - `test_club_update_schema`: PASSED
- **`Event` Schemas (`EventBase`, `EventCreate`, `Event`):**
  - `test_event_base_valid_data`: PASSED
  - `test_event_base_missing_required_field`: PASSED
  - `test_event_create_schema`: PASSED
  - `test_event_schema_from_orm`: PASSED
- **Status:** All 14 tests PASSED.

### 4. API Endpoints (`app/api/routes.py`)
- **File:** `tests/test_api_routes.py`
- **Event Endpoints:**
  - `test_get_events_empty`: PASSED
  - `test_get_events_with_data`: PASSED
  - `test_create_event_success`: PASSED
  - `test_create_event_validation_error`: PASSED
  - `test_get_event_by_id_found`: PASSED
  - `test_get_event_by_id_not_found`: FAILED (Consistently returns 500 instead of 404, despite mock returning `None` for `db.query().filter().first()`. Requires deeper investigation into mock/FastAPI TestClient interaction.)
  - `test_get_events_by_source_found`: PASSED
  - `test_get_events_by_source_not_found`: PASSED
- **Club Endpoints:**
  - `test_get_clubs_empty`: PASSED
  - `test_get_clubs_with_data`: PASSED
  - `test_create_club_success`: PASSED
  - `test_create_club_validation_error`: PASSED
  - `test_get_club_by_id_found`: PASSED
  - `test_get_club_by_id_not_found`: FAILED (Similar to event endpoint, returns 500 instead of 404. Requires deeper investigation.)
- **Status:** 12 PASSED, 2 FAILED (were previously SKIPPED, now marked as failing requiring investigation).

### 5. Core Logic (`app/core/config.py`)
- **File:** `tests/test_core_config.py`
- **Tests:**
  - `test_default_settings_no_env_file`: PASSED
  - `test_get_database_url_constructed_kwargs_no_env_file`: PASSED
  - `test_get_database_url_explicitly_set_kwargs_no_env_file`: PASSED
  - `test_settings_override_from_env_no_dot_env_file`: PASSED
  - `test_get_database_url_constructed_from_env_no_dot_env_file`: PASSED
- **Status:** All 5 tests PASSED.

### 6. Scrapers (`app/scrapers/`)
- **File:** `tests/test_scrapers.py`
- **`IndiaRunningScraper.scrape_events()`:** Attempts to add initial unit tests for this method were made. However, persistent issues with the `edit_file` tool in correctly applying `unittest.mock.AsyncMock` setups for `patch.object` (leading to linter errors in the generated code) prevented successful addition of these tests. This area remains untested.
- **Other `IndiaRunningScraper` Tests:** 4 tests persistently FAILED (3 `parse_date`, 1 `slugify`). Debugging hampered by tool limitations.
- **`BaseScraper` Tests:** All 10 tests PASSED.

## Next Steps for Testing
- **Investigate and Resolve Tooling Issues:** The primary blocker is the `edit_file` tool's difficulty with specific Python mock syntax and parametrized test updates. This needs to be addressed to proceed effectively with scraper tests.
- Postpone fixing API "not found" tests (currently failing with 500) until more diagnostic capabilities or insights are available.
- Revisit `IndiaRunningScraper.parse_date` and `IndiaRunningScraper.slugify` test failures if tooling for code edits becomes more reliable or if manual edits are made.
- Address the root cause of the SQLAlchemy client-side default issue if possible, or adapt tests accordingly.
- Write tests for other concrete scrapers (e.g., `bhaago_india_scraper.py`).
- Write tests for `scraper_manager.py`.
- Write tests for `db_handler.py` in the scrapers module.
- Consider integration tests for API endpoints with a real test database.
