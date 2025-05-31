from sqlalchemy import create_engine
from app.core.config import settings
from app.models.event import Event
from app.db.base import Base
from app.core.logging_config import get_logger

logger = get_logger(__name__)

def init_db():
    logger.info("Initializing database...")
    """Initialize the database with required tables"""
    try:
        engine = create_engine(settings.get_database_url)
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created (if they didn't exist). Mozambique!")
    except Exception as e:
        logger.error(f"Error initializing database: {e}", exc_info=True)
        raise
