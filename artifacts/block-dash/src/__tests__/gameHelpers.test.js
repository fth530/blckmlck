import {
  createEmptyBoard,
  canPlacePiece,
  placePiece,
  findCompletedLines,
  clearLines,
  calculateScore,
  countPieceBlocks,
  canAnyPieceFit,
  getBoardCells,
} from "../utils/gameHelpers";
import { BOARD_SIZE, SCORING } from "../utils/constants";

describe("gameHelpers", () => {
  describe("createEmptyBoard", () => {
    it("should create a 10x10 board", () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      expect(board[0]).toHaveLength(BOARD_SIZE);
    });

    it("should fill board with null values", () => {
      const board = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          expect(board[r][c]).toBeNull();
        }
      }
    });

    it("should not mutate when returned board is modified", () => {
      const board1 = createEmptyBoard();
      const board2 = createEmptyBoard();
      board1[0][0] = "test";
      expect(board2[0][0]).toBeNull();
    });
  });

  describe("canPlacePiece", () => {
    const emptyBoard = createEmptyBoard();
    const dotPiece = { shape: [[1]], color: "#FF0000" };
    const line2h = { shape: [[1, 1]], color: "#00FF00" };
    const lShape = {
      shape: [
        [1, 0],
        [1, 1],
      ],
      color: "#0000FF",
    };

    it("should return true for valid placement on empty board", () => {
      expect(canPlacePiece(emptyBoard, dotPiece, 0, 0)).toBe(true);
    });

    it("should return true for valid placement with offset", () => {
      expect(canPlacePiece(emptyBoard, line2h, 5, 5)).toBe(true);
    });

    it("should return false when piece exceeds top boundary", () => {
      expect(canPlacePiece(emptyBoard, line2h, -1, 0)).toBe(false);
    });

    it("should return false when piece exceeds left boundary", () => {
      expect(canPlacePiece(emptyBoard, lShape, 0, -1)).toBe(false);
    });

    it("should return false when piece exceeds bottom boundary", () => {
      expect(canPlacePiece(emptyBoard, line2h, BOARD_SIZE, 0)).toBe(false);
    });

    it("should return false when piece exceeds right boundary", () => {
      expect(canPlacePiece(emptyBoard, line2h, 0, BOARD_SIZE - 1)).toBe(false);
    });

    it("should return false when target cell is occupied", () => {
      const board = createEmptyBoard();
      board[5][5] = "#FF0000";
      expect(canPlacePiece(board, dotPiece, 5, 5)).toBe(false);
    });

    it("should return false when any cell of piece overlaps occupied cell", () => {
      const board = createEmptyBoard();
      board[1][0] = "#FF0000";
      expect(canPlacePiece(board, lShape, 0, 0)).toBe(false);
    });

    it("should return true when piece fits in gap between occupied cells", () => {
      const board = createEmptyBoard();
      board[0][0] = "#FF0000";
      board[0][2] = "#FF0000";
      board[0][3] = "#FF0000";
      expect(canPlacePiece(board, dotPiece, 0, 1)).toBe(true);
    });

    it("should handle L-shaped piece correctly", () => {
      expect(canPlacePiece(emptyBoard, lShape, 0, 0)).toBe(true);
      expect(canPlacePiece(emptyBoard, lShape, 8, 8)).toBe(true);
      expect(canPlacePiece(emptyBoard, lShape, 9, 8)).toBe(false);
    });
  });

  describe("placePiece", () => {
    it("should place piece with correct color", () => {
      const board = createEmptyBoard();
      const piece = { shape: [[1]], color: "#FF0000" };
      const newBoard = placePiece(board, piece, 0, 0);
      expect(newBoard[0][0]).toBe("#FF0000");
    });

    it("should not mutate original board", () => {
      const board = createEmptyBoard();
      const piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#FF0000",
      };
      placePiece(board, piece, 0, 0);
      expect(board[0][0]).toBeNull();
    });

    it("should place 2x2 square correctly", () => {
      const board = createEmptyBoard();
      const square = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#00FF00",
      };
      const newBoard = placePiece(board, square, 0, 0);
      expect(newBoard[0][0]).toBe("#00FF00");
      expect(newBoard[0][1]).toBe("#00FF00");
      expect(newBoard[1][0]).toBe("#00FF00");
      expect(newBoard[1][1]).toBe("#00FF00");
    });

    it("should place piece at correct position", () => {
      const board = createEmptyBoard();
      const piece = { shape: [[1, 1]], color: "#0000FF" };
      const newBoard = placePiece(board, piece, 5, 3);
      expect(newBoard[5][3]).toBe("#0000FF");
      expect(newBoard[5][4]).toBe("#0000FF");
    });

    it("should only fill cells where shape has 1", () => {
      const board = createEmptyBoard();
      const lShape = {
        shape: [
          [1, 0],
          [1, 1],
        ],
        color: "#FF00FF",
      };
      const newBoard = placePiece(board, lShape, 0, 0);
      expect(newBoard[0][0]).toBe("#FF00FF");
      expect(newBoard[0][1]).toBeNull();
      expect(newBoard[1][0]).toBe("#FF00FF");
      expect(newBoard[1][1]).toBe("#FF00FF");
    });
  });

  describe("findCompletedLines", () => {
    it("should return empty arrays for empty board", () => {
      const board = createEmptyBoard();
      const result = findCompletedLines(board);
      expect(result.completedRows).toEqual([]);
      expect(result.completedCols).toEqual([]);
    });

    it("should detect a single completed row", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedRows).toEqual([0]);
      expect(result.completedCols).toEqual([]);
    });

    it("should detect a single completed column", () => {
      const board = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][0] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedRows).toEqual([]);
      expect(result.completedCols).toEqual([0]);
    });

    it("should detect multiple completed rows", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = "#FF0000";
        board[5][c] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedRows).toEqual([0, 5]);
    });

    it("should detect multiple completed columns", () => {
      const board = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][2] = "#FF0000";
        board[r][7] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedCols).toEqual([2, 7]);
    });

    it("should detect both rows and columns", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[3][c] = "#FF0000";
      }
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][5] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedRows).toEqual([3]);
      expect(result.completedCols).toEqual([5]);
    });

    it("should not mark row as complete if one cell is empty", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE - 1; c++) {
        board[0][c] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedRows).toEqual([]);
    });

    it("should not mark column as complete if one cell is empty", () => {
      const board = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE - 1; r++) {
        board[r][0] = "#FF0000";
      }
      const result = findCompletedLines(board);
      expect(result.completedCols).toEqual([]);
    });
  });

  describe("clearLines", () => {
    it("should clear completed rows", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = "#FF0000";
      }
      const newBoard = clearLines(board, [0], []);
      expect(newBoard[0].every((cell) => cell === null)).toBe(true);
    });

    it("should clear completed columns", () => {
      const board = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][0] = "#FF0000";
      }
      const newBoard = clearLines(board, [], [0]);
      for (let r = 0; r < BOARD_SIZE; r++) {
        expect(newBoard[r][0]).toBeNull();
      }
    });

    it("should not mutate original board", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = "#FF0000";
      }
      clearLines(board, [0], []);
      expect(board[0][0]).toBe("#FF0000");
    });

    it("should clear intersection cells only once", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = "#FF0000";
      }
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][5] = "#00FF00";
      }
      const newBoard = clearLines(board, [0], [5]);
      expect(newBoard[0][5]).toBeNull();
    });

    it("should clear multiple rows and columns", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[1][c] = "#FF0000";
        board[8][c] = "#FF0000";
      }
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][2] = "#00FF00";
        board[r][7] = "#00FF00";
      }
      const newBoard = clearLines(board, [1, 8], [2, 7]);
      expect(newBoard[1][2]).toBeNull();
      expect(newBoard[8][7]).toBeNull();
    });

    it("should preserve cells not in completed lines", () => {
      const board = createEmptyBoard();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[0][c] = "#FF0000";
      }
      board[1][0] = "#00FF00";
      const newBoard = clearLines(board, [0], []);
      expect(newBoard[1][0]).toBe("#00FF00");
      expect(newBoard[2][5]).toBeNull();
    });
  });

  describe("calculateScore", () => {
    it("should return base score for piece blocks only", () => {
      const score = calculateScore(4, [], [], 0);
      expect(score).toBe(4 * SCORING.PER_BLOCK);
    });

    it("should add single line bonus when 1 line cleared", () => {
      const score = calculateScore(1, [0], [], 0);
      const expected = 1 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
      expect(score).toBe(expected);
    });

    it("should add extra line bonus for 2+ lines", () => {
      const score = calculateScore(1, [0, 1], [], 0);
      const expected =
        1 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE + SCORING.EXTRA_LINE_BONUS;
      expect(score).toBe(expected);
    });

    it("should count both rows and columns", () => {
      const score = calculateScore(1, [0], [0], 0);
      const expected =
        1 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE + SCORING.EXTRA_LINE_BONUS;
      expect(score).toBe(expected);
    });

    describe("combo multipliers", () => {
      it("should apply 1x multiplier for combo 0", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        const score = calculateScore(2, [0], [], 0);
        expect(score).toBe(Math.round(baseScore * 1));
      });

      it("should apply 1.5x multiplier for combo 1", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        const score = calculateScore(2, [0], [], 1);
        expect(score).toBe(Math.round(baseScore * 1.5));
      });

      it("should apply 2x multiplier for combo 2", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        const score = calculateScore(2, [0], [], 2);
        expect(score).toBe(Math.round(baseScore * 2));
      });

      it("should apply 2.5x multiplier for combo 3", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        const score = calculateScore(2, [0], [], 3);
        expect(score).toBe(Math.round(baseScore * 2.5));
      });

      it("should apply 3x multiplier for combo 4", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        const score = calculateScore(2, [0], [], 4);
        expect(score).toBe(Math.round(baseScore * 3));
      });

      it("should apply 3.5x multiplier for combo 5", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        const score = calculateScore(2, [0], [], 5);
        expect(score).toBe(Math.round(baseScore * 3.5));
      });

      it("should apply 4x (max) multiplier for combo 6+", () => {
        const baseScore = 2 * SCORING.PER_BLOCK + SCORING.SINGLE_LINE;
        expect(calculateScore(2, [0], [], 6)).toBe(Math.round(baseScore * 4));
        expect(calculateScore(2, [0], [], 7)).toBe(Math.round(baseScore * 4));
        expect(calculateScore(2, [0], [], 100)).toBe(Math.round(baseScore * 4));
      });
    });
  });

  describe("countPieceBlocks", () => {
    it("should return 1 for dot piece", () => {
      const piece = { shape: [[1]] };
      expect(countPieceBlocks(piece)).toBe(1);
    });

    it("should return 4 for 2x2 square", () => {
      const piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
      };
      expect(countPieceBlocks(piece)).toBe(4);
    });

    it("should return 3 for L-shape", () => {
      const piece = {
        shape: [
          [1, 0],
          [1, 1],
        ],
      };
      expect(countPieceBlocks(piece)).toBe(3);
    });

    it("should return 5 for line of 5", () => {
      const piece = { shape: [[1, 1, 1, 1, 1]] };
      expect(countPieceBlocks(piece)).toBe(5);
    });

    it("should return 5 for plus shape", () => {
      const piece = {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0],
        ],
      };
      expect(countPieceBlocks(piece)).toBe(5);
    });
  });

  describe("canAnyPieceFit", () => {
    it("should return true when pieces can fit on empty board", () => {
      const board = createEmptyBoard();
      const pieces = [
        { shape: [[1]] },
        { shape: [[1, 1]] },
        { shape: [[1], [1]] },
      ];
      expect(canAnyPieceFit(board, pieces)).toBe(true);
    });

    it("should return false when no pieces provided", () => {
      const board = createEmptyBoard();
      expect(canAnyPieceFit(board, [])).toBe(false);
    });

    it("should return false when all pieces are null", () => {
      const board = createEmptyBoard();
      expect(canAnyPieceFit(board, [null, null, null])).toBe(false);
    });

    it("should return false when board is completely filled", () => {
      const board = Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill("#FF0000"));
      const pieces = [{ shape: [[1]] }];
      expect(canAnyPieceFit(board, pieces)).toBe(false);
    });

    it("should return true when at least one piece fits", () => {
      const board = createEmptyBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (r === 0 && c < 9) board[r][c] = "#FF0000";
        }
      }
      const pieces = [{ shape: [[1]] }];
      expect(canAnyPieceFit(board, pieces)).toBe(true);
    });

    it("should skip null pieces in array", () => {
      const board = createEmptyBoard();
      const pieces = [null, null, { shape: [[1]] }];
      expect(canAnyPieceFit(board, pieces)).toBe(true);
    });
  });

  describe("getBoardCells", () => {
    it("should return empty array for empty shape", () => {
      const piece = {
        shape: [
          [0, 0],
          [0, 0],
        ],
      };
      expect(getBoardCells(piece)).toEqual([]);
    });

    it("should return single cell for dot", () => {
      const piece = { shape: [[1]] };
      expect(getBoardCells(piece)).toEqual([{ row: 0, col: 0 }]);
    });

    it("should return correct cells for L-shape", () => {
      const piece = {
        shape: [
          [1, 0],
          [1, 1],
        ],
      };
      const cells = getBoardCells(piece);
      expect(cells).toContainEqual({ row: 0, col: 0 });
      expect(cells).toContainEqual({ row: 1, col: 0 });
      expect(cells).toContainEqual({ row: 1, col: 1 });
      expect(cells).toHaveLength(3);
    });

    it("should return correct order of cells", () => {
      const piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
      };
      const cells = getBoardCells(piece);
      expect(cells[0]).toEqual({ row: 0, col: 0 });
      expect(cells[1]).toEqual({ row: 0, col: 1 });
      expect(cells[2]).toEqual({ row: 1, col: 0 });
      expect(cells[3]).toEqual({ row: 1, col: 1 });
    });
  });
});
