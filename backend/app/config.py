from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel
import os


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
    data: dict[str, str] = {}
    if v := os.getenv("CLOUDBEDS_BASE_URL"):
        data["cloudbeds_base_url"] = v
    if v := os.getenv("CLOUDBEDS_API_KEY"):
        data["cloudbeds_api_key"] = v
    if v := os.getenv("CLOUDBEDS_PROPERTY_ID"):
        data["cloudbeds_property_id"] = v
    if v := os.getenv("DATABASE_URL"):
        data["database_url"] = v
    if v := os.getenv("ADMIN_TOKEN"):
        data["admin_token"] = v
    return Settings(**data)

