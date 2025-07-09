from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class EventBase(BaseModel):
    title: str
    date: str
    location: str
    address: str
    categories: List[str]
    price: str
    url: str
    source: Optional[str] = None
    description: Optional[str] = None
    registration_closes: Optional[str] = None
    scraped_at: Optional[str] = None
    is_verified: Optional[bool] = True
    photos: Optional[List[str]] = []

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 

class ShowEvent(BaseModel):
    id: str
    title: str
    date: str
    location: str
    address: str
    categories: List[str]
    price: str
    url: str
    description: Optional[str] = None
    registration_closes: Optional[str] = None
    photos: Optional[List[str]] = []

    class Config:
        from_attributes = True 
        orm_mode = True  # Enable ORM mode for compatibility with SQLAlchemy models

class EventSubmission(EventBase):
    recaptcha_token: str