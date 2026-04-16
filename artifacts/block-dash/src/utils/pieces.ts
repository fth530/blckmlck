import { PIECE_COLORS } from "./constants";
import { canPieceFitAnywhere, getBoardFillRatio } from "./gameHelpers";
import type { PieceBase, Piece, PieceShape, Board } from "./types";

const getColor = (index: number) => PIECE_COLORS[index % PIECE_COLORS.length];

export const ALL_PIECES: PieceBase[] = [
  { id: "dot", shape: [[1]], colorIndex: 7 },
  { id: "line2h", shape: [[1, 1]], colorIndex: 0 },
  { id: "line2v", shape: [[1], [1]], colorIndex: 0 },
  { id: "line3h", shape: [[1, 1, 1]], colorIndex: 1 },
  { id: "line3v", shape: [[1], [1], [1]], colorIndex: 1 },
  { id: "line4h", shape: [[1, 1, 1, 1]], colorIndex: 2 },
  { id: "line4v", shape: [[1], [1], [1], [1]], colorIndex: 2 },
  { id: "line5h", shape: [[1, 1, 1, 1, 1]], colorIndex: 3 },
  { id: "line5v", shape: [[1], [1], [1], [1], [1]], colorIndex: 3 },
  {
    id: "sq2",
    shape: [
      [1, 1],
      [1, 1],
    ],
    colorIndex: 4,
  },
  {
    id: "sq3",
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    colorIndex: 5,
  },
  {
    id: "l1",
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    colorIndex: 6,
  },
  {
    id: "l2",
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    colorIndex: 6,
  },
  {
    id: "l3",
    shape: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    colorIndex: 6,
  },
  {
    id: "l4",
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    colorIndex: 6,
  },
  {
    id: "j1",
    shape: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    colorIndex: 7,
  },
  {
    id: "j2",
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    colorIndex: 7,
  },
  {
    id: "j3",
    shape: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    colorIndex: 7,
  },
  {
    id: "j4",
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    colorIndex: 7,
  },
  {
    id: "t1",
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    colorIndex: 2,
  },
  {
    id: "t2",
    shape: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    colorIndex: 2,
  },
  {
    id: "t3",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    colorIndex: 2,
  },
  {
    id: "t4",
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    colorIndex: 2,
  },
  {
    id: "s1",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    colorIndex: 4,
  },
  {
    id: "s2",
    shape: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    colorIndex: 4,
  },
  {
    id: "z1",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    colorIndex: 0,
  },
  {
    id: "z2",
    shape: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    colorIndex: 0,
  },
  {
    id: "bigl1",
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    colorIndex: 5,
  },
  {
    id: "bigl2",
    shape: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    colorIndex: 5,
  },
  {
    id: "bigl3",
    shape: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    colorIndex: 5,
  },
  {
    id: "bigl4",
    shape: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    colorIndex: 5,
  },
  {
    id: "corner1",
    shape: [
      [0, 1],
      [1, 1],
    ],
    colorIndex: 3,
  },
  {
    id: "corner2",
    shape: [
      [1, 0],
      [1, 1],
    ],
    colorIndex: 3,
  },
  {
    id: "corner3",
    shape: [
      [1, 1],
      [1, 0],
    ],
    colorIndex: 3,
  },
  {
    id: "corner4",
    shape: [
      [1, 1],
      [0, 1],
    ],
    colorIndex: 3,
  },
  {
    id: "plus",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    colorIndex: 1,
  },
];

export function getRandomPiece(): Piece {
  const idx = Math.floor(Math.random() * ALL_PIECES.length);
  const piece = ALL_PIECES[idx];
  return {
    ...piece,
    color: PIECE_COLORS[piece.colorIndex],
    instanceId:
      Date.now().toString() + Math.random().toString(36).substring(2, 8),
  };
}

export function getThreeRandomPieces(): [Piece, Piece, Piece] {
  return [getRandomPiece(), getRandomPiece(), getRandomPiece()];
}

// ─── Smart weighted piece selection ──────────────────────────────────────────

function countShapeCells(shape: PieceShape): number {
  let n = 0;
  for (const row of shape) for (const c of row) if (c === 1) n++;
  return n;
}

function weightedPick(pool: Array<{ base: PieceBase; weight: number }>): PieceBase {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.weight;
    if (r <= 0) return p.base;
  }
  return pool[pool.length - 1].base;
}

/**
 * Generates 3 pieces weighted by board state and difficulty level:
 *  - Pieces that cannot fit anywhere on the current board are excluded.
 *  - When the board is crowded (high fill ratio) large pieces are penalised.
 *  - Higher levels partially counteract this mercy — more large/complex pieces appear.
 */
export function getSmartPieces(board: Board, level: number = 1): [Piece, Piece, Piece] {
  const fillRatio = getBoardFillRatio(board);
  // 0 at level 1, 1.0 at level 10
  const difficultyBoost = (Math.min(10, level) - 1) / 9;

  const pool: Array<{ base: PieceBase; weight: number }> = [];

  for (const base of ALL_PIECES) {
    const tempPiece: Piece = {
      ...base,
      color: PIECE_COLORS[base.colorIndex],
      instanceId: "check",
    };
    // Only include pieces that can actually be placed somewhere
    if (!canPieceFitAnywhere(board, tempPiece)) continue;

    const cells = countShapeCells(base.shape);
    // Crowded board penalises large pieces; higher difficulty partially counteracts the mercy.
    // At level 1, fillRatio=0.8: 9-cell piece → weight ≈ 0.36
    // At level 10, fillRatio=0.8: 9-cell piece → weight ≈ 0.88 (back near 1)
    const sizePenalty = fillRatio * (cells - 1) / 10;
    const sizeBoost   = difficultyBoost * (cells - 1) / 11;
    const weight = Math.max(0.05, 1 - sizePenalty + sizeBoost);
    pool.push({ base, weight });
  }

  // Safety fallback — should not happen; game-over is detected before new pieces spawn
  if (pool.length === 0) return getThreeRandomPieces();

  const mkPiece = (base: PieceBase): Piece => ({
    ...base,
    color: PIECE_COLORS[base.colorIndex],
    instanceId: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  });

  return [
    mkPiece(weightedPick(pool)),
    mkPiece(weightedPick(pool)),
    mkPiece(weightedPick(pool)),
  ];
}

export function getPieceWidth(piece: Piece): number {
  return piece.shape[0].length;
}

export function getPieceHeight(piece: Piece): number {
  return piece.shape.length;
}
