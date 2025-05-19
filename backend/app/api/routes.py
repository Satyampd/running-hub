from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from app.schemas.event import Event
from app.models.event import Event as EventModel
from app.db.base import SessionLocal

router = APIRouter()

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