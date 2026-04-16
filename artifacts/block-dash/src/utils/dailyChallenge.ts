import type { DailyChallenge } from './types';

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─── Deterministic challenge generation ──────────────────────────────────────

const SCORE_TARGETS  = [500, 800, 1200, 1600, 2000, 2500, 3000] as const;
const LINES_TARGETS  = [3,   5,   8,    10,   12,   15,   20  ] as const;
const PIECES_TARGETS = [10,  15,  20,   25,   30,   40,   50  ] as const;

const LABELS: Record<DailyChallenge['type'], (target: number) => string> = {
  score:  (t) => `Score ${t.toLocaleString()} points`,
  lines:  (t) => `Clear ${t} lines`,
  pieces: (t) => `Place ${t} pieces`,
};

/**
 * Generates today's challenge deterministically from the date string.
 * Everyone sees the same challenge on the same day.
 */
export function generateChallenge(dateKey: string): DailyChallenge {
  const [y, m, d] = dateKey.split('-').map(Number);
  const seed = y * 10000 + m * 100 + d;

  const types = ['score', 'lines', 'pieces'] as const;
  const type  = types[seed % 3];
  const diffIdx = Math.floor(seed / 3) % 7;

  const targetMap = {
    score:  SCORE_TARGETS[diffIdx],
    lines:  LINES_TARGETS[diffIdx],
    pieces: PIECES_TARGETS[diffIdx],
  } as const;

  const target = targetMap[type];

  return {
    dateKey,
    type,
    target,
    label:        LABELS[type](target),
    bestProgress: 0,
    completed:    false,
  };
}
