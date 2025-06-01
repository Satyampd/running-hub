from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from sqlalchemy.orm import Session
from app.schemas.event import Event, EventCreate
from app.models.event import Event as EventModel
from app.schemas.club import Club, ClubCreate
from app.models.club import Club as ClubModel
from app.db.base import SessionLocal
from app.api.scraping import router as scraping_router
from app.core.logging_config import get_logger

import uuid

logger = get_logger(__name__)

router = APIRouter()

# Include the scraping router
router.include_router(scraping_router, prefix="/scrape", tags=["scraping"])
logger.info("Scraping router included.")

# Dependency
def get_db():
    # logger.debug("Creating database session.")
    db = SessionLocal()
    try:
        yield db
    finally:
        # logger.debug("Closing database session.")
        db.close()


@router.get("/events", response_model=List[Event])
async def get_events(request: Request, db: Session = Depends(get_db)):
    logger.info(f"GET /events request from {request.client.host}")
    try:
        today = date.today() # - timedelta(days=1)  # Get today's date minus one day
        verified_events = events = db.query(EventModel).all()
        # verified_events = db.query(EventModel).filter(EventModel.is_verified == True).all()

        # filter events in Python by parsing string dates
        filtered_events = []
        for event in verified_events:
            # parse event.date string e.g. '9 Nov 2025'
            event_date = datetime.strptime(event.date, "%d %b %Y").date()
            if event_date >= today:
                filtered_events.append(event)

        return filtered_events
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        raise HTTPException(status_code=500, detail="Error fetching events")

@router.post("/events", response_model=Event)
async def create_event(event: EventCreate, request: Request, db: Session = Depends(get_db)):
    logger.info(f"POST /events request from {request.client.host} with payload: {event}")
    """Create a new event submitted by a user"""
    try:
        # Set is_verified to False for user-submitted events
        event_data = event.model_dump()
        event_data["is_verified"] = False
        event_data["source"] = "User Submitted"
        
        db_event = EventModel(**event_data)
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        logger.info(f"Event created with ID: {db_event.id}")
        return db_event
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str, request: Request, db: Session = Depends(get_db)):
    logger.info(f"GET /events/{event_id} request from {request.client.host}")
    """Get a specific event by ID from database"""
    try:
        event = db.query(EventModel).filter(EventModel.id == event_id).first()
        if not event:
            logger.warning(f"Event with ID {event_id} not found.")
            raise HTTPException(status_code=404, detail="Event not found")
        logger.info(f"Retrieved event with ID: {event_id}")
        return event
    except Exception as e:
        logger.error(f"Error getting event {event_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/source/{source}", response_model=List[Event])
async def get_events_by_source(source: str, request: Request, db: Session = Depends(get_db)):
    logger.info(f"GET /events/source/{source} request from {request.client.host}")
    """Get events from a specific source from database"""
    try:
        events = db.query(EventModel).filter(EventModel.source.ilike(f"%{source}%")).all()
        logger.info(f"Retrieved {len(events)} events from source: {source}")
        return events
    except Exception as e:
        logger.error(f"Error getting events by source {source}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clubs", response_model=List[Club])
async def get_clubs(request: Request, db: Session = Depends(get_db)):
    logger.info(f"GET /clubs request from {request.client.host}")
    """Get all running clubs from database"""
    try:
        clubs = db.query(ClubModel).all()
        logger.info(f"Retrieved {len(clubs)} clubs from database.")
        return clubs
    except Exception as e:
        logger.error(f"Error getting clubs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clubs", response_model=Club)
async def create_club(club: ClubCreate, request: Request, db: Session = Depends(get_db)):
    logger.info(f"POST /clubs request from {request.client.host} with payload: {club}")
    """Create a new club"""
    try:
        club_data = club.model_dump()
        club_data["id"] = str(uuid.uuid4())
        db_club = ClubModel(**club_data)
        db.add(db_club)
        db.commit()
        db.refresh(db_club)
        logger.info(f"Club created with ID: {db_club.id}")
        return db_club
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating club: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clubs/{club_id}", response_model=Club)
async def get_club(club_id: str, request: Request, db: Session = Depends(get_db)):
    logger.info(f"GET /clubs/{club_id} request from {request.client.host}")
    """Get a specific club by ID from database"""
    try:
        club = db.query(ClubModel).filter(ClubModel.id == club_id).first()
        if not club:
            logger.warning(f"Club with ID {club_id} not found.")
            raise HTTPException(status_code=404, detail="Club not found")
        logger.info(f"Retrieved club with ID: {club_id}")
        return club
    except Exception as e:
        logger.error(f"Error getting club {club_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 