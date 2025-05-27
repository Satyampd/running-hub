# Running Events Hub

A full-stack web application that aggregates running events from multiple sources across India, providing a centralized platform for runners to discover events.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Data Collection](#data-collection)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Known Issues & Limitations](#known-issues--limitations)
- [Future Improvements](#future-improvements)

## Overview

Running Events Hub is a platform designed to help runners discover running events across India. The application scrapes event data from multiple sources, normalizes it, and presents it through a clean, user-friendly interface. Users can filter events by location, category, and search for specific events.

## Features

- **Event Discovery**: Browse running events from multiple sources
- **Filtering**: Filter events by category, location, and search by name
- **Event Details**: View comprehensive event information including registration links
- **Responsive Design**: Mobile-friendly interface with dark/light mode support
- **Automated Data Collection**: Regular scraping of event sources to keep data fresh

## Architecture

The application follows a standard client-server architecture:

1. **Backend**: FastAPI-based REST API with PostgreSQL database
2. **Frontend**: React application built with Vite, TypeScript, and Tailwind CSS
3. **Data Collection**: Asynchronous scrapers that collect event data from multiple sources
4. **Caching**: Local file-based caching to reduce unnecessary scraping operations

## Tech Stack

### Backend
- **FastAPI**: Web framework for building APIs
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Database for storing event data
- **BeautifulSoup4 & aiohttp**: For web scraping
- **Schedule**: For scheduling periodic scraping jobs

### Frontend
- **React**: UI library
- **TypeScript**: For type safety
- **Vite**: Build tool
- **TanStack Query**: For data fetching and caching
- **Tailwind CSS**: For styling
- **React Router**: For navigation

## Local Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/running-hub.git
cd running-hub
```

2. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with the following content:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/running_events
```

5. Create the database:
```bash
python app/scripts/create_db.py
```

6. Run the development server:
```bash
uvicorn app.main:app --reload --port 8001
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following content:
```
VITE_API_URL=http://localhost:8001/api
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at http://localhost:5173

## Data Collection

The application collects data from the following sources:
- BhaagoIndia
- IndiaRunning
- CityWoofer

To manually run the scraper:
```bash
cd backend
python -m app.scripts.smart_scraper
```

The scraper is designed to:
- Avoid re-scraping URLs already in the database
- Update events only when necessary (when title, date, or price changes)
- Handle duplicates efficiently

## Deployment

The application is configured for deployment on Render.com using the `render.yaml` blueprint. See the [DEPLOY.md](DEPLOY.md) file for detailed deployment instructions.

## Project Structure

```
running-hub/
├── backend/                # Backend code
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── cache/          # Caching functionality
│   │   ├── core/           # Core configuration
│   │   ├── db/             # Database models and session
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── scrapers/       # Web scrapers for different sources
│   │   ├── scripts/        # Utility scripts
│   │   ├── tasks/          # Background tasks
│   │   └── main.py         # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── render_start.sh     # Startup script for Render
├── frontend/               # Frontend code
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images and other assets
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (e.g., ThemeContext)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS styles
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main application component
│   ├── index.html          # HTML entry point
│   ├── package.json        # NPM dependencies
│   └── vite.config.ts      # Vite configuration
└── render.yaml             # Render deployment configuration
```

## Known Issues & Limitations

- The free tier on Render has performance limitations and the database is deleted after 90 days of inactivity
- Some event sources may change their HTML structure, requiring scraper updates
- Limited event details are available (depends on what's provided by the source)
- No user authentication or personalization features yet

## Future Improvements

- Add user authentication to allow saving favorite events
- Implement email notifications for upcoming events
- Add more event sources
- Create an admin panel for managing events
- Add event ratings and reviews
- Implement progressive web app (PWA) functionality 