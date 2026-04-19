export interface PieceShape extends Array<Array<0 | 1>> {}

export interface PieceColor {
  main: string;
  gradient: string[];
  name: string;
}

export interface PieceBase {
  id: string;
  shape: PieceShape;
  colorIndex: number;
}

export interface Piece extends PieceBase {
  color: PieceColor;
  instanceId: string;
}

export type Cell = PieceColor | null;
export type Board = Cell[][];

export interface Position {
  row: number;
  col: number;
}

export interface CompletedLines {
  completedRows: number[];
  completedCols: number[];
}

export interface GhostCell extends Position {
  valid: boolean;
}

export interface GhostCellsResult {
  cells: GhostCell[];
  valid: boolean;
}

export interface Stats {
  gamesPlayed: number;
  bestCombo: number;
  totalLines: number;
  highScore: number;
}

export interface DailyChallenge {
  dateKey: string;           // 'YYYY-MM-DD'
  type: 'score' | 'lines' | 'pieces';
  target: number;
  label: string;
  bestProgress: number;      // best single-game result today
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;    // 'YYYY-MM-DD' or ''
}

export type AchievementId = string;

export interface AchievementDef {
  id: AchievementId;
  icon: string;               // Feather icon name
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold';
  check: (ctx: AchievementCheckContext) => boolean;
}

export interface AchievementCheckContext {
  score: number;
  highScore: number;
  linesCleared: number;
  maxCombo: number;
  piecesPlaced: number;
  level: number;
  gamesPlayed: number;
  totalLines: number;
  bestCombo: number;
  currentStreak: number;
}

export interface UnlockedAchievement {
  id: AchievementId;
  unlockedAt: string;          // ISO date
}

export interface GameHistoryEntry {
  score: number;
  linesCleared: number;
  maxCombo: number;
  piecesPlaced: number;
  level: number;
  mode: GameMode;
  date: string;            // ISO date string
}

export type GameMode = 'classic' | 'zen' | 'timed';

export type PowerUpType = 'bomb' | 'sweep' | 'eraser';

export interface PowerUps {
  bomb: number;
  sweep: number;
  eraser: number;
}

export type ThemeId = string;

export interface BoardTheme {
  id: ThemeId;
  name: string;
  price: number;             // 0 = free
  bgGradient: [string, string, string];
  boardBg: string;
  cellBorder: string;
  cellEmpty: string;
  accent: string;
  accentLight: string;
  trayBg: string;
}

export type Language = 'en' | 'tr';

export interface Settings {
  haptics: boolean;
  sounds: boolean;
  colorblind: boolean;
  reducedMotion: boolean;
  activeTheme: ThemeId;
  language: Language;
}

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "selection";
