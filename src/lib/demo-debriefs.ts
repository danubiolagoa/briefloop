export interface DemoDebriefRecord {
  id: string;
  source: "local";
  created_at: string;
  campaign_name: string;
  channel: string;
  objective: string;
  audience: string | null;
  budget_range: string | null;
  metrics: Record<string, number> | null;
  what_worked: string;
  what_failed: string;
  learnings: string | null;
  generated_summary: string | null;
}

const STORAGE_KEY = "briefloop.demo.debriefs";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getDemoDebriefs(): DemoDebriefRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDemoDebriefById(id: string) {
  return getDemoDebriefs().find((item) => item.id === id) ?? null;
}

export function saveDemoDebrief(record: Omit<DemoDebriefRecord, "source">) {
  if (!canUseStorage()) {
    return;
  }

  const existing = getDemoDebriefs().filter((item) => item.id !== record.id);
  const next = [{ ...record, source: "local" as const }, ...existing].slice(0, 25);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
