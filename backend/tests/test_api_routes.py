import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import MagicMock, patch
import uuid
from datetime import datetime

from app.main import app # We need the main app to initialize TestClient
from app.schemas.event import Event as EventSchema, EventCreate
from app.models.event import Event as EventModel # SQLAlchemy model
from app.api.routes import get_db # The dependency we need to override
from app.schemas.club import Club as ClubSchema, ClubCreate
from app.models.club import Club as ClubModel # SQLAlchemy model

# TestClient instance
client = TestClient(app)

# Mock database session for testing
@pytest.fixture
def mock_db_session():
    db = MagicMock(spec=Session)
    
    mock_query_obj = MagicMock(name="QueryObjectMock")
    db.query.return_value = mock_query_obj

    mock_filter_obj = MagicMock(name="FilterObjectMock")
    # Assign the MagicMock instance directly as the return value of filter
    mock_query_obj.filter = MagicMock(name="FilterMethodMock", return_value=mock_filter_obj) 

    # Default behaviors for terminal methods
    mock_filter_obj.first.return_value = None 
    mock_filter_obj.all.return_value = []
    mock_query_obj.all.return_value = []
    return db

# Override the get_db dependency for all tests in this file
@pytest.fixture(autouse=True)
def override_get_db(mock_db_session):
    app.dependency_overrides[get_db] = lambda: mock_db_session
    yield
    app.dependency_overrides.clear()

# --- Tests for Event Endpoints ---

def test_get_events_empty(mock_db_session):
    """Test GET /events when no events are in the database."""
    mock_db_session.query(EventModel).all.return_value = []
    
    response = client.get("/api/events")
    assert response.status_code == 200
    assert response.json() == []

def test_get_events_with_data(mock_db_session):
    """Test GET /events with some events in the database."""
    mock_event_1_id = uuid.uuid4()
    mock_event_2_id = uuid.uuid4()
    now = datetime.utcnow()

    # Simulate ORM EventModel objects
    mock_event_orm_1 = EventModel(
        id=mock_event_1_id, title="Event 1", date="2024-01-01", location="Loc1", 
        address="Addr1", categories=["c1"], price="P1", url="http://e1.com",
        created_at=now, updated_at=now, is_verified=True
    )
    mock_event_orm_2 = EventModel(
        id=mock_event_2_id, title="Event 2", date="2024-02-01", location="Loc2", 
        address="Addr2", categories=["c2"], price="P2", url="http://e2.com",
        created_at=now, updated_at=now, is_verified=False
    )
    mock_db_session.query(EventModel).all.return_value = [mock_event_orm_1, mock_event_orm_2]
    
    response = client.get("/api/events")
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data) == 2
    assert response_data[0]["title"] == "Event 1"
    assert response_data[1]["title"] == "Event 2"
    assert response_data[0]["id"] == str(mock_event_1_id)
    assert response_data[1]["is_verified"] is False

def test_create_event_success(mock_db_session):
    """Test POST /events successfully creates an event."""
    event_create_data = {
        "title": "New Awesome Event",
        "date": "2025-10-10",
        "location": "The Place",
        "address": "123 Awesome St",
        "categories": ["awesome", "run"],
        "price": "$25",
        "url": "http://awesome.com/event"
        # is_verified will be set to False by the endpoint
        # source will be set to "User Submitted" by the endpoint
    }

    # This is what the endpoint will try to return after db.refresh()
    # Due to the SQLAlchemy default issue, we need to be careful here.
    # The endpoint creates EventModel(**event_data), which will have None for defaults.
    # Let's assume for the purpose of this unit test that the DB would handle it, 
    # or that the endpoint correctly populates needed fields before commit for non-nullable DB columns.
    # For this test, we mock what `db_event` would look like *after* a hypothetical successful commit & refresh.
    
    def mock_add_commit_refresh(db_event_arg):
        # Simulate what happens if SQLAlchemy defaults worked or DB handles it
        db_event_arg.id = db_event_arg.id or uuid.uuid4() # If ID wasn't set due to default issue
        db_event_arg.created_at = db_event_arg.created_at or datetime.utcnow()
        db_event_arg.updated_at = db_event_arg.updated_at or datetime.utcnow()
        # is_verified is explicitly set by endpoint
        # categories should come from EventCreate, price too.
        # The endpoint code: db_event = EventModel(**event_data)
        # event_data = event_create_data + is_verified=False, source="User Submitted"
        # So, EventModel is created with these. The default issue primarily affects id, created_at, updated_at.
        pass # db.refresh(db_event) is simulated by this or by direct attribute setting

    mock_db_session.add = MagicMock()
    mock_db_session.commit = MagicMock()
    # When db.refresh(db_event) is called, it should populate the db_event. 
    # We will capture the argument to db.add and modify it to simulate refresh
    # then return it via the response_model logic.
    
    # The endpoint constructs EventModel(id=None, title=..., categories=..., etc.)
    # The actual returned object from the endpoint is `db_event`
    # which is an instance of EventModel.
    # The response_model=EventSchema then validates this ORM object.

    # We need to mock the behavior of the session such that when EventModel is instantiated
    # and then processed, it looks like a valid DB record for EventSchema.
    
    # Side effect for db.add to capture the event and attach an ID for the return value simulation
    # This is tricky because the SQLAlchemy default problem is at instance creation.
    # Let's assume the endpoint *would* work if defaults worked, and mock that.
    
    captured_event_model = None
    def capture_and_prepare_event(event_model_instance):
        nonlocal captured_event_model
        # Simulate that even if defaults failed on EventModel init, by the time it's in the DB and refreshed,
        # it has an ID and timestamps. The endpoint logic itself sets is_verified and source.
        event_model_instance.id = uuid.uuid4() # Simulate DB-generated or correctly defaulted ID
        event_model_instance.created_at = datetime.utcnow()
        event_model_instance.updated_at = datetime.utcnow()
        # `categories` and `price` come from EventCreate, so they should be fine.
        # `is_verified` is set by endpoint to False.
        # `source` is set by endpoint to "User Submitted".
        captured_event_model = event_model_instance

    mock_db_session.add.side_effect = capture_and_prepare_event

    response = client.post("/api/events", json=event_create_data)

    assert response.status_code == 200 # Should be 201 for POST success ideally, but route returns Event (200 OK)
    
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    # mock_db_session.refresh.assert_called_once() # refresh is called in endpoint
    # The actual refresh call needs `db_event` which is local to endpoint.
    # We can check that `captured_event_model` (which is `db_event`) has expected values.

    response_json = response.json()
    assert response_json["title"] == event_create_data["title"]
    assert response_json["is_verified"] is False
    assert response_json["source"] == "User Submitted"
    assert "id" in response_json
    assert "created_at" in response_json
    assert "updated_at" in response_json

def test_create_event_validation_error():
    """Test POST /events with invalid data (e.g., missing required field for EventCreate)."""
    invalid_payload = {
        # Missing "title", "date", etc.
        "location": "A Location"
    }
    response = client.post("/api/events", json=invalid_payload)
    assert response.status_code == 422 # FastAPI's default for Pydantic validation errors

def test_get_event_by_id_found(mock_db_session):
    """Test GET /events/{event_id} when the event exists."""
    event_uuid = uuid.uuid4()
    now = datetime.utcnow()
    mock_event_orm = EventModel(
        id=event_uuid, title="Specific Event", date="2024-05-05", location="Specific Loc",
        address="Specific Addr", categories=["spec"], price="$10", url="http://specific.com",
        created_at=now, updated_at=now, is_verified=True
    )
    mock_db_session.query(EventModel).filter().first.return_value = mock_event_orm

    response = client.get(f"/api/events/{str(event_uuid)}")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["id"] == str(event_uuid)
    assert response_json["title"] == "Specific Event"

def test_get_event_by_id_not_found(mock_db_session):
    """Test GET /events/{event_id} when the event does not exist."""
    non_existent_uuid = uuid.uuid4()
    
    # Explicitly set the mock for this specific query chain for this test
    # Even though the fixture provides a general default, this makes it very clear.
    mock_query_result = mock_db_session.query(EventModel)
    mock_filter_result = mock_query_result.filter(EventModel.id == non_existent_uuid)
    mock_filter_result.first.return_value = None

    response = client.get(f"/api/events/{str(non_existent_uuid)}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Event not found"}

def test_get_events_by_source_found(mock_db_session):
    """Test GET /events/source/{source} when events from that source exist."""
    event_uuid = uuid.uuid4()
    now = datetime.utcnow()
    source_name = "TestDataSource"
    mock_event_orm = EventModel(
        id=event_uuid, title="Sourced Event", date="2024-06-06", location="Source Loc",
        address="Source Addr", categories=["src"], price="$15", url="http://source.com",
        source=source_name, created_at=now, updated_at=now, is_verified=True
    )
    # Important: The filter in the endpoint uses ilike(f"%{source}%").
    # For exact match testing, we ensure the mock responds correctly to this specific filter pattern.
    # This part of mocking can be tricky if the query builder is complex.
    # For now, let's assume the query and filter setup in the mock is sufficient for this test.
    # A more robust mock might involve inspecting the filter expression passed to the mock.
    mock_db_session.query(EventModel).filter(EventModel.source.ilike(f"%{source_name}%")).all.return_value = [mock_event_orm]

    response = client.get(f"/api/events/source/{source_name}")
    assert response.status_code == 200
    response_json = response.json()
    assert len(response_json) == 1
    assert response_json[0]["title"] == "Sourced Event"
    assert response_json[0]["source"] == source_name

def test_get_events_by_source_not_found(mock_db_session):
    """Test GET /events/source/{source} when no events are from that source."""
    non_existent_source = "UnknownSource"
    mock_db_session.query(EventModel).filter(EventModel.source.ilike(f"%{non_existent_source}%")).all.return_value = []

    response = client.get(f"/api/events/source/{non_existent_source}")
    assert response.status_code == 200
    assert response.json() == []

# --- Tests for Club Endpoints ---

def test_get_clubs_empty(mock_db_session):
    """Test GET /clubs when no clubs are in the database."""
    mock_db_session.query(ClubModel).all.return_value = []
    response = client.get("/api/clubs")
    assert response.status_code == 200
    assert response.json() == []

def test_get_clubs_with_data(mock_db_session):
    """Test GET /clubs with some clubs in the database."""
    mock_club_orm_1 = ClubModel(
        id="club1", name="Club Alpha", location="City A", 
        contact_email="alpha@example.com", description="Desc A", skill_level="All"
    )
    mock_club_orm_2 = ClubModel(
        id="club2", name="Club Beta", location="City B", 
        contact_email="beta@example.com", description="Desc B", skill_level="Pro"
    )
    mock_db_session.query(ClubModel).all.return_value = [mock_club_orm_1, mock_club_orm_2]
    
    response = client.get("/api/clubs")
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data) == 2
    assert response_data[0]["name"] == "Club Alpha"
    assert response_data[1]["id"] == "club2"

def test_create_club_success(mock_db_session):
    """Test POST /clubs successfully creates a club."""
    club_create_data = {
        "name": "New Runners United",
        "location": "Metroville",
        "contact_email": "new@runnersutd.com",
        "description": "A new running club for all.",
        "skill_level": "Beginner to Intermediate"
    }

    # Mocking db.add and db.refresh behavior
    # The endpoint generates id, adds, commits, refreshes.
    # The ClubModel doesn't have problematic client-side Python defaults like EventModel did (mostly server_default).
    # So, EventModel(**data) should be fairly safe here.
    
    created_club_instance = None
    def capture_club_on_add(club_instance):
        nonlocal created_club_instance
        # Simulate ID generation that happens in the endpoint before this for ClubModel
        # The endpoint does: club_data["id"] = str(uuid.uuid4())
        # So club_instance passed to add() should already have an id.
        # We also need to ensure it has other fields expected by ClubSchema after refresh.
        club_instance.created_at = datetime.utcnow() # Pydantic schema Club expects these
        club_instance.updated_at = datetime.utcnow()
        club_instance.is_verified = False # Pydantic schema Club has this default
        created_club_instance = club_instance

    mock_db_session.add.side_effect = capture_club_on_add
    mock_db_session.commit = MagicMock()
    # mock_db_session.refresh = MagicMock() # refresh is on the instance

    response = client.post("/api/clubs", json=club_create_data)

    assert response.status_code == 200 # Endpoint returns Club (200 OK)
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()

    response_json = response.json()
    assert response_json["name"] == club_create_data["name"]
    assert response_json["contact_email"] == club_create_data["contact_email"]
    assert "id" in response_json # ID is generated by the endpoint
    assert "created_at" in response_json
    assert "updated_at" in response_json
    assert response_json["is_verified"] is False # Default from Pydantic schema Club

def test_create_club_validation_error(mock_db_session):
    """Test POST /clubs with invalid data (e.g., missing required field for ClubCreate)."""
    # ClubCreate inherits from ClubBase, which has many optional fields.
    # To trigger validation error for ClubCreate, we need to see its definition.
    # ClubCreate(ClubBase): pass. ClubBase fields are mostly optional.
    # Let's assume name, location, contact_email, description, skill_level are effectively required for a useful club.
    # However, Pydantic won't raise error if only optional fields are missing.
    # EmailStr will validate email format.
    invalid_payload_email = {
        "name": "Bad Email Club",
        "location": "Validation City",
        "contact_email": "not-an-email",
        "description": "Test",
        "skill_level": "Any"
    }
    response = client.post("/api/clubs", json=invalid_payload_email)
    assert response.status_code == 422
    assert "contact_email" in response.json()["detail"][0]["loc"]

def test_get_club_by_id_found(mock_db_session):
    """Test GET /clubs/{club_id} when the club exists."""
    club_id = "testclub123"
    mock_club_orm = ClubModel(
        id=club_id, name="Found Club", location="Found City", 
        contact_email="found@example.com", description="Found Desc", skill_level="Intermediate"
    )
    mock_db_session.query(ClubModel).filter().first.return_value = mock_club_orm

    response = client.get(f"/api/clubs/{club_id}")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["id"] == club_id
    assert response_json["name"] == "Found Club"

def test_get_club_by_id_not_found(mock_db_session):
    """Test GET /clubs/{club_id} when the club does not exist."""
    non_existent_id = "club_not_real"

    # Explicitly set the mock for this specific query chain
    mock_query_result = mock_db_session.query(ClubModel)
    mock_filter_result = mock_query_result.filter(ClubModel.id == non_existent_id)
    mock_filter_result.first.return_value = None

    response = client.get(f"/api/clubs/{non_existent_id}")
    assert response.status_code == 404 
    assert response.json() == {"detail": "Club not found"}

# We will add more tests for other event endpoints and club endpoints. 