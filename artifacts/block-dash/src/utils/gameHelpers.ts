import { BOARD_SIZE, SCORING } from "./constants";
import type { Board, Piece, CompletedLines, Position } from "./types";

export function createEmptyBoard(): Board {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

export function canPlacePiece(
  board: Board,
  piece: Piece,
  row: number,
  col: number,
): boolean {
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (
          boardRow < 0 ||
          boardRow >= BOARD_SIZE ||
          boardCol < 0 ||
          boardCol >= BOARD_SIZE ||
          board[boardRow][boardCol] !== null
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export function placePiece(
  board: Board,
  piece: Piece,
  row: number,
  col: number,
): Board {
  const newBoard = board.map((r) => [...r]);
  const shape = piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        newBoard[row + r][col + c] = piece.color;
      }
    }
  }
  return newBoard;
}

export function findCompletedLines(board: Board): CompletedLines {
  const completedRows: number[] = [];
  const completedCols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((cell) => cell !== null)) {
      completedRows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every((row) => row[c] !== null)) {
      completedCols.push(c);
    }
  }

  return { completedRows, completedCols };
}

export function clearLines(
  board: Board,
  completedRows: number[],
  completedCols: number[],
): Board {
  const newBoard = board.map((r) => [...r]);

  for (const row of completedRows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[row][c] = null;
    }
  }

  for (const col of completedCols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][col] = null;
    }
  }

  return newBoard;
}

export function calculateScore(
  pieceBlockCount: number,
  completedRows: number[],
  completedCols: number[],
  comboCount: number,
): number {
  const totalLines = completedRows.length + completedCols.length;
  let score = pieceBlockCount * SCORING.PER_BLOCK;

  if (totalLines > 0) {
    score += SCORING.SINGLE_LINE;
    score += (totalLines - 1) * SCORING.EXTRA_LINE_BONUS;
  }

  const comboIdx = Math.min(comboCount, SCORING.COMBO_MULTIPLIERS.length - 1);
  score = Math.round(score * SCORING.COMBO_MULTIPLIERS[comboIdx]);

  return score;
}

export function countPieceBlocks(piece: Piece): number {
  let count = 0;
  for (const row of piece.shape) {
    for (const cell of row) {
      if (cell === 1) count++;
    }
  }
  return count;
}

export function canAnyPieceFit(
  board: Board,
  pieces: (Piece | null)[],
): boolean {
  for (const piece of pieces) {
    if (!piece) continue;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlacePiece(board, piece, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Returns the current difficulty level (1–10) based on total pieces placed.
 * One level up every 15 pieces. Level 10 is the maximum.
 */
export function getLevel(piecesPlaced: number): number {
  return Math.min(10, Math.floor(piecesPlaced / 15) + 1);
}

/** Returns true if `piece` can be placed at least one valid position on the board. */
export function canPieceFitAnywhere(board: Board, piece: Piece): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlacePiece(board, piece, r, c)) return true;
    }
  }
  return false;
}

/** Returns fraction of board cells that are filled (0.0 – 1.0). */
export function getBoardFillRatio(board: Board): number {
  let filled = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) filled++;
    }
  }
  return filled / (BOARD_SIZE * BOARD_SIZE);
}

// ─── Power-up board operations ──────────────────────────────────────────────

/** Clears a 3×3 area centred on (row, col). */
export function applyBomb(board: Board, row: number, col: number): Board {
  const b = board.map((r) => [...r]);
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        b[r][c] = null;
      }
    }
  }
  return b;
}

/** Clears the entire row AND column of (row, col) — cross / + pattern. */
export function applySweep(board: Board, row: number, col: number): Board {
  const b = board.map((r) => [...r]);
  for (let c = 0; c < BOARD_SIZE; c++) b[row][c] = null;
  for (let r = 0; r < BOARD_SIZE; r++) b[r][col] = null;
  return b;
}

/** Removes the single block at (row, col). */
export function applyEraser(board: Board, row: number, col: number): Board {
  const b = board.map((r) => [...r]);
  b[row][col] = null;
  return b;
}

export function getBoardCells(piece: Piece): Position[] {
  const cells: Position[] = [];
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] === 1) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}
