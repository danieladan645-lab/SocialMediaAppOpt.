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
        result = _db().rpc("deduct_credit_atomic", {"p_user_id": user_id}).execute()
        return result.data if isinstance(result.data, int) else 0
    except Exception:
        return 0


def add_credits(user_id: str, amount: int) -> int:
    try:
        result = _db().rpc("add_credits_atomic", {"p_user_id": user_id, "p_amount": amount}).execute()
        return result.data if isinstance(result.data, int) else amount
    except Exception:
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
