# Running Events Hub - Technical Documentation

This document provides detailed technical information about the Running Events Hub application, including architecture, data flow, key components, and implementation details.

## System Architecture

Running Events Hub follows a modern web application architecture with the following components:

### Backend Architecture
- **FastAPI Framework**: Provides the RESTful API endpoints
- **PostgreSQL Database**: Stores event data
- **SQLAlchemy ORM**: Handles database operations
- **Pydantic**: Manages data validation and serialization
- **Asynchronous Web Scrapers**: Collect data from multiple sources
- **Caching System**: Reduces redundant scraping operations

### Frontend Architecture
- **React**: Component-based UI library
- **TypeScript**: Adds static typing to JavaScript
- **React Router**: Handles client-side routing
- **TanStack Query**: Manages server state and data fetching
- **Tailwind CSS**: Utility-first CSS framework
- **Context API**: Manages global state (e.g., theme)

## Data Flow

1. **Data Collection**:
   - Scheduled scrapers collect event data from multiple sources
   - Data is normalized to a common format
   - Smart scraper compares with existing data to avoid duplicates

2. **Data Storage**:
   - Normalized event data is stored in PostgreSQL
   - Events are uniquely identified by their URL
   - Updates are made only when specific fields change

3. **API Layer**:
   - FastAPI exposes endpoints to query events
   - Endpoints support filtering by source, ID, etc.
   - Data is serialized using Pydantic models

4. **Frontend**:
   - React components fetch data using TanStack Query
   - Client-side filtering for category, location, and search
   - UI renders events in cards with essential information

## Database Schema

The main database table is `events` with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | String | Event title |
| date | String | Event date |
| location | String | Event location |
| categories | Array[String] | Event categories |
| price | String | Event price |
| url | String | Event URL (unique) |
| source | String | Source website |
| description | String | Event description (optional) |
| registration_closes | String | Registration closing date (optional) |
| scraped_at | String | When the event was scraped |
| created_at | DateTime | Record creation timestamp |
| updated_at | DateTime | Record update timestamp |

## Backend Components

### API Routes (`backend/app/api/routes.py`)
- `GET /api/events`: Returns all events
- `GET /api/events/{event_id}`: Returns a specific event by ID
- `GET /api/events/source/{source}`: Returns events from a specific source

### Data Models
- **SQLAlchemy Models** (`backend/app/models/`): Define database schema
- **Pydantic Schemas** (`backend/app/schemas/`): Define API data validation and serialization

### Scrapers
The application includes multiple scrapers, each inheriting from a base scraper class:

1. **Base Scraper** (`backend/app/scrapers/base_scraper.py`):
   - Abstract class with common scraping functionality
   - Handles HTTP requests asynchronously
   - Defines the standard event data format

2. **Specific Scrapers**:
   - `BhaagoIndiaScraper`: Scrapes events from Bhaago India
   - `IndiaRunningScraper`: Scrapes events from India Running
   - `CityWooferScraper`: Scrapes events from CityWoofer

3. **Scraper Manager** (`backend/app/scrapers/scraper_manager.py`):
   - Coordinates all scrapers
   - Implements caching to reduce redundant scraping
   - Handles retries and error recovery

### Smart Scraper (`backend/app/scripts/smart_scraper.py`)
- Intelligently scrapes only new or updated events
- Compares scraped data with existing database records
- Avoids duplicate entries based on URL
- Provides detailed statistics about scraping operations

### Scheduler (`backend/app/scripts/scheduler.py`)
- Runs the smart scraper on a configurable schedule
- Default schedule is daily at 1:00 AM
- Can be configured via environment variables

## Frontend Components

### Pages
- **HomePage**: Landing page with featured events
- **EventsPage**: Main page for browsing and filtering events
- **EventDetailsPage**: Detailed view of a specific event

### Components
- **Event Cards**: Display event information in a compact format
- **Filters**: Allow filtering by category, location, and search term
- **Theme Toggle**: Switch between light and dark mode

### Services
- **API Service** (`frontend/src/services/api.ts`): Handles communication with the backend API

### Context
- **ThemeContext**: Manages application theme (light/dark mode)

## Caching Strategy

The application implements a two-level caching strategy:

1. **Scraper-level Caching**:
   - Cached scraper results are stored in JSON files
   - Default cache duration is 6 hours
   - Reduces network requests to source websites

2. **Frontend Caching**:
   - TanStack Query caches API responses
   - Implements stale-while-revalidate pattern
   - Improves perceived performance

## Deployment Configuration

The application is configured for deployment on Render.com using the `render.yaml` blueprint:

1. **PostgreSQL Database**:
   - Free tier database
   - Located in Ohio region

2. **Backend API**:
   - Python web service
   - Uses the `render_start.sh` script to initialize the database and start the FastAPI application

3. **Frontend**:
   - Static site
   - Built with Vite
   - Configured to communicate with the backend API

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOW_ALL_ORIGINS`: Enable CORS for all origins
- `SCRAPER_SCHEDULE`: When to run the scheduled scraper (format: "HH:MM")

### Frontend
- `VITE_API_URL`: URL of the backend API

## Development Setup

### Local Development Prerequisites
1. PostgreSQL database
2. Python 3.9+
3. Node.js 16+

### Backend Development
1. Create a virtual environment
2. Install dependencies from `requirements.txt`
3. Create a `.env` file with required environment variables
4. Run database setup script
5. Start the FastAPI server with `uvicorn`

### Frontend Development
1. Install dependencies with `npm install`
2. Create a `.env` file with the API URL
3. Start the development server with `npm run dev`

## Testing

The project includes pytest configuration for backend testing:
- Unit tests for models and schemas
- Integration tests for API endpoints
- Tests for scraper functionality

## Performance Considerations

1. **Asynchronous Scraping**: All scrapers use `aiohttp` for non-blocking HTTP requests
2. **Smart Scraping**: Only scrapes new or updated events to reduce database operations
3. **Caching**: Reduces redundant network requests
4. **Database Indexing**: Indexes on frequently queried fields

## Security Considerations

1. **CORS Configuration**: Configurable CORS policy
2. **Input Validation**: All API inputs validated with Pydantic
3. **Error Handling**: Proper error handling to avoid exposing sensitive information

## Known Limitations

1. **Scraper Fragility**: Scrapers may break if source websites change their structure
2. **Free Tier Limitations**: Render's free tier has performance constraints
3. **Database Persistence**: Free tier database is deleted after 90 days of inactivity

## Future Technical Improvements

1. **Authentication**: Implement user authentication and authorization
2. **API Rate Limiting**: Add rate limiting to protect the API
3. **Monitoring**: Add monitoring and alerting for scraper failures
4. **Testing Coverage**: Increase test coverage
5. **CI/CD Pipeline**: Implement continuous integration and deployment
6. **Containerization**: Dockerize the application for easier deployment 