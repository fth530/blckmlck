import type { PieceColor } from './types';

export const BOARD_SIZE = 10;
export const CELL_SIZE = 32;
export const PIECE_PREVIEW_SCALE = 0.65;

export const COLORS = {
  // Background & Board
  background: '#0d0d1a',
  boardBg: '#1a1a2e',
  cellBorder: '#252545',
  cellEmpty: '#1e1e38',

  // UI Elements
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  accent: '#00CEC9',
  text: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#8888aa',

  // Score / Modal
  surface: 'rgba(26,26,60,0.95)',
  overlay: 'rgba(0,0,0,0.7)',
  modalBg: 'rgba(20,20,50,0.97)',

  // Status
  validGhost: 'rgba(46,213,115,0.4)',
  invalidGhost: 'rgba(255,107,107,0.4)',
  validBorder: '#2ED573',
  invalidBorder: '#FF6B6B',
} as const;

export const PIECE_COLORS: PieceColor[] = [
  { main: '#FF6B6B', gradient: ['#FF6B6B', '#EE5A24'], name: 'red' },
  { main: '#4ECDC4', gradient: ['#4ECDC4', '#2C9B7B'], name: 'cyan' },
  { main: '#A55EEA', gradient: ['#A55EEA', '#8854D0'], name: 'purple' },
  { main: '#FF9F43', gradient: ['#FF9F43', '#E55D2B'], name: 'orange' },
  { main: '#2ED573', gradient: ['#2ED573', '#009432'], name: 'green' },
  { main: '#FFDD59', gradient: ['#FFDD59', '#FFC312'], name: 'yellow' },
  { main: '#FF6B81', gradient: ['#FF6B81', '#EB3B5A'], name: 'pink' },
  { main: '#18DCFF', gradient: ['#18DCFF', '#0097A7'], name: 'blue' },
];

/**
 * Okabe-Ito colorblind-safe palette (deuteranopia / protanopia / tritanopia).
 * Indices mirror PIECE_COLORS so colorIndex maps directly.
 */
export const COLORBLIND_PALETTE: PieceColor[] = [
  { main: '#0072B2', gradient: ['#0072B2', '#005A8E'], name: 'red' },
  { main: '#E69F00', gradient: ['#E69F00', '#B87C00'], name: 'cyan' },
  { main: '#56B4E9', gradient: ['#56B4E9', '#2F8FBF'], name: 'purple' },
  { main: '#D55E00', gradient: ['#D55E00', '#A84900'], name: 'orange' },
  { main: '#009E73', gradient: ['#009E73', '#007754'], name: 'green' },
  { main: '#F0E442', gradient: ['#F0E442', '#C8BC0D'], name: 'yellow' },
  { main: '#CC79A7', gradient: ['#CC79A7', '#AA5A88'], name: 'pink' },
  { main: '#999999', gradient: ['#999999', '#777777'], name: 'blue' },
] as const;

/** Unique pattern symbol per piece type — secondary distinguisher in colorblind mode. */
export const PIECE_PATTERNS = ['+', '—', '|', '/', '●', '◆', '▲', '★'] as const;

/**
 * Lookup by PieceColor.name → { color, pattern }.
 * Used in GameBoard and BlockPiece to resolve the CB equivalent at render time.
 */
export const CB_COLOR_BY_NAME: Record<string, { color: PieceColor; pattern: string }> =
  PIECE_COLORS.reduce(
    (acc, c, i) => {
      acc[c.name] = { color: COLORBLIND_PALETTE[i] as PieceColor, pattern: PIECE_PATTERNS[i] };
      return acc;
    },
    {} as Record<string, { color: PieceColor; pattern: string }>,
  );

export const SCORING = {
  PER_BLOCK: 10,
  SINGLE_LINE: 100,
  EXTRA_LINE_BONUS: 200,
  COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 3.5, 4],
} as const;

export const ANIMATION_CONFIG = {
  DRAG_SPRING: { tension: 180, friction: 9 },
  SCALE_UP_SPRING: { tension: 300, friction: 7 },
  SCALE_RESET_SPRING: { tension: 220, friction: 10 },
  SCORE_BUMP: { toValue: 1.15, duration: 120 },
  // Board "thud" when a piece lands
  BOARD_LAND: { tension: 350, friction: 6 },
  // Board shake timing for line clears
  BOARD_SHAKE_MS: 35,
  // Tray piece idle breathing
  BREATHE_MS: 1200,
  BREATHE_SCALE: 1.04,
  // Ghost cell pulse
  GHOST_PULSE_MS: 500,
} as const;

export const TRAY_CELL_SIZE = 30;
export const SAVE_DEBOUNCE_MS = 2000;
