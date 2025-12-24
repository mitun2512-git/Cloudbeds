from __future__ import annotations

from datetime import datetime, date
from typing import Optional

from sqlmodel import SQLModel, Field, Column, JSON


class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Cloudbeds identifiers
    cloudbeds_reservation_id: str = Field(index=True)
    cloudbeds_property_id: str = Field(index=True)

    status: str = Field(default="", index=True)
    check_in: Optional[date] = Field(default=None, index=True)
    check_out: Optional[date] = Field(default=None, index=True)

    guest_email: Optional[str] = Field(default=None, index=True)
    guest_first_name: Optional[str] = None
    guest_last_name: Optional[str] = None

    source: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Keep raw payload for future mapping/fields
    raw: dict = Field(default_factory=dict, sa_column=Column(JSON))


class Contact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)

    first_name: Optional[str] = None
    last_name: Optional[str] = None

    # Marketing compliance controls
    opted_in: bool = Field(default=False, index=True)
    unsubscribed_at: Optional[datetime] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    subject: str
    html: str

    # Basic audit
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    sent_at: Optional[datetime] = Field(default=None, index=True)
    audience_count: int = 0

