from supabase import create_client, Client
from app.core.config import Settings

settings = Settings()

SUPABASE_URL = f"https://{settings.SUPABASE_PROJECT_ID}.supabase.co"
SUPABASE_KEY = settings.SUPABASE_ANON_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) 