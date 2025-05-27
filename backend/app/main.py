from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
import os

app = FastAPI(
    title="Running Events Hub API",
    description="API for managing running events and clubs in India",
    version="1.0.0"
)

# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = [
    # Local development
    "http://localhost:5173",
    "http://192.168.1.33:5173",
    # Render domains
    "https://running-events-hub-frontend.onrender.com",
    "https://running-events-hub-api.onrender.com",
]

# In production, allow all origins if specified
if os.getenv("ALLOW_ALL_ORIGINS", "").lower() == "true":
    ALLOWED_ORIGINS.append("*")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Running Events Hub API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 