from sqlalchemy import create_engine
from app.core.config import settings
from app.models.event import Event
from app.db.base import Base

def init_db():
    """Initialize the database with required tables"""
    engine = create_engine(settings.get_database_url)
    Base.metadata.create_all(bind=engine) 
