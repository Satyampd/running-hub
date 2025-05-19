#!/usr/bin/env python
import os
import sys
from pathlib import Path

# Add parent directory to path to import from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy_utils import database_exists, create_database
from app.db.base import Base
from app.db.session import engine
from app.models.event import Event

def setup_db():
    """Create database and tables if they don't exist"""
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        create_database(engine.url)
        print(f"Created database {engine.url}")
    else:
        print(f"Database {engine.url} already exists")

    # Create tables
    try:
        Base.metadata.create_all(bind=engine)
        print("Created all tables successfully")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    setup_db() 