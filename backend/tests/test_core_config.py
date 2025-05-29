import pytest
import os
from unittest.mock import patch

from app.core.config import Settings

def test_default_settings_no_env_file():
    """Test default settings are loaded correctly when no .env file is used."""
    settings = Settings(_env_file=None) # Prevent loading .env
    assert settings.PROJECT_NAME == "Running Events Hub"
    assert settings.VERSION == "1.0.0"
    assert settings.API_V1_STR == "/api"
    assert settings.POSTGRES_SERVER == "localhost"
    assert settings.POSTGRES_USER == "postgres"
    assert settings.POSTGRES_PASSWORD == "postgres"
    assert settings.POSTGRES_DB == "running_events"
    assert settings.POSTGRES_PORT == "5432"
    assert settings.ACTIVE_API_KEY == "" 
    assert settings.DATABASE_URL is None # Default from model definition
    # Test constructed URL from defaults
    expected_default_constructed_url = "postgresql://postgres:postgres@localhost:5432/running_events"
    assert settings.get_database_url == expected_default_constructed_url

def test_get_database_url_constructed_kwargs_no_env_file():
    """Test get_database_url with kwargs, when DATABASE_URL is not set and no .env file."""
    settings = Settings(
        POSTGRES_USER="test_user", 
        POSTGRES_PASSWORD="test_pass", 
        POSTGRES_SERVER="test_host", 
        POSTGRES_PORT="1234", 
        POSTGRES_DB="test_db",
        _env_file=None # Prevent loading .env, prioritize kwargs
    )
    expected_url = "postgresql://test_user:test_pass@test_host:1234/test_db"
    assert settings.get_database_url == expected_url
    assert settings.DATABASE_URL is None # As it was not passed in kwargs

def test_get_database_url_explicitly_set_kwargs_no_env_file():
    """Test get_database_url when DATABASE_URL is explicitly set via kwargs and no .env file."""
    explicit_url = "postgresql://explicit_user:explicit_pass@explicit_host:5432/explicit_db"
    settings = Settings(DATABASE_URL=explicit_url, _env_file=None)
    assert settings.get_database_url == explicit_url

@patch.dict(os.environ, {
    "PROJECT_NAME": "Env Overridden Project",
    "ACTIVE_API_KEY": "env_api_key",
    "DATABASE_URL": "env_db_url_explicit"
})
def test_settings_override_from_env_no_dot_env_file():
    """Test that settings can be overridden by environment variables, ignoring .env file."""
    settings = Settings(_env_file=None) # Ignore .env, load from patched os.environ
    assert settings.PROJECT_NAME == "Env Overridden Project"
    assert settings.ACTIVE_API_KEY == "env_api_key"
    assert settings.DATABASE_URL == "env_db_url_explicit"
    assert settings.get_database_url == "env_db_url_explicit"

@patch.dict(os.environ, {
    "POSTGRES_USER": "env_pg_user",
    "POSTGRES_PASSWORD": "env_pg_pass",
    "POSTGRES_DB": "env_pg_db",
    # Ensure DATABASE_URL is NOT in this patch dict to test construction
})
def test_get_database_url_constructed_from_env_no_dot_env_file():
    """Test get_database_url construction from env vars, ignoring .env and no explicit DATABASE_URL env var."""
    # Temporarily remove DATABASE_URL from os.environ if it exists from a previous test context or real env
    # This is important because @patch.dict only adds/overrides, doesn't inherently clear others.
    with patch.dict(os.environ, {}, clear=True): # Start with a totally clean os.environ for this test scope
        # Re-apply only the specific env vars we want for this test case using another patch
        with patch.dict(os.environ, {
            "POSTGRES_USER": "env_pg_user",
            "POSTGRES_PASSWORD": "env_pg_pass",
            "POSTGRES_DB": "env_pg_db",
            "POSTGRES_SERVER": "env_pg_server", # Need to provide all components for construction
            "POSTGRES_PORT": "env_pg_port"      # Or they will take Pydantic defaults, not Settings defaults
        }):
            settings = Settings(_env_file=None) # Ignore .env

            assert settings.POSTGRES_USER == "env_pg_user"
            assert settings.POSTGRES_PASSWORD == "env_pg_pass"
            assert settings.POSTGRES_DB == "env_pg_db"
            assert settings.POSTGRES_SERVER == "env_pg_server"
            assert settings.POSTGRES_PORT == "env_pg_port"
            
            assert settings.DATABASE_URL is None # Should be None as not set in env
            
            expected_url = "postgresql://env_pg_user:env_pg_pass@env_pg_server:env_pg_port/env_pg_db"
            assert settings.get_database_url == expected_url 