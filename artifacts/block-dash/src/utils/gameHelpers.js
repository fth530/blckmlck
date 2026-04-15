import { BOARD_SIZE, SCORING } from './constants';

export function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null)
  );
}

export function canPlacePiece(board, piece, row, col) {
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

export function placePiece(board, piece, row, col) {
  const newBoard = board.map(r => [...r]);
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

export function findCompletedLines(board) {
  const completedRows = [];
  const completedCols = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(cell => cell !== null)) {
      completedRows.push(r);
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every(row => row[c] !== null)) {
      completedCols.push(c);
    }
  }

  return { completedRows, completedCols };
}

export function clearLines(board, completedRows, completedCols) {
  const newBoard = board.map(r => [...r]);

  // Clear completed rows
  for (const row of completedRows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[row][c] = null;
    }
  }

  // Clear completed cols
  for (const col of completedCols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][col] = null;
    }
  }

  return newBoard;
}

export function calculateScore(pieceBlockCount, completedRows, completedCols, comboCount) {
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

export function countPieceBlocks(piece) {
  let count = 0;
  for (const row of piece.shape) {
    for (const cell of row) {
      if (cell === 1) count++;
    }
  }
  return count;
}

export function canAnyPieceFit(board, pieces) {
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

export function getBoardCells(piece) {
  const cells = [];
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] === 1) {
        cells.push({ r, c });
      }
    }
  }
  return cells;
}
