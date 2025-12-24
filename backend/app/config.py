from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


class Settings(BaseModel):
    cloudbeds_base_url: str = "https://hotels.cloudbeds.com/api/v1.1"
    cloudbeds_api_key: str = ""
    cloudbeds_property_id: str = ""

    database_url: str = "sqlite:///./data/app.db"
    admin_token: str = ""


@lru_cache
def get_settings() -> Settings:
    # Load .env if present (local dev convenience)
    load_dotenv(dotenv_path=Path(".env"), override=False)
    return Settings.model_validate(
        {
            "cloudbeds_base_url": __import__("os").environ.get("CLOUDBEDS_BASE_URL", ""),
            "cloudbeds_api_key": __import__("os").environ.get("CLOUDBEDS_API_KEY", ""),
            "cloudbeds_property_id": __import__("os").environ.get("CLOUDBEDS_PROPERTY_ID", ""),
            "database_url": __import__("os").environ.get("DATABASE_URL", ""),
            "admin_token": __import__("os").environ.get("ADMIN_TOKEN", ""),
        }
    )

