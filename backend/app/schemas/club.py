from typing import List, Optional, Union
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from datetime import datetime
from uuid import UUID, uuid4

class SocialMediaBase(BaseModel):
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    strava: Optional[str] = None

class ClubBase(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    established_year: Optional[str] = None
    meeting_times: Optional[List[str]] = []
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    social_media: Optional[Union[SocialMediaBase, dict]] = SocialMediaBase()
    membership_fee: Optional[str] = None
    skill_level: Optional[str] = None
    typical_routes: Optional[str] = None
    group_size: Optional[str] = None
    logo_url: Optional[str] = None
    photos: Optional[List[str]] = []
    amenities: Optional[List[str]] = []

    @field_validator("social_media", mode="before")
    @classmethod
    def parse_social_media(cls, value):
        if isinstance(value, dict):
            return SocialMediaBase(**value)
        return value

class ClubCreate(ClubBase):
    pass

class ClubUpdate(ClubBase):
    pass

class Club(ClubBase):
    id: str 
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_verified: Optional[bool] = False

    class Config:
        from_attributes = True

class ClubSubmission(ClubBase):
    recaptcha_token: str 