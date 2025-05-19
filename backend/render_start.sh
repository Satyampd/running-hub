#!/bin/bash
set -e

# Run database setup script
echo "Setting up database..."
python app/scripts/create_db.py

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT 