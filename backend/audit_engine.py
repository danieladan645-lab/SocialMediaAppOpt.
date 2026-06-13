import json
import os
from datetime import date
from pathlib import Path

import anthropic
from dotenv import load_dotenv

from instagram_fetcher import fetch_profile
from models import (
    AuditData, ProfileSnapshot, StatCard, BioBlock,
    HighlightRow, ContentBar, PersonaCard, Strength,
    Recommendation, ScoreRow,
)
from skill_blueprint import load_skill

load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

ARCHETYPE_MAP = {
    "course_creator":    ("Course Creator",    "Trust → Conversion → Loyalty"),
    "product_brand":     ("Product Brand",     "Reach → Conversion → Velocity"),
    "service_provider":  ("Service Provider",  "Trust → Loyalty → Revenue Efficiency"),
    "content_monetizer": ("Content Monetizer", "Reach → Velocity → Loyalty"),
    "community_builder": ("Community Builder", "Loyalty → Trust → Reach"),
}

TIER_LABELS = {
    "basic":  "Basic Tier",
    "tier1":  "Tier 1",
    "tier2":  "Tier 2",
}


def _fmt_followers(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


def _build_user_message(handle: str, tier: str, self_archetype: str, profile_data: dict | None = None) -> str:
    archetype_name, stat_priority = ARCHETYPE_MAP.get(
        self_archetype, ("Course Creator", "Trust → Conversion → Loyalty")
    )
    tier_label = TIER_LABELS.get(tier, "Basic Tier")
    today = date.today().strftime("%B %Y")

    if profile_data:
        followers_fmt = _fmt_followers(profile_data["followers"])
        data_block = f"""LIVE PROFILE DATA (fetched automatically — use these exact values):
- Full name: {profile_data["full_name"] or handle}
- Followers: {followers_fmt} ({profile_data["followers"]:,})
- Following: {profile_data["following"]:,}
- Posts: {profile_data["posts"]:,}
- Bio: {profile_data["bio"] or "—"}
- Bio link: {profile_data["external_url"] or "—"}
- Verified: {"Yes" if profile_data["is_verified"] else "No"}

Use the exact follower count above ({followers_fmt}) for the Instagram Followers stat card. Do not estimate or override these values."""
        confidence_note = "Data confidence: 7/10 (live public profile data fetched at audit time — follower count and profile stats are accurate; content analysis is inferred)."
        posts_fmt = _fmt_followers(profile_data["posts"])
        following_fmt = _fmt_followers(profile_data["following"])
        stat_cards_schema = (
            f'"stat_cards": [\n'
            f'    {{"value": "{followers_fmt}", "label": "Instagram Followers"}},\n'
            f'    {{"value": "{posts_fmt}", "label": "Total Posts"}},\n'
            f'    {{"value": "{following_fmt}", "label": "Following"}}\n'
            f'  ],'
        )
    else:
        data_block = (
            "LIVE PROFILE DATA: Could not be fetched (private account or API unavailable). "
            "Estimate where possible; use '—' for metrics you cannot determine with confidence.\n\n"
            "HIGHLIGHT NOTE: Instagram highlight names and cover images cannot be retrieved remotely. "
            "For highlight_rows, do NOT fabricate 'Unknown Highlight' placeholders. Instead, generate "
            "5 highlight structures this brand SHOULD build for their archetype — treat each as a "
            "prescription. Use actionable names (e.g. 'Start Here', 'Testimonials', 'Services'). "
            "Set cover_quality to 'Recommended — not yet verified' and write a prescriptive recommendation."
        )
        confidence_note = "Data confidence: 4/10 (profile data unavailable — all values are estimates)."
        stat_cards_schema = (
            '"stat_cards": [\n'
            '    {"value": "<big number/text>", "label": "<platform> Followers"},\n'
            '    {"value": "<combined number>", "label": "Combined Followers"},\n'
            '    {"value": "<X>+ Years", "label": "Creating Content"}\n'
            '  ],'
        )

    return f"""Audit the Instagram profile {handle} at {tier_label} depth.

{data_block}

ARCHETYPE CONTEXT:
The user self-identifies as a {archetype_name}.
Stat priority for this archetype: {stat_priority}.
Independently classify the correct archetype from the audit data — your classification may differ.
All recommendations must be tagged with which brand stat they improve (Reach / Trust / Conversion / Loyalty / Velocity / Revenue Efficiency).

DATA CONFIDENCE NOTE:
{confidence_note}
For any metric you cannot determine, use "—".
Do NOT use the [OMITTED COMPONENT] escape hatch format in the JSON output — it breaks the renderer.

OUTPUT INSTRUCTION:
Return ONLY a valid JSON object matching this exact schema. No markdown, no prose, no code fences.
All string values must be complete sentences or phrases — no empty strings.

{{
  "handle": "{handle}",
  "display_name": "<real display name>",
  "date": "{today}",
  "tier": "{tier_label}",
  "self_archetype": "{self_archetype}",
  "data_archetype": "<one of: course_creator | product_brand | service_provider | content_monetizer | community_builder>",
  "archetype_gap_note": "<1-2 sentence narrative: if gap exists explain what it costs them; if match confirm and raise the bar>",

  "overall_score": "<X.X / 10>",
  "quick_wins": ["<win1>", "<win2>", "<win3>", "<win4>"],

  "profile_snapshot": {{
    "username": "<@handle>",
    "display_name": "<name>",
    "followers": "<number with commas>",
    "bio_link": "<url or description>",
    "photo_desc": "<1 sentence describing profile photo>",
    "platforms": "<comma-separated platform list>"
  }},

  {stat_cards_schema}

  "bio_blocks": [
    {{"label": "Clarity", "score_str": "<X / 10>", "color_key": "coral", "body": "<2-3 sentence analysis>"}},
    {{"label": "Keywords", "score_str": "<X / 10>", "color_key": "teal", "body": "<2-3 sentence analysis>"}},
    {{"label": "CTA & Emoji Use", "score_str": "<X / 10>", "color_key": "gold", "body": "<2-3 sentence analysis>"}}
  ],

  "grid_bullets": ["<obs1>", "<obs2>", "<obs3>", "<obs4>", "<obs5>"],
  "grid_score": "<X.X / 10>",

  "highlight_rows": [
    {{"name": "<highlight name>", "cover_quality": "<description>", "recommendation": "<action>"}},
    {{"name": "<highlight name>", "cover_quality": "<description>", "recommendation": "<action>"}},
    {{"name": "<highlight name>", "cover_quality": "<description>", "recommendation": "<action>"}},
    {{"name": "<highlight name>", "cover_quality": "<description>", "recommendation": "<action>"}},
    {{"name": "<highlight name>", "cover_quality": "<description>", "recommendation": "<action>"}}
  ],
  "highlight_action": "<priority action sentence>",
  "highlight_score": "<X.X / 10>",

  "content_bars": [
    {{"label": "Reels", "pct": <int>, "color_key": "coral"}},
    {{"label": "Carousel / Tutorial Posts", "pct": <int>, "color_key": "teal"}},
    {{"label": "Static Images", "pct": <int>, "color_key": "gray"}}
  ],
  "content_bullets": ["<obs1>", "<obs2>", "<obs3>", "<obs4>", "<obs5>"],
  "content_score": "<X.X / 10>",

  "personas": [
    {{
      "title": "<Persona Name — Descriptor>",
      "color_key": "coral",
      "name": "<First Name, Age>",
      "location": "<city/region>",
      "goals": "<what they want>",
      "pain_points": "<obstacles>",
      "found_via": "<discovery path>",
      "first_impression": "<what they see first>",
      "needs": "<what profile must deliver>",
      "conversion": "<step-by-step path to purchase>",
      "implication": "<1-2 sentence strategic implication for this brand>"
    }},
    {{
      "title": "<Persona Name — Descriptor>",
      "color_key": "teal",
      "name": "<First Name, Age>",
      "location": "<city/region>",
      "goals": "<what they want>",
      "pain_points": "<obstacles>",
      "found_via": "<discovery path>",
      "first_impression": "<what they see first>",
      "needs": "<what profile must deliver>",
      "conversion": "<step-by-step path to purchase>",
      "implication": "<1-2 sentence strategic implication for this brand>"
    }},
    {{
      "title": "<Persona Name — Descriptor>",
      "color_key": "gold",
      "name": "<First Name, Age>",
      "location": "<city/region>",
      "goals": "<what they want>",
      "pain_points": "<obstacles>",
      "found_via": "<discovery path>",
      "first_impression": "<what they see first>",
      "needs": "<what profile must deliver>",
      "conversion": "<step-by-step path to purchase>",
      "implication": "<1-2 sentence strategic implication for this brand>"
    }}
  ],

  "strengths": [
    {{"title": "<strength title>", "body": "<1-2 sentence elaboration>"}},
    {{"title": "<strength title>", "body": "<1-2 sentence elaboration>"}},
    {{"title": "<strength title>", "body": "<1-2 sentence elaboration>"}},
    {{"title": "<strength title>", "body": "<1-2 sentence elaboration>"}},
    {{"title": "<strength title>", "body": "<1-2 sentence elaboration>"}}
  ],

  "weaknesses": ["<w1>", "<w2>", "<w3>", "<w4>", "<w5>"],
  "opportunities": ["<o1>", "<o2>", "<o3>", "<o4>", "<o5>"],

  "recommendations": [
    {{"priority": "HIGH", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "HIGH", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "HIGH", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "MED", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "MED", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "MED", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "LOW", "action": "<action>", "impact": "<expected result>"}},
    {{"priority": "LOW", "action": "<action>", "impact": "<expected result>"}}
  ],

  "score_rows": [
    {{"category": "Bio & CTA", "score_str": "<X.X / 10>"}},
    {{"category": "Visual Grid", "score_str": "<X.X / 10>"}},
    {{"category": "Highlights", "score_str": "<X.X / 10>"}},
    {{"category": "Content Strategy", "score_str": "<X.X / 10>"}},
    {{"category": "Persona Alignment", "score_str": "<X.X / 10>"}},
    {{"category": "OVERALL", "score_str": "<X.X / 10>"}}
  ]
}}"""


def _clean(obj):
    """Recursively replace any [OMITTED COMPONENT...] strings with '—'."""
    if isinstance(obj, str):
        return "—" if obj.startswith("[OMITTED COMPONENT") else obj
    if isinstance(obj, list):
        return [_clean(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _clean(v) for k, v in obj.items()}
    return obj


def run_audit(handle: str, tier: str, self_archetype: str, profile_data: dict | None = None, *, skip_fetch: bool = False) -> AuditData:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    if not skip_fetch:
        profile_data = fetch_profile(handle)
    system_prompt = load_skill()
    user_message = _build_user_message(handle, tier, self_archetype, profile_data)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text.strip()

    # Strip accidental code fences if Claude wraps the JSON anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    data = _clean(json.loads(raw))
    return AuditData(**data)


def run_teaser_audit(handle: str, self_archetype: str) -> dict:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    archetype_name, stat_priority = ARCHETYPE_MAP.get(
        self_archetype, ("Course Creator", "Trust → Conversion → Loyalty")
    )
    today = date.today().strftime("%B %Y")
    prompt = (
        f"Audit the Instagram profile {handle} ({archetype_name}, stat priority: {stat_priority}) as of {today}.\n"
        f"You cannot access Instagram directly — estimate from what you know about this brand/handle.\n\n"
        f"Return ONLY a valid JSON object. No markdown. No prose.\n"
        f'{{"display_name":"<real name or handle>","overall_score":"<X.X / 10>",'
        f'"data_archetype":"<course_creator|product_brand|service_provider|content_monetizer|community_builder>",'
        f'"archetype_gap_note":"<1 sentence: does the data match the self-ID or not and what it costs them>",'
        f'"quick_wins":["<win1>","<win2>","<win3>"]}}'
    )
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=400,
        system=load_skill(),
        messages=[{"role": "user", "content": prompt}],
    )
    raw = resp.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    return json.loads(raw)


def suggest_competitors(handle: str, archetype_key: str, bio: str) -> list[str]:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    archetype_name = ARCHETYPE_MAP.get(archetype_key, ("Course Creator", ""))[0]
    prompt = (
        f"You are a social media analyst. Name 3 direct Instagram competitor accounts for this profile.\n"
        f"Handle: @{handle} | Archetype: {archetype_name} | Bio: {bio}\n"
        f'Return ONLY a JSON array of 3 handles (no @): ["handle1","handle2","handle3"]. Nothing else.'
    )
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=80,
        messages=[{"role": "user", "content": prompt}],
    )
    handles = json.loads(resp.content[0].text.strip())
    return [h for h in handles if fetch_profile(h) is not None]
