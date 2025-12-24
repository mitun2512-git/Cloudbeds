from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from .auth import require_admin
from .cloudbeds import CloudbedsClient, CloudbedsError, extract_reservation_fields
from .db import create_db_and_tables, get_session
from .models import Campaign, Contact, Reservation
from .config import get_settings


app = FastAPI(title="Cloudbeds Email Marketing MVP", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    create_db_and_tables()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/config")
def config() -> dict[str, Any]:
    s = get_settings()
    return {
        "cloudbeds_base_url": s.cloudbeds_base_url,
        "cloudbeds_property_id_set": bool(s.cloudbeds_property_id),
        "cloudbeds_api_key_set": bool(s.cloudbeds_api_key),
        "database_url": s.database_url,
        "admin_token_required": bool(s.admin_token),
    }


def _upsert_reservation(session: Session, normalized: dict[str, Any]) -> Reservation:
    rid = normalized.get("cloudbeds_reservation_id") or ""
    pid = normalized.get("cloudbeds_property_id") or ""
    if not rid or not pid:
        raise HTTPException(status_code=422, detail="Missing reservation/property id")

    existing = session.exec(
        select(Reservation).where(
            Reservation.cloudbeds_reservation_id == rid,
            Reservation.cloudbeds_property_id == pid,
        )
    ).first()

    if existing:
        for k, v in normalized.items():
            if hasattr(existing, k):
                setattr(existing, k, v)
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    r = Reservation(**normalized)
    r.updated_at = datetime.utcnow()
    session.add(r)
    session.commit()
    session.refresh(r)
    return r


def _upsert_contact_from_reservation(session: Session, r: Reservation) -> None:
    if not r.guest_email:
        return
    email = r.guest_email.strip().lower()
    if not email:
        return

    c = session.exec(select(Contact).where(Contact.email == email)).first()
    now = datetime.utcnow()
    if not c:
        c = Contact(
            email=email,
            first_name=r.guest_first_name,
            last_name=r.guest_last_name,
            opted_in=False,
            created_at=now,
            updated_at=now,
        )
    else:
        c.first_name = c.first_name or r.guest_first_name
        c.last_name = c.last_name or r.guest_last_name
        c.updated_at = now
    session.add(c)
    session.commit()


@app.post("/sync/cloudbeds/reservations")
async def sync_cloudbeds_reservations(
    start: date,
    end: date,
    _: None = Depends(require_admin),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Pull reservations from Cloudbeds in [start, end] and upsert them.
    """
    if end < start:
        raise HTTPException(status_code=422, detail="end must be >= start")

    try:
        client = CloudbedsClient()
        rows = await client.get_reservations(start=start, end=end)
    except CloudbedsError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    s = get_settings()
    upserted = 0
    skipped = 0
    for payload in rows:
        normalized = extract_reservation_fields(payload)
        normalized["cloudbeds_property_id"] = s.cloudbeds_property_id
        if not normalized["cloudbeds_reservation_id"]:
            skipped += 1
            continue
        r = _upsert_reservation(session, normalized)
        _upsert_contact_from_reservation(session, r)
        upserted += 1

    return {"pulled": len(rows), "upserted": upserted, "skipped": skipped}


@app.post("/webhooks/cloudbeds")
def cloudbeds_webhook_ingest(
    body: Any,
    _: None = Depends(require_admin),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Generic webhook ingest for Cloudbeds/Zapier.
    Accepts either a single reservation payload (dict) or a list of payloads.
    """
    s = get_settings()
    payloads: list[dict[str, Any]]
    if isinstance(body, dict):
        payloads = [body]
    elif isinstance(body, list):
        payloads = [x for x in body if isinstance(x, dict)]
    else:
        raise HTTPException(status_code=422, detail="Expected JSON object or list of objects")

    upserted = 0
    skipped = 0
    for payload in payloads:
        normalized = extract_reservation_fields(payload)
        normalized["cloudbeds_property_id"] = s.cloudbeds_property_id or normalized.get("cloudbeds_property_id") or ""
        if not normalized["cloudbeds_reservation_id"] or not normalized["cloudbeds_property_id"]:
            skipped += 1
            continue
        r = _upsert_reservation(session, normalized)
        _upsert_contact_from_reservation(session, r)
        upserted += 1
    return {"received": len(payloads), "upserted": upserted, "skipped": skipped}


@app.get("/reservations")
def list_reservations(
    limit: int = 200,
    session: Session = Depends(get_session),
) -> list[Reservation]:
    limit = max(1, min(limit, 2000))
    rows = session.exec(select(Reservation).order_by(Reservation.updated_at.desc()).limit(limit)).all()
    return list(rows)


@app.get("/contacts")
def list_contacts(
    limit: int = 200,
    session: Session = Depends(get_session),
) -> list[Contact]:
    limit = max(1, min(limit, 2000))
    rows = session.exec(select(Contact).order_by(Contact.updated_at.desc()).limit(limit)).all()
    return list(rows)


@app.get("/campaigns")
def list_campaigns(
    limit: int = 200,
    session: Session = Depends(get_session),
) -> list[Campaign]:
    limit = max(1, min(limit, 2000))
    rows = session.exec(select(Campaign).order_by(Campaign.created_at.desc()).limit(limit)).all()
    return list(rows)


AudienceSegment = Literal["in_house", "future_arrivals", "departed"]


def _is_active_status(status: str) -> bool:
    s = (status or "").strip().lower()
    return s not in {"canceled", "cancelled", "no_show", "noshow"}


@app.get("/audience/emails")
def audience_emails(
    segment: AudienceSegment = "in_house",
    as_of: Optional[date] = None,
    opted_in_only: bool = False,
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Build a deduped email list from reservations + contacts.

    - in_house: check_in <= as_of < check_out
    - future_arrivals: check_in >= as_of
    - departed: check_out < as_of
    """
    d = as_of or date.today()
    reservations = session.exec(select(Reservation)).all()

    emails: set[str] = set()
    for r in reservations:
        if not r.guest_email or not r.check_in or not r.check_out:
            continue
        if not _is_active_status(r.status):
            continue

        ok = False
        if segment == "in_house":
            ok = r.check_in <= d < r.check_out
        elif segment == "future_arrivals":
            ok = r.check_in >= d
        elif segment == "departed":
            ok = r.check_out < d

        if ok:
            emails.add(r.guest_email.strip().lower())

    if opted_in_only:
        contacts = session.exec(
            select(Contact).where(Contact.opted_in == True, Contact.unsubscribed_at == None)  # noqa: E712
        ).all()
        allowed = {c.email for c in contacts}
        emails = emails.intersection(allowed)

    return {"segment": segment, "as_of": d.isoformat(), "count": len(emails), "emails": sorted(emails)}


class ContactUpsert(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

@app.post("/contacts/optin")
def contact_opt_in(
    body: ContactUpsert,
    _: None = Depends(require_admin),
    session: Session = Depends(get_session),
) -> Contact:
    email = body.email.strip().lower()
    now = datetime.utcnow()
    c = session.exec(select(Contact).where(Contact.email == email)).first()
    if not c:
        c = Contact(email=email, first_name=body.first_name, last_name=body.last_name, created_at=now, updated_at=now)
    c.opted_in = True
    c.unsubscribed_at = None
    c.updated_at = now
    session.add(c)
    session.commit()
    session.refresh(c)
    return c


@app.post("/contacts/unsubscribe")
def contact_unsubscribe(
    body: ContactUpsert,
    session: Session = Depends(get_session),
) -> Contact:
    # Unsubscribe is intentionally NOT admin-gated.
    email = body.email.strip().lower()
    now = datetime.utcnow()
    c = session.exec(select(Contact).where(Contact.email == email)).first()
    if not c:
        c = Contact(email=email, first_name=body.first_name, last_name=body.last_name, created_at=now, updated_at=now)
    c.opted_in = False
    c.unsubscribed_at = now
    c.updated_at = now
    session.add(c)
    session.commit()
    session.refresh(c)
    return c


class CampaignCreate(BaseModel):
    name: str
    subject: str
    html: str


@app.post("/campaigns")
def create_campaign(
    body: CampaignCreate,
    _: None = Depends(require_admin),
    session: Session = Depends(get_session),
) -> Campaign:
    c = Campaign(name=body.name, subject=body.subject, html=body.html)
    session.add(c)
    session.commit()
    session.refresh(c)
    return c


@app.post("/campaigns/{campaign_id}/send")
def send_campaign_stub(
    campaign_id: int,
    segment: AudienceSegment = "in_house",
    opted_in_only: bool = True,
    _: None = Depends(require_admin),
    session: Session = Depends(get_session),
) -> dict[str, Any]:
    """
    Stub "send": selects recipients, marks campaign as sent, returns recipients.
    Replace this with SendGrid/Mailgun/etc. in your webapp later.
    """
    camp = session.get(Campaign, campaign_id)
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    audience = audience_emails(segment=segment, opted_in_only=opted_in_only, session=session)
    recipients = audience["emails"]

    camp.sent_at = datetime.utcnow()
    camp.audience_count = len(recipients)
    session.add(camp)
    session.commit()

    return {"campaign_id": campaign_id, "recipients": recipients, "count": len(recipients)}

