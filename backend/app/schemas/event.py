from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

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
    image_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 