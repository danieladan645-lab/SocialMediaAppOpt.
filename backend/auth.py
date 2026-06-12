import os
from typing import Optional

import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient

_jwks: PyJWKClient | None = None

CLERK_ISSUER = os.getenv("CLERK_ISSUER", "https://simple-jennet-60.clerk.accounts.dev")


def _get_jwks() -> PyJWKClient:
    global _jwks
    if _jwks is None:
        _jwks = PyJWKClient(f"{CLERK_ISSUER}/.well-known/jwks.json")
    return _jwks


def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization[7:]
    try:
        client = _get_jwks()
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, signing_key.key, algorithms=["RS256"], leeway=60)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing sub claim")
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {e}")
