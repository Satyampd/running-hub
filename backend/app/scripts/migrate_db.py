#!/usr/bin/env python
import os
import sys
from pathlib import Path

# Add parent directory to path to import from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.base import Base
from app.models.event import Event

def migrate_db():
    """Add new columns to events table"""
    engine = create_engine(settings.get_database_url)
    
    try:
        with engine.connect() as connection:
            # Add new columns if they don't exist
            connection.execute(text("""
                ALTER TABLE events 
                ADD COLUMN IF NOT EXISTS image_url VARCHAR,
                ADD COLUMN IF NOT EXISTS address VARCHAR;
            """))
            connection.commit()
            print("Successfully added new columns to events table")
            
            # Update is_verified to be NOT NULL with default value if needed
            connection.execute(text("""
                UPDATE events 
                SET is_verified = false 
                WHERE is_verified IS NULL;
            """))
            connection.commit()
            
            connection.execute(text("""
                ALTER TABLE events 
                ALTER COLUMN is_verified SET NOT NULL,
                ALTER COLUMN is_verified SET DEFAULT false;
            """))
            connection.commit()
            print("Successfully updated is_verified column constraints")
            
    except Exception as e:
        print(f"Error migrating database: {str(e)}")
        sys.exit(1)

def migrate():
    try:
        # Create engine using settings
        engine = create_engine(settings.get_database_url)

        # Add image_url column if it doesn't exist
        with engine.connect() as connection:
            connection.execute(text("""
                ALTER TABLE events
                ADD COLUMN IF NOT EXISTS image_url VARCHAR;
            """))
            connection.commit()
            print("✅ Added image_url column")

    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        raise

if __name__ == "__main__":
    migrate_db()
    migrate() 