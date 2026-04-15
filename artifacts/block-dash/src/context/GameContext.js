import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import {
  createEmptyBoard,
  canPlacePiece,
  placePiece,
  findCompletedLines,
  clearLines,
  calculateScore,
  countPieceBlocks,
  canAnyPieceFit,
} from '../utils/gameHelpers';
import { getThreeRandomPieces } from '../utils/pieces';
import { updateStats, saveGame, clearSavedGame } from '../utils/storage';

const GameContext = createContext(null);

const initialState = {
  board: createEmptyBoard(),
  pieces: getThreeRandomPieces(),
  score: 0,
  highScore: 0,
  comboCount: 0,
  maxCombo: 0,
  linesCleared: 0,
  isGameOver: false,
  isNewHighScore: false,
  lastClearedLines: null, // { rows, cols }
  lastScore: 0,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      return {
        ...initialState,
        board: createEmptyBoard(),
        pieces: getThreeRandomPieces(),
        highScore: action.highScore || 0,
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

      const blockCount = countPieceBlocks(piece);
      const newBoard = placePiece(state.board, piece, row, col);
      const { completedRows, completedCols } = findCompletedLines(newBoard);
      const hasClears = completedRows.length > 0 || completedCols.length > 0;

      const newCombo = hasClears ? state.comboCount + 1 : 0;
      const scoreGained = calculateScore(blockCount, completedRows, completedCols, newCombo);

      const clearedBoard = hasClears ? clearLines(newBoard, completedRows, completedCols) : newBoard;

      const newPieces = [...state.pieces];
      newPieces[pieceIndex] = null;

      // Refill all pieces if all used
      let finalPieces = newPieces;
      if (newPieces.every(p => p === null)) {
        finalPieces = getThreeRandomPieces();
      }

      const newScore = state.score + scoreGained;
      const newHighScore = Math.max(state.highScore, newScore);
      const newLinesCleared = state.linesCleared + completedRows.length + completedCols.length;
      const newMaxCombo = Math.max(state.maxCombo, newCombo);
      const isNewHighScore = newScore > state.highScore;

      const isGameOver = !canAnyPieceFit(clearedBoard, finalPieces);

      return {
        ...state,
        board: clearedBoard,
        pieces: finalPieces,
        score: newScore,
        highScore: newHighScore,
        comboCount: newCombo,
        maxCombo: newMaxCombo,
        linesCleared: newLinesCleared,
        isGameOver,
        isNewHighScore,
        lastClearedLines: hasClears ? { rows: completedRows, cols: completedCols } : null,
        lastScore: scoreGained,
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

export function GameProvider({ children, initialHighScore = 0 }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    highScore: initialHighScore,
  });

  const initGame = useCallback((highScore) => {
    dispatch({ type: 'INIT', highScore });
  }, []);

  const loadGame = useCallback((gameState) => {
    dispatch({ type: 'LOAD_GAME', gameState });
  }, []);

  const setHighScore = useCallback((highScore) => {
    dispatch({ type: 'SET_HIGH_SCORE', highScore });
  }, []);

  const placePieceAction = useCallback(async (pieceIndex, row, col) => {
    dispatch({ type: 'PLACE_PIECE', pieceIndex, row, col });
  }, []);

  const confirmGameOver = useCallback(async (finalState) => {
    const result = await updateStats({
      score: finalState.score,
      combo: finalState.maxCombo,
      lines: finalState.linesCleared,
    });
    await clearSavedGame();
    if (result.isNewHighScore) {
      dispatch({ type: 'SET_HIGH_SCORE', highScore: finalState.score });
    }
  }, []);

  const clearLastLines = useCallback(() => {
    dispatch({ type: 'CLEAR_LAST_LINES' });
  }, []);

  const saveCurrentGame = useCallback(async (currentState) => {
    await saveGame(currentState);
  }, []);

  return (
    <GameContext.Provider value={{
      state,
      initGame,
      loadGame,
      setHighScore,
      placePieceAction,
      confirmGameOver,
      clearLastLines,
      saveCurrentGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
