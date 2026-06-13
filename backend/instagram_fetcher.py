import os
import requests


_DIRECT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "X-IG-App-ID": "936619743392459",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.instagram.com/",
    "Origin": "https://www.instagram.com",
}

_RAPIDAPI_HOST = "instagram-scraper-ai1.p.rapidapi.com"


def _parse_user(user: dict) -> dict:
    # Handle both flat format (follower_count) and nested format (edge_followed_by.count)
    followers = (
        user.get("follower_count")
        or (user.get("edge_followed_by") or {}).get("count")
        or 0
    )
    following = (
        user.get("following_count")
        or (user.get("edge_follow") or {}).get("count")
        or 0
    )
    posts = (
        user.get("media_count")
        or (user.get("edge_owner_to_timeline_media") or {}).get("count")
        or 0
    )
    return {
        "followers": followers,
        "following": following,
        "posts": posts,
        "full_name": user.get("full_name") or "",
        "bio": user.get("biography") or user.get("bio") or "",
        "external_url": user.get("external_url") or "",
        "is_verified": user.get("is_verified", False),
        "is_private": user.get("is_private", False),
    }


def _fetch_via_rapidapi_raw(username: str) -> dict:
    """Returns raw API response for debugging. Never raises."""
    api_key = os.getenv("RAPIDAPI_KEY")
    if not api_key:
        return {"error": "RAPIDAPI_KEY not set"}
    try:
        url = f"https://{_RAPIDAPI_HOST}/user/info_v2/?username={username}"
        r = requests.get(url, headers={
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": _RAPIDAPI_HOST,
        }, timeout=10)
        return {"status": r.status_code, "body": r.json()}
    except Exception as e:
        return {"error": str(e)}


def _fetch_via_rapidapi(username: str) -> dict | None:
    api_key = os.getenv("RAPIDAPI_KEY")
    if not api_key:
        return None
    try:
        url = f"https://{_RAPIDAPI_HOST}/user/info_v2/?username={username}"
        r = requests.get(url, headers={
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": _RAPIDAPI_HOST,
        }, timeout=10)
        if r.status_code != 200:
            return None
        payload = r.json()
        # Try nested then flat response structures
        user = (
            payload.get("data", {}).get("user")
            or payload.get("data")
            or payload.get("user")
            or payload
        )
        if not user or not isinstance(user, dict):
            return None
        return _parse_user(user)
    except Exception:
        return None


def _fetch_direct(username: str) -> dict | None:
    url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}"
    headers = dict(_DIRECT_HEADERS)
    session_id = os.getenv("INSTAGRAM_SESSION_ID")
    if session_id:
        headers["Cookie"] = f"sessionid={session_id}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            return None
        user = r.json()["data"]["user"]
        if not user:
            return None
        return _parse_user(user)
    except Exception:
        return None


def fetch_profile(handle: str) -> dict | None:
    username = handle.lstrip("@").strip()
    result = _fetch_via_rapidapi(username)
    if result is not None:
        return result
    return _fetch_direct(username)
