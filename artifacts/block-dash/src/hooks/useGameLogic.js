/**
 * useGameLogic - wraps GameContext and exposes computed/derived values
 * All heavy game logic lives in GameContext reducer. This hook provides
 * convenient derived state and helper methods for the UI layer.
 */
import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import {
  canPlacePiece,
  getBoardCells,
  findCompletedLines,
} from '../utils/gameHelpers';
import { BOARD_SIZE } from '../utils/constants';

export function useGameLogic() {
  const gameCtx = useGame();
  const { state } = gameCtx;

  /**
   * Given a pixel position relative to the board's top-left,
   * and a piece, returns the best grid placement (row, col) for the
   * piece's top-left corner, centering the piece on the finger.
   */
  const getPlacementFromPixel = useCallback((pixelX, pixelY, piece, cellSize) => {
    const pRows = piece.shape.length;
    const pCols = piece.shape[0].length;

    // Find the raw grid cell under the cursor
    const rawCol = Math.floor(pixelX / cellSize);
    const rawRow = Math.floor(pixelY / cellSize);

    // Offset so piece center is under finger
    const col = rawCol - Math.floor(pCols / 2);
    const row = rawRow - Math.floor(pRows / 2);

    return { row, col };
  }, []);

  /**
   * Build ghost cell list for the given board position.
   * Returns [] if off-screen entirely, otherwise partial/full cells.
   */
  const buildGhostCells = useCallback((piece, row, col) => {
    const valid = canPlacePiece(state.board, piece, row, col);
    const cells = getBoardCells(piece)
      .map(({ r, c }) => ({
        row: row + r,
        col: col + c,
        valid,
      }))
      .filter(({ row: gr, col: gc }) =>
        gr >= 0 && gr < BOARD_SIZE && gc >= 0 && gc < BOARD_SIZE
      );
    return { cells, valid };
  }, [state.board]);

  /**
   * Returns true if the given piece can be placed at (row,col).
   */
  const canPlace = useCallback((piece, row, col) => {
    return canPlacePiece(state.board, piece, row, col);
  }, [state.board]);

  /**
   * Returns which rows and columns would be cleared if piece placed at row,col.
   */
  const previewClears = useCallback((piece, row, col) => {
    if (!canPlacePiece(state.board, piece, row, col)) return { rows: [], cols: [] };
    // Simulate the placement
    const tempBoard = state.board.map(r => [...r]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] === 1) {
          tempBoard[row + r][col + c] = piece.color;
        }
      }
    }
    const { completedRows, completedCols } = findCompletedLines(tempBoard);
    return { rows: completedRows, cols: completedCols };
  }, [state.board]);

  return {
    ...gameCtx,
    getPlacementFromPixel,
    buildGhostCells,
    canPlace,
    previewClears,
  };
}
