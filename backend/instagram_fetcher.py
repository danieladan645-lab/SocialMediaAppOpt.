import os
import requests


_HEADERS = {
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


def fetch_profile(handle: str) -> dict | None:
    """
    Fetch public Instagram profile stats via Instagram's web profile API.
    Returns None if the profile is private, doesn't exist, or the request fails.
    """
    username = handle.lstrip("@").strip()
    url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}"
    headers = dict(_HEADERS)
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
        return {
            "followers": user["edge_followed_by"]["count"],
            "following": user["edge_follow"]["count"],
            "posts": user["edge_owner_to_timeline_media"]["count"],
            "full_name": user.get("full_name") or "",
            "bio": user.get("biography") or "",
            "external_url": user.get("external_url") or "",
            "is_verified": user.get("is_verified", False),
            "is_private": user.get("is_private", False),
        }
    except Exception:
        return None
