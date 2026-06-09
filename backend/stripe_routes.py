import json
import os
from pathlib import Path

import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import get_user_id
from db import add_credits

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

router = APIRouter()

PACKS = {
    "1":  {"audits": 1,  "price_cents": 900,  "name": "1 Audit"},
    "5":  {"audits": 5,  "price_cents": 3500, "name": "5 Audits"},
    "10": {"audits": 10, "price_cents": 6000, "name": "10 Audits"},
}


class CheckoutRequest(BaseModel):
    pack: str


@router.post("/stripe/create-checkout")
def create_checkout(req: CheckoutRequest, user_id: str = Depends(get_user_id)):
    if req.pack not in PACKS:
        raise HTTPException(status_code=400, detail="Invalid pack")
    p = PACKS[req.pack]
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": f"Brand Audit — {p['name']}"},
                "unit_amount": p["price_cents"],
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=f"{FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=FRONTEND_URL,
        metadata={"user_id": user_id, "audits": str(p["audits"])},
    )
    return {"url": session.url}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    if secret:
        try:
            event = stripe.Webhook.construct_event(payload, sig, secret)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        event = json.loads(payload)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        uid = session["metadata"]["user_id"]
        audits = int(session["metadata"]["audits"])
        add_credits(uid, audits)

    return {"status": "ok"}
