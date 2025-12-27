from __future__ import annotations

from datetime import date
from typing import Any, Optional

import httpx

from .config import get_settings


class CloudbedsError(RuntimeError):
    pass


def _parse_date(value: Any) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date) and not hasattr(value, "hour"):
        return value
    if isinstance(value, str):
        # Cloudbeds commonly returns YYYY-MM-DD
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def extract_reservation_fields(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Best-effort normalization across Cloudbeds response shapes.
    Keeps full payload in `raw` for later use.
    """
    rid = (
        payload.get("reservationID")
        or payload.get("reservationId")
        or payload.get("reservation_id")
        or payload.get("id")
        or ""
    )
    status = (payload.get("status") or payload.get("reservationStatus") or "").strip()
    check_in = _parse_date(payload.get("checkin") or payload.get("checkIn") or payload.get("arrivalDate"))
    check_out = _parse_date(payload.get("checkout") or payload.get("checkOut") or payload.get("departureDate"))
    source = payload.get("source") or payload.get("channel") or payload.get("origin")

    # Guest fields can be nested (guest / guests / primaryGuest)
    guest_email = None
    guest_first = None
    guest_last = None

    guest_obj = payload.get("guest") or payload.get("primaryGuest")
    if isinstance(guest_obj, dict):
        guest_email = guest_obj.get("email") or guest_obj.get("emailAddress")
        guest_first = guest_obj.get("firstName") or guest_obj.get("first_name")
        guest_last = guest_obj.get("lastName") or guest_obj.get("last_name")
    else:
        guests = payload.get("guests")
        if isinstance(guests, list) and guests:
            g0 = guests[0]
            if isinstance(g0, dict):
                guest_email = g0.get("email") or g0.get("emailAddress")
                guest_first = g0.get("firstName") or g0.get("first_name")
                guest_last = g0.get("lastName") or g0.get("last_name")

    return {
        "cloudbeds_reservation_id": str(rid),
        "status": status,
        "check_in": check_in,
        "check_out": check_out,
        "guest_email": (guest_email or None),
        "guest_first_name": (guest_first or None),
        "guest_last_name": (guest_last or None),
        "source": (source or None),
        "raw": payload,
    }


class CloudbedsClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        if not self.settings.cloudbeds_api_key or not self.settings.cloudbeds_property_id:
            raise CloudbedsError(
                "Missing CLOUDBEDS_API_KEY and/or CLOUDBEDS_PROPERTY_ID. Set them in environment."
            )

    def _headers(self) -> dict[str, str]:
        # Many Cloudbeds API calls accept API key as query param; some also allow header.
        # We'll send both patterns to be resilient.
        return {
            "Accept": "application/json",
            "User-Agent": "cloudbeds-marketing-mvp/0.1",
            "Authorization": f"Bearer {self.settings.cloudbeds_api_key}",
        }

    async def get_reservations(self, start: date, end: date) -> list[dict[str, Any]]:
        """
        Pull reservations for a date range. Cloudbeds API naming varies by version/account;
        we attempt common endpoints and normalize the response.
        """
        base = self.settings.cloudbeds_base_url.rstrip("/")
        params = {
            "propertyID": self.settings.cloudbeds_property_id,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "apiKey": self.settings.cloudbeds_api_key,
        }

        # Try common Cloudbeds endpoints (v1.1)
        candidates = [
            f"{base}/getReservations",
            f"{base}/reservations",
        ]

        async with httpx.AsyncClient(timeout=60.0, headers=self._headers()) as client:
            last_err: Exception | None = None
            for url in candidates:
                try:
                    resp = await client.get(url, params=params)
                    resp.raise_for_status()
                    data = resp.json()
                    return _coerce_reservations_list(data)
                except Exception as e:  # noqa: BLE001 - we want to try fallbacks
                    last_err = e
                    continue
            raise CloudbedsError(f"Cloudbeds reservations pull failed: {last_err}")


def _coerce_reservations_list(data: Any) -> list[dict[str, Any]]:
    """
    Coerce Cloudbeds responses into a list of reservation dicts.
    Observed shapes:
    - {"success": true, "data": {"reservations": [...]}}
    - {"data": [...]}
    - {"reservations": [...]}
    - [...]
    """
    if isinstance(data, list):
        return [x for x in data if isinstance(x, dict)]
    if not isinstance(data, dict):
        return []

    if isinstance(data.get("reservations"), list):
        return [x for x in data["reservations"] if isinstance(x, dict)]

    d = data.get("data")
    if isinstance(d, list):
        return [x for x in d if isinstance(x, dict)]
    if isinstance(d, dict) and isinstance(d.get("reservations"), list):
        return [x for x in d["reservations"] if isinstance(x, dict)]

    return []

