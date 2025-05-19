from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class EventBase(BaseModel):
    title: str
    date: str
    location: str
    categories: List[str]
    price: str
    url: str
    source: str
    description: Optional[str] = None
    registration_closes: Optional[str] = None
    scraped_at: Optional[str] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 