import os
import time

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

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

app = FastAPI(title="Brand Audit Engine", version="0.1.0")

app.include_router(stripe_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Credits-Remaining"],
)


class AuditRequest(BaseModel):
    handle: str
    tier: str = "basic"
    self_archetype: str = "course_creator"


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
def profile_stats(handle: str):
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
def audit_teaser_endpoint(req: AuditRequest):
    try:
        result = run_teaser_audit(req.handle, req.self_archetype)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Teaser failed: {e}")
    return JSONResponse(content=result)


@app.post("/audit/suggest-competitors")
def suggest_competitors_endpoint(req: SuggestRequest):
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
    try:
        result = run_audit(req.handle, req.tier, req.self_archetype)
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
def render(data: AuditData):
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
def render_pptx(data: AuditData):
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


@app.post("/audit")
def audit(req: AuditRequest):
    try:
        audit_data = run_audit(req.handle, req.tier, req.self_archetype)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {e}")

    try:
        docx_buf = build_docx(audit_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {e}")

    handle_clean = req.handle.lstrip("@").replace(" ", "_")
    return StreamingResponse(
        docx_buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{handle_clean}_audit.docx"',
            "X-Data-Archetype": audit_data.data_archetype,
            "X-Self-Archetype": audit_data.self_archetype,
            "X-Overall-Score": audit_data.overall_score,
        },
    )
