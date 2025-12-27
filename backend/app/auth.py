from __future__ import annotations

from fastapi import Header, HTTPException

from .config import get_settings


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    """
    Optional simple auth gate for write endpoints.

    If ADMIN_TOKEN is set, callers must send X-Admin-Token.
    If ADMIN_TOKEN is empty, no auth is required (dev mode).
    """
    settings = get_settings()
    if not settings.admin_token:
        return
    if x_admin_token != settings.admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")

