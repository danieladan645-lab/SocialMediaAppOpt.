import os
import time

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from audit_engine import run_audit, suggest_competitors, run_teaser_audit
from auth import get_user_id
from db import get_or_create_balance, deduct_credit, save_audit
from stripe_routes import router as stripe_router
from instagram_fetcher import fetch_profile
from models import AuditData, CompareData
from renderers.docx_renderer import build_docx
from renderers.pptx_renderer import build_pptx


def _is_admin(user_id: str) -> bool:
    raw = os.getenv("ADMIN_USER_IDS", "")
    return user_id in {uid.strip() for uid in raw.split(",") if uid.strip()}

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Brand Audit Engine", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(stripe_router)

_FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
_ALLOWED_ORIGINS = [_FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Credits-Remaining"],
)


class AuditRequest(BaseModel):
    handle: str
    tier: str = "basic"
    self_archetype: str = "course_creator"
    manual_followers: int | None = None
    manual_following: int | None = None
    manual_posts: int | None = None
    manual_years: int | None = None


class CompareRequest(BaseModel):
    handle: str
    competitor_handle: str
    tier: str = "basic"
    self_archetype: str = "course_creator"


class SuggestRequest(BaseModel):
    handle: str
    self_archetype: str = "course_creator"
    bio: str = ""


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats/{handle}")
@limiter.limit("5/minute")
def profile_stats(request: Request, handle: str):
    data = fetch_profile(handle)
    if not data:
        raise HTTPException(status_code=404, detail="Profile not found or private")
    return data


@app.get("/credits/balance")
def credits_balance(user_id: str = Depends(get_user_id)):
    if _is_admin(user_id):
        return {"balance": 9999}
    balance = get_or_create_balance(user_id)
    return {"balance": balance}


@app.post("/audit/teaser")
@limiter.limit("10/minute")
def audit_teaser_endpoint(request: Request, req: AuditRequest):
    try:
        result = run_teaser_audit(req.handle, req.self_archetype)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Teaser failed: {e}")
    return JSONResponse(content=result)


@app.post("/audit/suggest-competitors")
@limiter.limit("5/minute")
def suggest_competitors_endpoint(request: Request, req: SuggestRequest):
    try:
        suggestions = suggest_competitors(req.handle, req.self_archetype, req.bio)
        return {"suggestions": suggestions}
    except Exception:
        return {"suggestions": []}


@app.post("/audit/compare")
def audit_compare(req: CompareRequest, user_id: str = Depends(get_user_id)):
    admin = _is_admin(user_id)
    if not admin:
        balance = get_or_create_balance(user_id)
        if balance <= 0:
            raise HTTPException(status_code=402, detail="No credits remaining. Purchase more to continue.")
    try:
        user_profile = fetch_profile(req.handle)
        time.sleep(2)
        comp_profile = fetch_profile(req.competitor_handle)
        user_data = run_audit(req.handle, req.tier, req.self_archetype, profile_data=user_profile, skip_fetch=True)
        comp_data = run_audit(req.competitor_handle, req.tier, req.self_archetype, profile_data=comp_profile, skip_fetch=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compare failed: {e}")
    if not admin:
        new_balance = deduct_credit(user_id)
        save_audit(user_id, req.handle, req.tier, user_data.model_dump())
    else:
        new_balance = get_or_create_balance(user_id)
        save_audit(user_id, req.handle, req.tier, user_data.model_dump())
    return JSONResponse(
        content=CompareData(user=user_data, competitor=comp_data).model_dump(),
        headers={"X-Credits-Remaining": str(new_balance)},
    )


@app.post("/audit/preview")
def audit_preview(req: AuditRequest, user_id: str = Depends(get_user_id)):
    admin = _is_admin(user_id)
    if not admin:
        balance = get_or_create_balance(user_id)
        if balance <= 0:
            raise HTTPException(status_code=402, detail="No credits remaining. Purchase more to continue.")
    manual_stats = {
        k: v for k, v in {
            "followers": req.manual_followers,
            "following": req.manual_following,
            "posts": req.manual_posts,
            "years": req.manual_years,
        }.items() if v is not None
    }
    try:
        result = run_audit(req.handle, req.tier, req.self_archetype, manual_stats=manual_stats or None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {e}")
    if not admin:
        new_balance = deduct_credit(user_id)
    else:
        new_balance = get_or_create_balance(user_id)
    save_audit(user_id, req.handle, req.tier, result.model_dump())
    return JSONResponse(
        content=result.model_dump(),
        headers={"X-Credits-Remaining": str(new_balance)},
    )


@app.post("/render")
@limiter.limit("10/minute")
def render(request: Request, data: AuditData):
    try:
        docx_buf = build_docx(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {e}")

    handle_clean = data.handle.lstrip("@").replace(" ", "_")
    return StreamingResponse(
        docx_buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{handle_clean}_audit.docx"',
        },
    )


@app.post("/render/pptx")
@limiter.limit("10/minute")
def render_pptx(request: Request, data: AuditData):
    try:
        pptx_buf = build_pptx(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {e}")

    handle_clean = data.handle.lstrip("@").replace(" ", "_")
    return StreamingResponse(
        pptx_buf,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={
            "Content-Disposition": f'attachment; filename="{handle_clean}_audit.pptx"',
        },
    )


