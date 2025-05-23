from sqlalchemy import Column, String, DateTime, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    location = Column(String, nullable=False)
    categories = Column(ARRAY(String), nullable=False, default=list)
    price = Column(String, nullable=False, default="Price TBD")
    url = Column(String, nullable=False)
    source = Column(String, nullable=False)
    description = Column(String, nullable=True)
    registration_closes = Column(String, nullable=True)
    scraped_at = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now()) 