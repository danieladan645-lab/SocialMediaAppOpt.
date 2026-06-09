export interface AuditRequest {
  handle: string;
  self_archetype: string;
}

export interface ProfileSnapshot {
  username: string;
  display_name: string;
  followers: string;
  bio_link: string;
  photo_desc: string;
  platforms: string;
}

export interface StatCard {
  value: string;
  label: string;
}

export interface BioBlock {
  label: string;
  score_str: string;
  color_key: string;
  body: string;
}

export interface HighlightRow {
  name: string;
  cover_quality: string;
  recommendation: string;
}

export interface ContentBar {
  label: string;
  pct: number;
  color_key: string;
}

export interface PersonaCard {
  title: string;
  color_key: string;
  name: string;
  location: string;
  goals: string;
  pain_points: string;
  found_via: string;
  first_impression: string;
  needs: string;
  conversion: string;
  implication: string;
}

export interface Strength {
  title: string;
  body: string;
}

export interface Recommendation {
  priority: string;
  action: string;
  impact: string;
}

export interface ScoreRow {
  category: string;
  score_str: string;
}

export interface AuditData {
  handle: string;
  display_name: string;
  date: string;
  tier: string;
  self_archetype: string;
  data_archetype: string;
  archetype_gap_note: string;
  overall_score: string;
  quick_wins: string[];
  profile_snapshot: ProfileSnapshot;
  stat_cards: StatCard[];
  bio_blocks: BioBlock[];
  grid_bullets: string[];
  grid_score: string;
  highlight_rows: HighlightRow[];
  highlight_action: string;
  highlight_score: string;
  content_bars: ContentBar[];
  content_bullets: string[];
  content_score: string;
  personas: PersonaCard[];
  strengths: Strength[];
  weaknesses: string[];
  opportunities: string[];
  recommendations: Recommendation[];
  score_rows: ScoreRow[];
}

export interface ProfileStats {
  followers: number;
  following: number;
  posts: number;
  full_name: string;
  bio: string;
  external_url: string;
  is_verified: boolean;
  is_private: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function authHeaders(token?: string): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function runAuditPreview(req: AuditRequest, token?: string): Promise<AuditData> {
  const res = await fetch(`${API_BASE}/audit/preview`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Audit failed (${res.status})`);
  }
  return res.json();
}

export async function downloadAuditDocx(data: AuditData): Promise<void> {
  const res = await fetch(`${API_BASE}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.handle.replace("@", "")}_audit.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAuditPptx(data: AuditData): Promise<void> {
  const res = await fetch(`${API_BASE}/render/pptx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.handle.replace("@", "")}_audit.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface CompareData {
  user: AuditData;
  competitor: AuditData;
}

export async function runCompareAudit(
  req: { handle: string; competitor_handle: string; self_archetype: string },
  token?: string
): Promise<CompareData> {
  const res = await fetch(`${API_BASE}/audit/compare`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ ...req, tier: "basic" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Compare failed (${res.status})`);
  }
  return res.json();
}

export async function createCheckout(pack: string, token: string): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/stripe/create-checkout`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ pack }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Checkout failed (${res.status})`);
  }
  return res.json();
}

export async function suggestCompetitors(data: AuditData): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/audit/suggest-competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: data.handle,
        self_archetype: data.self_archetype,
        bio: data.profile_snapshot.bio_link ?? "",
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.suggestions as string[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchStats(handle: string): Promise<ProfileStats> {
  const username = handle.replace(/^@/, "");
  const res = await fetch(`${API_BASE}/stats/${encodeURIComponent(username)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Fetch failed (${res.status})`);
  }
  return res.json();
}
