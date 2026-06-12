import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

_client = None


def _db():
    global _client
    if _client is None:
        from supabase import create_client
        _client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
    return _client


def get_or_create_balance(user_id: str) -> int:
    result = _db().table("credits").select("balance").eq("user_id", user_id).execute()
    if result.data:
        return result.data[0]["balance"]
    _db().table("credits").insert({"user_id": user_id, "balance": 1}).execute()
    return 1


def deduct_credit(user_id: str) -> int:
    try:
        result = _db().table("credits").select("balance").eq("user_id", user_id).single().execute()
        current = result.data["balance"] if result.data else 0
        new_bal = max(0, current - 1)
        _db().table("credits").update({"balance": new_bal}).eq("user_id", user_id).execute()
        return new_bal
    except Exception:
        return 0


def add_credits(user_id: str, amount: int) -> int:
    try:
        result = _db().table("credits").select("balance").eq("user_id", user_id).single().execute()
        current = result.data["balance"] if result.data else 0
        new_bal = current + amount
        _db().table("credits").update({"balance": new_bal}).eq("user_id", user_id).execute()
        return new_bal
    except Exception:
        _db().table("credits").insert({"user_id": user_id, "balance": amount}).execute()
        return amount


def save_audit(user_id: str, handle: str, tier: str, result: dict) -> None:
    try:
        _db().table("audits").insert({
            "user_id": user_id,
            "handle": handle,
            "tier": tier,
            "result": result,
        }).execute()
    except Exception:
        pass
