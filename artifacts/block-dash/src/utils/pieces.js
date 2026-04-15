import { PIECE_COLORS } from './constants';

// Each piece is a 2D array of 0s and 1s
// 1 = filled cell

const getColor = (index) => PIECE_COLORS[index % PIECE_COLORS.length];

export const ALL_PIECES = [
  // Single dot
  {
    id: 'dot',
    shape: [[1]],
    colorIndex: 7,
  },
  // Line 2 horizontal
  {
    id: 'line2h',
    shape: [[1, 1]],
    colorIndex: 0,
  },
  // Line 2 vertical
  {
    id: 'line2v',
    shape: [[1], [1]],
    colorIndex: 0,
  },
  // Line 3 horizontal
  {
    id: 'line3h',
    shape: [[1, 1, 1]],
    colorIndex: 1,
  },
  // Line 3 vertical
  {
    id: 'line3v',
    shape: [[1], [1], [1]],
    colorIndex: 1,
  },
  // Line 4 horizontal
  {
    id: 'line4h',
    shape: [[1, 1, 1, 1]],
    colorIndex: 2,
  },
  // Line 4 vertical
  {
    id: 'line4v',
    shape: [[1], [1], [1], [1]],
    colorIndex: 2,
  },
  // Line 5 horizontal
  {
    id: 'line5h',
    shape: [[1, 1, 1, 1, 1]],
    colorIndex: 3,
  },
  // Line 5 vertical
  {
    id: 'line5v',
    shape: [[1], [1], [1], [1], [1]],
    colorIndex: 3,
  },
  // Square 2x2
  {
    id: 'sq2',
    shape: [[1, 1], [1, 1]],
    colorIndex: 4,
  },
  // Square 3x3
  {
    id: 'sq3',
    shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    colorIndex: 5,
  },
  // L-shape rotation 1
  {
    id: 'l1',
    shape: [[1, 0], [1, 0], [1, 1]],
    colorIndex: 6,
  },
  // L-shape rotation 2
  {
    id: 'l2',
    shape: [[1, 1, 1], [1, 0, 0]],
    colorIndex: 6,
  },
  // L-shape rotation 3
  {
    id: 'l3',
    shape: [[1, 1], [0, 1], [0, 1]],
    colorIndex: 6,
  },
  // L-shape rotation 4
  {
    id: 'l4',
    shape: [[0, 0, 1], [1, 1, 1]],
    colorIndex: 6,
  },
  // J-shape rotation 1 (mirror L)
  {
    id: 'j1',
    shape: [[0, 1], [0, 1], [1, 1]],
    colorIndex: 7,
  },
  // J-shape rotation 2
  {
    id: 'j2',
    shape: [[1, 0, 0], [1, 1, 1]],
    colorIndex: 7,
  },
  // J-shape rotation 3
  {
    id: 'j3',
    shape: [[1, 1], [1, 0], [1, 0]],
    colorIndex: 7,
  },
  // J-shape rotation 4
  {
    id: 'j4',
    shape: [[1, 1, 1], [0, 0, 1]],
    colorIndex: 7,
  },
  // T-shape rotation 1
  {
    id: 't1',
    shape: [[1, 1, 1], [0, 1, 0]],
    colorIndex: 2,
  },
  // T-shape rotation 2
  {
    id: 't2',
    shape: [[1, 0], [1, 1], [1, 0]],
    colorIndex: 2,
  },
  // T-shape rotation 3
  {
    id: 't3',
    shape: [[0, 1, 0], [1, 1, 1]],
    colorIndex: 2,
  },
  // T-shape rotation 4
  {
    id: 't4',
    shape: [[0, 1], [1, 1], [0, 1]],
    colorIndex: 2,
  },
  // S-shape
  {
    id: 's1',
    shape: [[0, 1, 1], [1, 1, 0]],
    colorIndex: 4,
  },
  // S-shape vertical
  {
    id: 's2',
    shape: [[1, 0], [1, 1], [0, 1]],
    colorIndex: 4,
  },
  // Z-shape
  {
    id: 'z1',
    shape: [[1, 1, 0], [0, 1, 1]],
    colorIndex: 0,
  },
  // Z-shape vertical
  {
    id: 'z2',
    shape: [[0, 1], [1, 1], [1, 0]],
    colorIndex: 0,
  },
  // Big L 3x3
  {
    id: 'bigl1',
    shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
    colorIndex: 5,
  },
  // Big L rotation 2
  {
    id: 'bigl2',
    shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
    colorIndex: 5,
  },
  // Big L rotation 3
  {
    id: 'bigl3',
    shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
    colorIndex: 5,
  },
  // Big L rotation 4
  {
    id: 'bigl4',
    shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
    colorIndex: 5,
  },
  // Corner 2x2 top-left missing
  {
    id: 'corner1',
    shape: [[0, 1], [1, 1]],
    colorIndex: 3,
  },
  // Corner 2x2 top-right missing
  {
    id: 'corner2',
    shape: [[1, 0], [1, 1]],
    colorIndex: 3,
  },
  // Corner 2x2 bottom-right missing
  {
    id: 'corner3',
    shape: [[1, 1], [1, 0]],
    colorIndex: 3,
  },
  // Corner 2x2 bottom-left missing
  {
    id: 'corner4',
    shape: [[1, 1], [0, 1]],
    colorIndex: 3,
  },
  // Plus shape
  {
    id: 'plus',
    shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    colorIndex: 1,
  },
];

export function getRandomPiece() {
  const idx = Math.floor(Math.random() * ALL_PIECES.length);
  const piece = ALL_PIECES[idx];
  return {
    ...piece,
    color: PIECE_COLORS[piece.colorIndex],
    instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 6),
  };
}

export function getThreeRandomPieces() {
  return [getRandomPiece(), getRandomPiece(), getRandomPiece()];
}

export function getPieceWidth(piece) {
  return piece.shape[0].length;
}

export function getPieceHeight(piece) {
  return piece.shape.length;
}
