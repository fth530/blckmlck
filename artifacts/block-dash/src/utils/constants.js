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
  textMuted: '#606080',

  // Score / Modal
  surface: 'rgba(26,26,60,0.95)',
  overlay: 'rgba(0,0,0,0.7)',
  modalBg: 'rgba(20,20,50,0.97)',

  // Status
  validGhost: 'rgba(46,213,115,0.4)',
  invalidGhost: 'rgba(255,107,107,0.4)',
  validBorder: '#2ED573',
  invalidBorder: '#FF6B6B',
};

export const PIECE_COLORS = [
  { main: '#FF6B6B', gradient: ['#FF6B6B', '#EE5A24'], name: 'red' },
  { main: '#4ECDC4', gradient: ['#4ECDC4', '#2C9B7B'], name: 'cyan' },
  { main: '#A55EEA', gradient: ['#A55EEA', '#8854D0'], name: 'purple' },
  { main: '#FF9F43', gradient: ['#FF9F43', '#E55D2B'], name: 'orange' },
  { main: '#2ED573', gradient: ['#2ED573', '#009432'], name: 'green' },
  { main: '#FFDD59', gradient: ['#FFDD59', '#FFC312'], name: 'yellow' },
  { main: '#FF6B81', gradient: ['#FF6B81', '#EB3B5A'], name: 'pink' },
  { main: '#18DCFF', gradient: ['#18DCFF', '#0097A7'], name: 'blue' },
];

export const SCORING = {
  PER_BLOCK: 10,
  SINGLE_LINE: 100,
  EXTRA_LINE_BONUS: 200,
  COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 3.5, 4],
};
