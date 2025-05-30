from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from app.schemas.event import Event, EventCreate
from app.models.event import Event as EventModel
from app.schemas.club import Club, ClubCreate
from app.models.club import Club as ClubModel
from app.db.base import SessionLocal
from app.api.scraping import router as scraping_router

import uuid



router = APIRouter()

# Include the scraping router
router.include_router(scraping_router, prefix="/scrape", tags=["scraping"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/events", response_model=List[Event])
async def get_events(db: Session = Depends(get_db)):
    """Get all running events from database"""
    try:
        events = db.query(EventModel).all()
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events", response_model=Event)
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
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
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str, db: Session = Depends(get_db)):
    """Get a specific event by ID from database"""
    try:
        event = db.query(EventModel).filter(EventModel.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/source/{source}", response_model=List[Event])
async def get_events_by_source(source: str, db: Session = Depends(get_db)):
    """Get events from a specific source from database"""
    try:
        events = db.query(EventModel).filter(EventModel.source.ilike(f"%{source}%")).all()
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clubs", response_model=List[Club])
async def get_clubs(db: Session = Depends(get_db)):
    """Get all running clubs from database"""
    try:
        clubs = db.query(ClubModel).all()
        return clubs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clubs", response_model=Club)
async def create_club(club: ClubCreate, db: Session = Depends(get_db)):
    """Create a new club"""
    try:
        club_data = club.model_dump()
        club_data["id"] = str(uuid.uuid4())
        db_club = ClubModel(**club_data)
        db.add(db_club)
        db.commit()
        db.refresh(db_club)
        return db_club
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clubs/{club_id}", response_model=Club)
async def get_club(club_id: str, db: Session = Depends(get_db)):
    """Get a specific club by ID from database"""
    try:
        club = db.query(ClubModel).filter(ClubModel.id == club_id).first()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        return club
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 