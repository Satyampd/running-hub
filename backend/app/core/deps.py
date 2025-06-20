from fastapi import Depends, HTTPException, status, Request
from app.core.config import settings

def verify_api_key(request: Request):
    api_key = request.headers.get("X-API-KEY")
    if not api_key or api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Request",
        ) 