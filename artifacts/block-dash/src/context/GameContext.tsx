import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Board, Piece, PowerUpType, PowerUps, GameMode } from '../utils/types';
import {
  createEmptyBoard,
  canPlacePiece,
  placePiece,
  findCompletedLines,
  clearLines,
  calculateScore,
  countPieceBlocks,
  canAnyPieceFit,
  getLevel,
  applyBomb,
  applySweep,
  applyEraser,
  rotateShape,
} from '../utils/gameHelpers';
import { getThreeRandomPieces, getSmartPieces } from '../utils/pieces';
import { BOARD_SIZE } from '../utils/constants';
import { updateStats, saveGame, clearSavedGame, addGameToHistory, addCoins } from '../utils/storage';
import type { GameHistoryEntry } from '../utils/types';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Snapshot stored for undo — no nested undo to avoid deep chains */
export type GameSnapshot = Omit<GameState, 'previousState'>;

export interface GameState {
  board: Board;
  pieces: (Piece | null)[];
  score: number;
  highScore: number;
  comboCount: number;
  maxCombo: number;
  linesCleared: number;
  piecesPlaced: number;
  powerUps: PowerUps;
  powerUpCharge: number;
  mode: GameMode;
  isGameOver: boolean;
  isNewHighScore: boolean;
  lastClearedLines: {
    rows: number[];
    cols: number[];
    /** Cell colors captured BEFORE the board is cleared — used by LineClearEffect */
    cells: { row: number; col: number; gradient: string[] }[];
  } | null;
  lastScore: number;
  /** One-level undo snapshot. Null when no move has been made yet. */
  previousState: GameSnapshot | null;
}

type GameAction =
  | { type: 'INIT'; highScore?: number; mode?: GameMode }
  | { type: 'LOAD_GAME'; gameState: Partial<GameState> }
  | { type: 'SET_HIGH_SCORE'; highScore: number }
  | { type: 'PLACE_PIECE'; pieceIndex: number; row: number; col: number }
  | { type: 'USE_POWER_UP'; powerUp: PowerUpType; row: number; col: number }
  | { type: 'ROTATE_PIECE'; pieceIndex: number }
  | { type: 'TIME_UP' }
  | { type: 'UNDO' }
  | { type: 'CLEAR_LAST_LINES' }
  | { type: 'GAME_OVER_CONFIRMED' };

interface GameContextValue {
  state: GameState;
  level: number;
  canUndo: boolean;
  initGame: (highScore: number, mode?: GameMode) => void;
  loadGame: (gameState: Partial<GameState>) => void;
  setHighScore: (highScore: number) => void;
  placePieceAction: (pieceIndex: number, row: number, col: number) => Promise<void>;
  usePowerUp: (powerUp: PowerUpType, row: number, col: number) => void;
  rotatePiece: (pieceIndex: number) => void;
  timeUp: () => void;
  undo: () => void;
  confirmGameOver: (finalState: GameState) => Promise<void>;
  clearLastLines: () => void;
  saveCurrentGame: (currentState: GameState) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const GameContext = createContext<GameContextValue | null>(null);

const EMPTY_POWER_UPS: PowerUps = { bomb: 0, sweep: 0, eraser: 0 };
const POWER_UP_CHARGE_COST = 5;
const POWER_UP_MAX = 3;

const initialState: GameState = {
  board: createEmptyBoard(),
  pieces: getThreeRandomPieces(),
  score: 0,
  highScore: 0,
  comboCount: 0,
  maxCombo: 0,
  linesCleared: 0,
  piecesPlaced: 0,
  powerUps: { ...EMPTY_POWER_UPS },
  powerUpCharge: 0,
  mode: 'classic' as GameMode,
  isGameOver: false,
  isNewHighScore: false,
  lastClearedLines: null,
  lastScore: 0,
  previousState: null,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT': {
      return {
        ...initialState,
        board: createEmptyBoard(),
        pieces: getThreeRandomPieces(),
        highScore: action.highScore ?? 0,
        piecesPlaced: 0,
        powerUps: { ...EMPTY_POWER_UPS },
        powerUpCharge: 0,
        mode: action.mode ?? 'classic',
      };
    }
    case 'LOAD_GAME': {
      return { ...state, ...action.gameState };
    }
    case 'SET_HIGH_SCORE': {
      return { ...state, highScore: action.highScore };
    }
    case 'PLACE_PIECE': {
      const { pieceIndex, row, col } = action;
      const piece = state.pieces[pieceIndex];
      if (!piece || !canPlacePiece(state.board, piece, row, col)) {
        return state;
      }

      // Save current state as snapshot (strip previousState to avoid deep nesting)
      const { previousState: _prev, ...snapshot } = state;
      const savedSnapshot: GameSnapshot = snapshot;

      const blockCount = countPieceBlocks(piece);
      const newBoard = placePiece(state.board, piece, row, col);
      const { completedRows, completedCols } = findCompletedLines(newBoard);
      const hasClears = completedRows.length > 0 || completedCols.length > 0;

      // Capture cell colors BEFORE clearing so LineClearEffect can animate them
      const clearedCells: { row: number; col: number; gradient: string[] }[] = [];
      if (hasClears) {
        const rowSet = new Set(completedRows);
        const colSet = new Set(completedCols);
        for (const r of completedRows) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = newBoard[r][c];
            if (cell) clearedCells.push({ row: r, col: c, gradient: cell.gradient });
          }
        }
        for (const c of completedCols) {
          for (let r = 0; r < BOARD_SIZE; r++) {
            if (rowSet.has(r)) continue; // already captured above
            const cell = newBoard[r][c];
            if (cell) clearedCells.push({ row: r, col: c, gradient: cell.gradient });
          }
        }
      }

      const newCombo = hasClears ? state.comboCount + 1 : 0;
      const scoreGained = calculateScore(blockCount, completedRows, completedCols, newCombo);

      const clearedBoard = hasClears ? clearLines(newBoard, completedRows, completedCols) : newBoard;

      const newPieces = [...state.pieces];
      newPieces[pieceIndex] = null;

      const newPiecesPlaced = state.piecesPlaced + 1;
      const nextLevel = getLevel(newPiecesPlaced);

      let finalPieces = newPieces;
      if (newPieces.every((p) => p === null)) {
        finalPieces = getSmartPieces(clearedBoard, nextLevel);
      }

      const totalNewLines = completedRows.length + completedCols.length;
      const newScore = state.score + scoreGained;
      const newHighScore = Math.max(state.highScore, newScore);
      const newLinesCleared = state.linesCleared + totalNewLines;
      const newMaxCombo = Math.max(state.maxCombo, newCombo);
      const isNewHighScore = newScore > state.highScore;
      const noPieceFits = !canAnyPieceFit(clearedBoard, finalPieces);

      // Zen mode: when no piece fits, regenerate instead of game over
      if (noPieceFits && state.mode === 'zen') {
        finalPieces = getSmartPieces(clearedBoard, nextLevel);
      }
      const isGameOver = state.mode === 'zen' ? false : noPieceFits;

      // Power-up charge: each cleared line adds 1 charge → award at POWER_UP_CHARGE_COST
      let newCharge = state.powerUpCharge + totalNewLines;
      const newPowerUps = { ...state.powerUps };
      const puTypes: PowerUpType[] = ['bomb', 'sweep', 'eraser'];
      while (newCharge >= POWER_UP_CHARGE_COST) {
        newCharge -= POWER_UP_CHARGE_COST;
        const eligible = puTypes.filter((t) => newPowerUps[t] < POWER_UP_MAX);
        if (eligible.length > 0) {
          const pick = eligible[Math.floor(Math.random() * eligible.length)];
          newPowerUps[pick] += 1;
        }
      }

      return {
        ...state,
        board: clearedBoard,
        pieces: finalPieces,
        score: newScore,
        highScore: newHighScore,
        comboCount: newCombo,
        maxCombo: newMaxCombo,
        linesCleared: newLinesCleared,
        piecesPlaced: newPiecesPlaced,
        powerUps: newPowerUps,
        powerUpCharge: newCharge,
        isGameOver,
        isNewHighScore,
        lastClearedLines: hasClears ? { rows: completedRows, cols: completedCols, cells: clearedCells } : null,
        lastScore: scoreGained,
        previousState: savedSnapshot,
      };
    }
    case 'USE_POWER_UP': {
      const { powerUp, row, col } = action;
      if (state.powerUps[powerUp] <= 0 || state.isGameOver) return state;

      let newBoard: Board;
      if (powerUp === 'bomb')        newBoard = applyBomb(state.board, row, col);
      else if (powerUp === 'sweep')  newBoard = applySweep(state.board, row, col);
      else                           newBoard = applyEraser(state.board, row, col);

      const { completedRows, completedCols } = findCompletedLines(newBoard);
      const hasClears = completedRows.length > 0 || completedCols.length > 0;
      const clearedBoard = hasClears ? clearLines(newBoard, completedRows, completedCols) : newBoard;
      const scoreGained = hasClears
        ? calculateScore(0, completedRows, completedCols, state.comboCount)
        : 0;
      const newScore = state.score + scoreGained;
      const newHighScore = Math.max(state.highScore, newScore);

      const newPowerUps = { ...state.powerUps, [powerUp]: state.powerUps[powerUp] - 1 };
      const isGameOver = state.mode === 'zen' ? false : !canAnyPieceFit(clearedBoard, state.pieces);

      return {
        ...state,
        board: clearedBoard,
        powerUps: newPowerUps,
        score: newScore,
        highScore: newHighScore,
        isNewHighScore: newHighScore > state.highScore,
        isGameOver,
        lastClearedLines: hasClears ? { rows: completedRows, cols: completedCols, cells: [] } : null,
        lastScore: scoreGained,
      };
    }
    case 'ROTATE_PIECE': {
      const { pieceIndex } = action;
      const piece = state.pieces[pieceIndex];
      if (!piece || state.isGameOver) return state;

      const rotatedShape = rotateShape(piece.shape);
      const rotatedPiece = {
        ...piece,
        shape: rotatedShape,
        instanceId: piece.instanceId + '_r',
      };
      const newPieces = [...state.pieces];
      newPieces[pieceIndex] = rotatedPiece;

      // Rotation may save you from game over (zen mode never ends anyway)
      const isGameOver = state.mode === 'zen'
        ? false
        : !canAnyPieceFit(state.board, newPieces);

      return { ...state, pieces: newPieces, isGameOver };
    }
    case 'TIME_UP': {
      if (state.mode !== 'timed' || state.isGameOver) return state;
      return { ...state, isGameOver: true };
    }
    case 'UNDO': {
      if (!state.previousState || state.isGameOver) return state;
      return {
        ...state.previousState,
        // Never undo to a lower high score
        highScore: Math.max(state.previousState.highScore, state.highScore),
        lastScore: 0,
        lastClearedLines: null,
        previousState: null,
      };
    }
    case 'CLEAR_LAST_LINES': {
      return { ...state, lastClearedLines: null };
    }
    case 'GAME_OVER_CONFIRMED': {
      return { ...state, isGameOver: true };
    }
    default:
      return state;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface GameProviderProps {
  children: ReactNode;
  initialHighScore?: number;
}

export function GameProvider({ children, initialHighScore = 0 }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    highScore: initialHighScore,
  });

  const canUndo = !!(state.previousState && !state.isGameOver);
  const level = getLevel(state.piecesPlaced);

  const initGame = useCallback((highScore: number, mode?: GameMode) => {
    dispatch({ type: 'INIT', highScore, mode });
  }, []);

  const loadGame = useCallback((gameState: Partial<GameState>) => {
    dispatch({ type: 'LOAD_GAME', gameState });
  }, []);

  const setHighScore = useCallback((highScore: number) => {
    dispatch({ type: 'SET_HIGH_SCORE', highScore });
  }, []);

  const placePieceAction = useCallback(async (pieceIndex: number, row: number, col: number) => {
    dispatch({ type: 'PLACE_PIECE', pieceIndex, row, col });
  }, []);

  const usePowerUp = useCallback((powerUp: PowerUpType, row: number, col: number) => {
    dispatch({ type: 'USE_POWER_UP', powerUp, row, col });
  }, []);

  const rotatePiece = useCallback((pieceIndex: number) => {
    dispatch({ type: 'ROTATE_PIECE', pieceIndex });
  }, []);

  const timeUp = useCallback(() => {
    dispatch({ type: 'TIME_UP' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const confirmGameOver = useCallback(async (finalState: GameState) => {
    const result = await updateStats({
      score: finalState.score,
      combo: finalState.maxCombo,
      lines: finalState.linesCleared,
    });

    // Award coins (score / 10)
    const earnedCoins = Math.floor(finalState.score / 10);
    if (earnedCoins > 0) await addCoins(earnedCoins);

    // Save to game history
    const entry: GameHistoryEntry = {
      score: finalState.score,
      linesCleared: finalState.linesCleared,
      maxCombo: finalState.maxCombo,
      piecesPlaced: finalState.piecesPlaced,
      level: getLevel(finalState.piecesPlaced),
      mode: finalState.mode,
      date: new Date().toISOString(),
    };
    await addGameToHistory(entry);

    await clearSavedGame();
    if (result.isNewHighScore) {
      dispatch({ type: 'SET_HIGH_SCORE', highScore: finalState.score });
    }
  }, []);

  const clearLastLines = useCallback(() => {
    dispatch({ type: 'CLEAR_LAST_LINES' });
  }, []);

  const saveCurrentGame = useCallback(async (currentState: GameState) => {
    await saveGame(currentState);
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        level,
        canUndo,
        initGame,
        loadGame,
        setHighScore,
        placePieceAction,
        usePowerUp,
        rotatePiece,
        timeUp,
        undo,
        confirmGameOver,
        clearLastLines,
        saveCurrentGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
