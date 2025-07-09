from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Running Events Hub"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    POSTGRES_SERVER: str = "ep-small-unit-a1h4gsi7-pooler.ap-southeast-1.aws.neon.tech"
    POSTGRES_USER: str = "neondb_owner"
    POSTGRES_PASSWORD: str = "npg_xn0KPuDiI7Jc"
    POSTGRES_DB: str = "neondb"
    POSTGRES_PORT: str = "5432"

    RECAPTCHA_SECRET: str = "6Lf6kHorAAAAADkNfV2uPCmzk1a79q2AY7tlU64Y"

    DATABASE_URL: Optional[str] = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"


    # Scraping API Key and Secret Message
    SCRAPING_API_KEY: str = "your_secret_api_key_here"  
    SCRAPING_SECRET_MESSAGE: str = "your_secret_message_for_scraping_here" 
    
    SUPABASE_PROJECT_ID : str = "gvheihkjpuewfbabljqf"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aGVpaGtqcHVld2ZiYWJsanFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTg5NzIsImV4cCI6MjA2NTk3NDk3Mn0.ocS-JT3hdU5-tOoDvvPw9-0l6dRYty2EWwKq0RyBtgA" 
   
    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL

        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"

settings = Settings() 