import { useCallback, useEffect, useState } from "react";
import { readJSON, writeJSON } from "@/lib/storage";

const KEY = "conceptdrop:progress:v1";

export type CompletedEntry = {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  at: number;
  confidence?: number;
  struggle?: string;
};

export type Progress = {
  attempted: number;
  completed: CompletedEntry[];
  recentIds: string[];
  learningMinutes: number;
  explainMinutes: number;
  streak: number;
  longestStreak: number;
  lastDay: string | null;
  soundOn: boolean;
};

const empty: Progress = {
  attempted: 0,
  completed: [],
  recentIds: [],
  learningMinutes: 0,
  explainMinutes: 0,
  streak: 0,
  longestStreak: 0,
  lastDay: null,
  soundOn: false,
};

// Local calendar date (not UTC, not rolling 24h).
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
};

/** Current streak as of today: 0 if a calendar day was missed. */
export function liveStreak(p: Progress) {
  return p.lastDay === dayKey() || p.lastDay === yesterdayKey() ? p.streak : 0;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(empty);

  useEffect(() => {
    setProgress({ ...empty, ...readJSON<Progress>(KEY, empty) });
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      writeJSON(KEY, next);
      return next;
    });
  }, []);

  const markAttempt = useCallback(
    (id: string) =>
      update((p) => ({
        ...p,
        attempted: p.attempted + 1,
        recentIds: [id, ...p.recentIds.filter((x) => x !== id)].slice(0, 25),
      })),
    [update],
  );

  const markComplete = useCallback(
    (entry: Omit<CompletedEntry, "at">, learningMs: number, explainMs: number) =>
      update((p) => {
        const today = dayKey();
        const yesterday = yesterdayKey();
        const streak =
          p.lastDay === today ? p.streak : p.lastDay === yesterday ? p.streak + 1 : 1;
        return {
          ...p,
          completed: [{ ...entry, at: Date.now() }, ...p.completed].slice(0, 200),
          learningMinutes: p.learningMinutes + Math.round(learningMs / 60000),
          explainMinutes: p.explainMinutes + Math.round(explainMs / 60000),
          streak,
          longestStreak: Math.max(p.longestStreak ?? 0, streak),
          lastDay: today,
        };
      }),
    [update],
  );

  const annotateLatest = useCallback(
    (patch: Partial<CompletedEntry>) =>
      update((p) => ({
        ...p,
        completed: p.completed.map((c, i) => (i === 0 ? { ...c, ...patch } : c)),
      })),
    [update],
  );

  const toggleSound = useCallback(
    () => update((p) => ({ ...p, soundOn: !p.soundOn })),
    [update],
  );

  return { progress, markAttempt, markComplete, annotateLatest, toggleSound };
}

export function readRecentIds(): string[] {
  return readJSON<Progress>(KEY, empty).recentIds ?? [];
}
