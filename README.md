# Cloudbeds → Email Marketing MVP (API-first)

This repo is a small backend you can use to **sync current reservations from Cloudbeds**, store them in **SQLite**, and expose simple endpoints to build **email audiences** for a marketing webapp.

## What it does

- **Sync reservations** from Cloudbeds for a date range and upsert into SQLite
- **Ingest webhook payloads** (useful if you later push events in from Zapier)
- Build **deduped email lists** (in-house / future arrivals / departed)
- Basic **opt-in** + **unsubscribe** endpoints
- A **campaign “send” stub** (selects recipients and marks a campaign as sent; you’ll wire a real email provider later)

## Setup

### 1) Create your env file

Copy `.env.example` to `.env` and fill in:

- `CLOUDBEDS_API_KEY`
- `CLOUDBEDS_PROPERTY_ID`
- (optional) `ADMIN_TOKEN` to protect write endpoints with `X-Admin-Token`

### 2) Install dependencies

```bash
python3 -m pip install -r requirements.txt
```

### 3) Run the API

```bash
python3 -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Check it:

```bash
curl -s http://localhost:8000/health
```

## Pull “current reservations” from Cloudbeds

Pick a date range that includes “current” stays. For example: from 30 days ago through 180 days ahead.

```bash
curl -s -X POST "http://localhost:8000/sync/cloudbeds/reservations?start=2025-11-24&end=2026-06-24" \
  -H "X-Admin-Token: $ADMIN_TOKEN"
```

Then view what was stored:

```bash
curl -s "http://localhost:8000/reservations?limit=50"
```

## Build an email audience

Get deduped emails from reservations:

```bash
curl -s "http://localhost:8000/audience/emails?segment=in_house"
curl -s "http://localhost:8000/audience/emails?segment=future_arrivals"
curl -s "http://localhost:8000/audience/emails?segment=departed"
```

Only include contacts who have opted in (recommended):

```bash
curl -s "http://localhost:8000/audience/emails?segment=in_house&opted_in_only=true"
```

## Opt-in and unsubscribe

Opt-in (admin-gated):

```bash
curl -s -X POST "http://localhost:8000/contacts/optin" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"email":"guest@example.com","first_name":"Guest","last_name":"Example"}'
```

Unsubscribe (not admin-gated):

```bash
curl -s -X POST "http://localhost:8000/contacts/unsubscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@example.com"}'
```

## Notes / next steps

- **Cloudbeds API shapes vary** by account/version. The client currently tries common endpoints and normalizes fields best-effort while storing the full raw payload. If your Cloudbeds endpoint/params differ, update `backend/app/cloudbeds.py`.
- **Compliance**: only email guests who have explicitly opted in, and always include unsubscribe handling.