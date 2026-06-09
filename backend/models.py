from pydantic import BaseModel


class ProfileSnapshot(BaseModel):
    username: str
    display_name: str
    followers: str
    bio_link: str
    photo_desc: str
    platforms: str


class StatCard(BaseModel):
    value: str   # e.g. "378K"
    label: str   # e.g. "Instagram Followers"


class BioBlock(BaseModel):
    label: str        # e.g. "Clarity"
    score_str: str    # e.g. "8 / 10"
    color_key: str    # "coral" | "teal" | "gold"
    body: str


class HighlightRow(BaseModel):
    name: str
    cover_quality: str
    recommendation: str


class ContentBar(BaseModel):
    label: str
    pct: int          # 0–100
    color_key: str    # "coral" | "teal" | "gray"


class PersonaCard(BaseModel):
    title: str            # e.g. "Mia — Teen Aspiring Artist"
    color_key: str        # "coral" | "teal" | "gold"
    name: str             # e.g. "Mia, 16"
    location: str
    goals: str
    pain_points: str
    found_via: str
    first_impression: str
    needs: str
    conversion: str
    implication: str


class Strength(BaseModel):
    title: str
    body: str


class Recommendation(BaseModel):
    priority: str   # "HIGH" | "MED" | "LOW"
    action: str
    impact: str


class ScoreRow(BaseModel):
    category: str
    score_str: str  # e.g. "7.5 / 10"


class AuditData(BaseModel):
    handle: str
    display_name: str
    date: str
    tier: str
    self_archetype: str       # user-selected archetype key e.g. "course_creator"
    data_archetype: str       # Claude-classified archetype key
    archetype_gap_note: str   # narrative sentence about the gap or match

    overall_score: str        # e.g. "8.2 / 10"
    quick_wins: list[str]

    profile_snapshot: ProfileSnapshot
    stat_cards: list[StatCard]        # exactly 3

    bio_blocks: list[BioBlock]        # exactly 3

    grid_bullets: list[str]           # 4–6 observations
    grid_score: str

    highlight_rows: list[HighlightRow]
    highlight_action: str
    highlight_score: str

    content_bars: list[ContentBar]    # 3 content type bars
    content_bullets: list[str]        # 4–6 observations
    content_score: str

    personas: list[PersonaCard]       # 2–3 personas

    strengths: list[Strength]         # 5 strengths
    weaknesses: list[str]             # 5 weaknesses
    opportunities: list[str]          # 5 opportunities

    recommendations: list[Recommendation]

    score_rows: list[ScoreRow]        # category rows + OVERALL last


class CompareData(BaseModel):
    user: AuditData
    competitor: AuditData
