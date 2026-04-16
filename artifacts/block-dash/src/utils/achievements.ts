import type { AchievementDef } from './types';

/**
 * All achievements in the game. Each has a pure `check` function
 * that receives cumulative stats + current game stats and returns
 * whether the achievement should be unlocked.
 */
export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // ─── Bronze (easy / early game) ─────────────────────────────────────────────
  {
    id: 'first_clear',
    icon: 'minus',
    title: 'First Clear',
    description: 'Clear your first line',
    tier: 'bronze',
    check: (ctx) => ctx.totalLines >= 1,
  },
  {
    id: 'score_500',
    icon: 'star',
    title: 'Getting Started',
    description: 'Score 500 points in a single game',
    tier: 'bronze',
    check: (ctx) => ctx.score >= 500,
  },
  {
    id: 'place_50',
    icon: 'grid',
    title: 'Block Builder',
    description: 'Place 50 pieces total',
    tier: 'bronze',
    check: (ctx) => ctx.piecesPlaced >= 50 || ctx.gamesPlayed >= 3,
  },
  {
    id: 'combo_2',
    icon: 'zap',
    title: 'Double Trouble',
    description: 'Reach a 2x combo',
    tier: 'bronze',
    check: (ctx) => ctx.maxCombo >= 2 || ctx.bestCombo >= 2,
  },

  // ─── Silver (medium / intermediate) ─────────────────────────────────────────
  {
    id: 'score_2000',
    icon: 'award',
    title: 'Rising Star',
    description: 'Score 2,000 points in a single game',
    tier: 'silver',
    check: (ctx) => ctx.score >= 2000,
  },
  {
    id: 'lines_50',
    icon: 'layers',
    title: 'Line Sweeper',
    description: 'Clear 50 lines total',
    tier: 'silver',
    check: (ctx) => ctx.totalLines >= 50,
  },
  {
    id: 'combo_4',
    icon: 'zap',
    title: 'Combo Master',
    description: 'Reach a 4x combo',
    tier: 'silver',
    check: (ctx) => ctx.maxCombo >= 4 || ctx.bestCombo >= 4,
  },
  {
    id: 'level_5',
    icon: 'trending-up',
    title: 'Halfway There',
    description: 'Reach level 5',
    tier: 'silver',
    check: (ctx) => ctx.level >= 5,
  },
  {
    id: 'streak_3',
    icon: 'calendar',
    title: 'Dedicated',
    description: 'Maintain a 3-day streak',
    tier: 'silver',
    check: (ctx) => ctx.currentStreak >= 3,
  },
  {
    id: 'games_10',
    icon: 'repeat',
    title: 'Regular Player',
    description: 'Play 10 games',
    tier: 'silver',
    check: (ctx) => ctx.gamesPlayed >= 10,
  },

  // ─── Gold (hard / late game) ────────────────────────────────────────────────
  {
    id: 'score_5000',
    icon: 'star',
    title: 'Block Legend',
    description: 'Score 5,000 points in a single game',
    tier: 'gold',
    check: (ctx) => ctx.score >= 5000,
  },
  {
    id: 'lines_200',
    icon: 'layers',
    title: 'Line Destroyer',
    description: 'Clear 200 lines total',
    tier: 'gold',
    check: (ctx) => ctx.totalLines >= 200,
  },
  {
    id: 'level_10',
    icon: 'shield',
    title: 'Max Level',
    description: 'Reach level 10',
    tier: 'gold',
    check: (ctx) => ctx.level >= 10,
  },
  {
    id: 'streak_7',
    icon: 'calendar',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    tier: 'gold',
    check: (ctx) => ctx.currentStreak >= 7,
  },
  {
    id: 'games_50',
    icon: 'repeat',
    title: 'Veteran',
    description: 'Play 50 games',
    tier: 'gold',
    check: (ctx) => ctx.gamesPlayed >= 50,
  },
];

export const TIER_COLORS = {
  bronze: { bg: 'rgba(205,127,50,0.15)', border: 'rgba(205,127,50,0.35)', text: '#CD7F32' },
  silver: { bg: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.35)', text: '#C0C0C0' },
  gold:   { bg: 'rgba(255,215,0,0.15)',   border: 'rgba(255,215,0,0.35)',   text: '#FFD700' },
} as const;
