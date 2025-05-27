from sqlalchemy import Column, String, Integer, ARRAY, JSON
from app.db.base import Base

class Club(Base):
    __tablename__ = "clubs"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    address = Column(String, nullable=True)
    description = Column(String, nullable=False)
    established_year = Column(String, nullable=True)
    meeting_times = Column(ARRAY(String), server_default='{}', nullable=True)
    contact_email = Column(String, nullable=False)
    contact_phone = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    social_media = Column(JSON, server_default='{}', nullable=True)
    membership_fee = Column(String, nullable=True)
    skill_level = Column(String, nullable=False)
    typical_routes = Column(String, nullable=True)
    group_size = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    photos = Column(ARRAY(String), server_default='{}', nullable=True)
    amenities = Column(ARRAY(String), server_default='{}', nullable=True)
