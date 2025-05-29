import pytest
from pydantic import ValidationError
from typing import List, Optional
from datetime import datetime

from app.schemas.club import SocialMediaBase, ClubBase, Club

# Tests for SocialMediaBase
def test_social_media_base_valid():
    """Test SocialMediaBase with valid data."""
    data = {
        "instagram": "http://instagram.com/user",
        "facebook": "http://facebook.com/user",
        "strava": "http://strava.com/athletes/user"
    }
    sm = SocialMediaBase(**data)
    assert sm.instagram == data["instagram"]
    assert sm.facebook == data["facebook"]
    assert sm.strava == data["strava"]

def test_social_media_base_optional_fields():
    """Test SocialMediaBase with some optional fields missing."""
    data = {"instagram": "http://instagram.com/user"}
    sm = SocialMediaBase(**data)
    assert sm.instagram == data["instagram"]
    assert sm.facebook is None
    assert sm.strava is None

def test_social_media_base_empty():
    """Test SocialMediaBase with no data (all fields should be None)."""
    sm = SocialMediaBase()
    assert sm.instagram is None
    assert sm.facebook is None
    assert sm.strava is None

# Tests for ClubBase
def test_club_base_valid_data():
    """Test ClubBase with valid data."""
    data = {
        "name": "Test Club",
        "location": "Test City",
        "contact_email": "test@example.com",
        "social_media": {"instagram": "instalink"} # Test field_validator
    }
    club = ClubBase(**data)
    assert club.name == data["name"]
    assert club.location == data["location"]
    assert club.contact_email == data["contact_email"]
    assert isinstance(club.social_media, SocialMediaBase)
    assert club.social_media.instagram == "instalink"
    assert club.social_media.facebook is None # Default from SocialMediaBase

    # Test default empty lists
    assert club.meeting_times == []
    assert club.photos == []
    assert club.amenities == []

def test_club_base_default_social_media():
    """Test ClubBase uses default SocialMediaBase if social_media is not provided."""
    club = ClubBase(name="Another Club", contact_email="another@example.com")
    assert isinstance(club.social_media, SocialMediaBase)
    assert club.social_media.instagram is None

def test_club_base_invalid_email():
    """Test ClubBase with invalid email."""
    with pytest.raises(ValidationError) as excinfo:
        ClubBase(contact_email="invalid-email")
    # Check that the error is about the email field
    assert "contact_email" in str(excinfo.value)

def test_club_base_social_media_validator_with_instance():
    """Test ClubBase social_media field_validator with SocialMediaBase instance."""
    sm_instance = SocialMediaBase(strava="stravalink")
    club = ClubBase(social_media=sm_instance)
    assert club.social_media == sm_instance
    assert club.social_media.strava == "stravalink"

# Tests for Club (Pydantic model, not SQLAlchemy model)
class MockORMClub:
    """A mock class to simulate an ORM Club object for testing from_attributes."""
    def __init__(self, id, name, location, contact_email, created_at=None, updated_at=None, is_verified=False, **kwargs):
        self.id = id
        self.name = name
        self.location = location
        self.contact_email = contact_email
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.is_verified = is_verified
        # ClubBase fields that might be on the ORM object
        self.address = kwargs.get("address")
        self.description = kwargs.get("description", "Default description")
        self.established_year = kwargs.get("established_year")
        self.meeting_times = kwargs.get("meeting_times", [])
        self.contact_phone = kwargs.get("contact_phone")
        self.website_url = kwargs.get("website_url")
        self.social_media = kwargs.get("social_media", SocialMediaBase()) # Pydantic model expects SocialMediaBase or dict
        self.membership_fee = kwargs.get("membership_fee")
        self.skill_level = kwargs.get("skill_level", "Any")
        self.typical_routes = kwargs.get("typical_routes")
        self.group_size = kwargs.get("group_size")
        self.logo_url = kwargs.get("logo_url")
        self.photos = kwargs.get("photos", [])
        self.amenities = kwargs.get("amenities", [])

def test_club_schema_from_orm():
    """Test creating a Club Pydantic schema from a mock ORM object."""
    mock_orm_data = {
        "id": "club_123",
        "name": "ORM Test Club",
        "location": "ORM City",
        "contact_email": "orm@example.com",
        "description": "Fetched from ORM",
        "skill_level": "Advanced",
        "social_media": {"instagram": "orm_insta_link"} # Pass as dict, validator should handle
    }
    orm_club = MockORMClub(**mock_orm_data)

    club_schema = Club.model_validate(orm_club) # Replaces from_orm in Pydantic v2

    assert club_schema.id == mock_orm_data["id"]
    assert club_schema.name == mock_orm_data["name"]
    assert club_schema.description == mock_orm_data["description"]
    assert club_schema.skill_level == mock_orm_data["skill_level"]
    assert isinstance(club_schema.social_media, SocialMediaBase)
    assert club_schema.social_media.instagram == "orm_insta_link"
    assert club_schema.is_verified is False # Default from Club schema
    assert club_schema.meeting_times == [] # Default from ClubBase, inherited

# Tests for ClubCreate and ClubUpdate
from app.schemas.club import ClubCreate, ClubUpdate

def test_club_create_schema():
    """Test ClubCreate schema with valid data."""
    data = {
        "name": "New Club to Create",
        "location": "Creation City",
        "contact_email": "create@example.com",
        "description": "This is a new club.",
        "skill_level": "Beginner"
    }
    club_create_instance = ClubCreate(**data)
    assert club_create_instance.name == data["name"]
    assert club_create_instance.location == data["location"]
    # Check a default from ClubBase
    assert club_create_instance.photos == []

def test_club_update_schema():
    """Test ClubUpdate schema with partial data (all fields are optional in ClubBase)."""
    data = {"name": "Updated Club Name"}
    club_update_instance = ClubUpdate(**data)
    assert club_update_instance.name == data["name"]
    assert club_update_instance.location is None # Optional, not provided
    # Check a default from ClubBase
    assert club_update_instance.amenities == []

# Tests for Event Schemas (event.py)
from app.schemas.event import EventBase, EventCreate, Event as EventSchema # Alias to avoid conflict with model
from uuid import uuid4

def test_event_base_valid_data():
    """Test EventBase with all required and some optional fields."""
    data = {
        "title": "Test Event",
        "date": "2024-01-01",
        "location": "Event Location",
        "address": "123 Event St",
        "categories": ["fun", "run"],
        "price": "Free",
        "url": "http://example.com/event",
        "description": "A test event.",
        "image_url": "http://example.com/image.png"
    }
    event = EventBase(**data)
    assert event.title == data["title"]
    assert event.description == data["description"]
    assert event.image_url == data["image_url"]
    assert event.is_verified is True # Default value
    assert event.source is None # Default optional

def test_event_base_missing_required_field():
    """Test EventBase raises ValidationError if a required field is missing."""
    data = {
        # title is missing
        "date": "2024-01-01",
        "location": "Event Location",
        "address": "123 Event St",
        "categories": ["fun", "run"],
        "price": "Free",
        "url": "http://example.com/event"
    }
    with pytest.raises(ValidationError) as excinfo:
        EventBase(**data)
    assert "title" in str(excinfo.value) 
    assert "Field required" in str(excinfo.value) or "Input should be a valid string" in str(excinfo.value) # Pydantic v2 error message

def test_event_create_schema():
    """Test EventCreate schema."""
    data = {
        "title": "New Event to Create",
        "date": "2024-02-01",
        "location": "Creation Place",
        "address": "456 Create Ave",
        "categories": ["new"],
        "price": "$10",
        "url": "http://example.com/new_event"
    }
    event_create_instance = EventCreate(**data)
    assert event_create_instance.title == data["title"]
    assert event_create_instance.is_verified is True # Default from EventBase

class MockORMEvent:
    """A mock class to simulate an ORM Event object for testing from_attributes."""
    def __init__(self, id, title, date, location, address, categories, price, url, **kwargs):
        self.id = id
        self.title = title
        self.date = date
        self.location = location
        self.address = address
        self.categories = categories
        self.price = price
        self.url = url
        self.source = kwargs.get("source")
        self.description = kwargs.get("description")
        self.registration_closes = kwargs.get("registration_closes")
        self.scraped_at = kwargs.get("scraped_at")
        self.is_verified = kwargs.get("is_verified", True)
        self.image_url = kwargs.get("image_url")
        self.created_at = kwargs.get("created_at", datetime.utcnow())
        self.updated_at = kwargs.get("updated_at", datetime.utcnow())

def test_event_schema_from_orm():
    """Test creating an Event Pydantic schema from a mock ORM object."""
    event_uuid = uuid4()
    now = datetime.utcnow()
    mock_orm_data = {
        "id": event_uuid,
        "title": "ORM Event",
        "date": "2024-03-01",
        "location": "ORM Location",
        "address": "789 ORM Rd",
        "categories": ["orm", "test"],
        "price": "$50",
        "url": "http://example.com/orm_event",
        "is_verified": False, # Override default
        "created_at": now,
        "updated_at": now
    }
    orm_event = MockORMEvent(**mock_orm_data)
    event_pydantic_schema = EventSchema.model_validate(orm_event)

    assert event_pydantic_schema.id == event_uuid
    assert event_pydantic_schema.title == "ORM Event"
    assert event_pydantic_schema.is_verified is False
    assert event_pydantic_schema.created_at == now

# More tests for other fields, ClubCreate, ClubUpdate, Club (with ORM mode) will follow. 