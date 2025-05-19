#!/bin/bash
set -e

# Run database setup script
echo "Setting up database..."
python app/scripts/create_db.py


# Scraping the data
echo "Scraping the data..."
python -m app.scripts.scrape_cli --all > scraper.log 2>&1 &

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
