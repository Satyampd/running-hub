from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.event import Event
from datetime import datetime
import uuid

class EventDBHandler:
    def __init__(self, db: Session):
        self.db = db

    def upsert_events(self, events: List[Dict[str, Any]]) -> List[Event]:
        """
        Upsert events into the database.
        If an event with the same URL exists, update it.
        Otherwise, create a new event.
        """
        result = []
        for event_data in events:
            # Process UUID fields
            if 'id' in event_data:
                # Convert string UUID to UUID object if it's a string
                if isinstance(event_data['id'], str):
                    try:
                        event_data['id'] = uuid.UUID(event_data['id'])
                    except ValueError:
                        # Generate a new UUID if the string is not a valid UUID
                        event_data['id'] = uuid.uuid4()
                # If id is missing or None, generate a new UUID
                elif event_data['id'] is None:
                    event_data['id'] = uuid.uuid4()
            else:
                # Generate a new UUID if no id is provided
                event_data['id'] = uuid.uuid4()
            
            # Check if event exists
            existing_event = self.db.query(Event).filter(Event.url == event_data['url']).first()
            
            if existing_event:
                # Update existing event
                for key, value in event_data.items():
                    if key != 'id':  # Don't update the primary key
                        setattr(existing_event, key, value)
                existing_event.updated_at = datetime.now()
                result.append(existing_event)
            else:
                # Create new event
                new_event = Event(**event_data)
                self.db.add(new_event)
                result.append(new_event)
        
        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e
            
        return result 

    def event_exists(self, url: str, title: str = None) -> bool:
        """
        Check if an event exists in the database by URL or (optionally) by title.
        """
        query = self.db.query(Event).filter(Event.url == url)
        if title:
            query = query.union(self.db.query(Event).filter(Event.title == title))
        return self.db.query(query.exists()).scalar() 