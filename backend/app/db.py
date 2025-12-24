from __future__ import annotations

from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine

from .config import get_settings


def get_engine():
    settings = get_settings()

    # Ensure ./data exists for default sqlite path
    if settings.database_url.startswith("sqlite:///./"):
        rel_path = settings.database_url.removeprefix("sqlite:///./")
        db_file = Path(rel_path)
        db_file.parent.mkdir(parents=True, exist_ok=True)

    connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
    return create_engine(settings.database_url, echo=False, connect_args=connect_args)


ENGINE = get_engine()


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(ENGINE)


def get_session():
    with Session(ENGINE) as session:
        yield session

