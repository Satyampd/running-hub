from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

engine = create_engine(settings.DATABASE_URL)
logger.info(f"Database engine created for URL: {settings.DATABASE_URL}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base() 