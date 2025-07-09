from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logging_config import get_logger
import os

logger = get_logger(__name__)

# Handle potential PostgreSQL URI format differences in production
database_url = os.getenv("DATABASE_URL")
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
    logger.info(f"DATABASE_URL transformed from postgres:// to postgresql://")
else:
    database_url = settings.get_database_url

logger.info(f"Using database URL: {database_url}")

# Create engine with appropriate connection arguments
engine = create_engine(
    database_url,
    pool_pre_ping=True,  # Test connections before using them
    connect_args={}
)
logger.info("Database engine created in session.py.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
logger.info("SessionLocal created.")

# Dependency
def get_db():
    logger.debug("Yielding new database session.")
    db = SessionLocal()
    try:
        yield db
    finally:
        logger.debug("Closing database session.")
        db.close() 