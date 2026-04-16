import { useState, useRef, useCallback, useEffect } from "react";
import { View, PanResponder, Animated } from "react-native";
import { canPlacePiece, getBoardCells } from "../utils/gameHelpers";
import { BOARD_SIZE, ANIMATION_CONFIG } from "../utils/constants";
import type { Piece, GhostCell } from "../utils/types";
import type { GameState } from "../context/GameContext";
import type { SoundName } from "./useSounds";

const LIFT_OFFSET_Y = 30;

interface BoardLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoardCoords {
  row: number;
  col: number;
  cellSize: number;
}

export interface ParticleData {
  id: string;
  x: number;
  y: number;
  colors: string[];
}

interface UseDragAndDropOptions {
  pieces: (Piece | null)[];
  board: GameState["board"];
  isPaused?: boolean;
  onPlacePiece: (pieceIndex: number, row: number, col: number) => void;
  onTriggerHaptic: (type: "light" | "medium" | "heavy" | "error" | "success") => void;
  onPlaySound: (name: SoundName) => void;
  /** Fires with the screen-space centre of the placed piece (for score popup) */
  onDropPosition: (x: number, y: number) => void;
}

interface UseDragAndDropReturn {
  ghostCells: GhostCell[];
  activePieceIdx: number;
  particles: ParticleData[];
  responders: ReturnType<typeof PanResponder.create>[];
  dragX: Animated.Value[];
  dragY: Animated.Value[];
  dragScale: Animated.Value[];
  measureBoard: () => void;
  boardViewRef: React.RefObject<View | null>;
  handleBoardLayout: () => void;
}

function pageToBoard(
  pageX: number,
  pageY: number,
  piece: Piece,
  boardLayout: BoardLayout,
): BoardCoords | null {
  const { x, y, width } = boardLayout;
  if (width === 0) return null;
  const cellSize = width / BOARD_SIZE;
  const pCols = piece.shape[0].length;
  const pRows = piece.shape.length;

  const relX = pageX - x;
  const relY = pageY - y;

  const rawCol = Math.floor(relX / cellSize);
  const rawRow = Math.floor(relY / cellSize);

  const col = rawCol - Math.floor(pCols / 2);
  const row = rawRow - Math.floor(pRows / 2);

  return { row, col, cellSize };
}

function buildGhost(
  board: GameState["board"],
  piece: Piece,
  row: number,
  col: number,
): { cells: GhostCell[]; valid: boolean } {
  const valid = canPlacePiece(board, piece, row, col);
  const cells = getBoardCells(piece)
    .map((pos) => ({ row: row + pos.row, col: col + pos.col, valid }))
    .filter(
      (g) =>
        g.row >= 0 && g.row < BOARD_SIZE && g.col >= 0 && g.col < BOARD_SIZE,
    );
  return { cells, valid };
}

export function useDragAndDrop({
  pieces,
  board,
  isPaused = false,
  onPlacePiece,
  onTriggerHaptic,
  onPlaySound,
  onDropPosition,
}: UseDragAndDropOptions): UseDragAndDropReturn {
  const [ghostCells, setGhostCells] = useState<GhostCell[]>([]);
  const [activePieceIdx, setActivePieceIdx] = useState(-1);
  const [particles, setParticles] = useState<ParticleData[]>([]);

  const boardViewRef = useRef<View>(null);
  const boardLayout = useRef<BoardLayout>({ x: 0, y: 0, width: 0, height: 0 });
  const boardMeasured = useRef(false);

  const dragX = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const dragY = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const dragScale = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const drag = useRef({ active: false, idx: -1 });
  const piecesRef = useRef(pieces);
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const boardRef = useRef(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const measureBoard = useCallback(() => {
    if (!boardViewRef.current) return;
    boardViewRef.current.measure((_fx, _fy, w, h, px, py) => {
      if (w > 0) {
        boardLayout.current = { x: px, y: py, width: w, height: h };
        boardMeasured.current = true;
      }
    });
  }, []);

  const handleBoardLayout = useCallback(() => {
    requestAnimationFrame(measureBoard);
  }, [measureBoard]);

  const snapBack = useCallback(
    (idx: number) => {
      Animated.parallel([
        Animated.spring(dragX[idx], {
          toValue: 0,
          ...ANIMATION_CONFIG.DRAG_SPRING,
          useNativeDriver: true,
        }),
        Animated.spring(dragY[idx], {
          toValue: 0,
          ...ANIMATION_CONFIG.DRAG_SPRING,
          useNativeDriver: true,
        }),
        Animated.spring(dragScale[idx], {
          toValue: 1,
          ...ANIMATION_CONFIG.SCALE_RESET_SPRING,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [dragX, dragY, dragScale],
  );

  const resetInstant = useCallback(
    (idx: number) => {
      dragX[idx].setValue(0);
      dragY[idx].setValue(0);
      dragScale[idx].setValue(1);
    },
    [dragX, dragY, dragScale],
  );

  const createResponder = useCallback(
    (slotIdx: number) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => !!piecesRef.current[slotIdx] && !isPausedRef.current,
        onMoveShouldSetPanResponder: () => !!piecesRef.current[slotIdx] && !isPausedRef.current,

        onPanResponderGrant: () => {
          const piece = piecesRef.current[slotIdx];
          if (!piece) return;
          drag.current = { active: true, idx: slotIdx };
          setActivePieceIdx(slotIdx);
          onTriggerHaptic("light");
          onPlaySound("select");

          Animated.spring(dragScale[slotIdx], {
            toValue: 1.15,
            ...ANIMATION_CONFIG.SCALE_UP_SPRING,
            useNativeDriver: true,
          }).start();

          if (!boardMeasured.current) measureBoard();
        },

        onPanResponderMove: (evt, gs) => {
          if (!drag.current.active || drag.current.idx !== slotIdx) return;

          dragX[slotIdx].setValue(gs.dx);
          dragY[slotIdx].setValue(gs.dy - LIFT_OFFSET_Y);

          const { pageX, pageY } = evt.nativeEvent;
          const piece = piecesRef.current[slotIdx];
          if (!piece || !boardMeasured.current) return;

          const coords = pageToBoard(
            pageX,
            pageY - LIFT_OFFSET_Y,
            piece,
            boardLayout.current,
          );
          if (!coords) return;

          const { cells } = buildGhost(boardRef.current, piece, coords.row, coords.col);
          setGhostCells(cells);
        },

        onPanResponderRelease: (evt) => {
          if (!drag.current.active || drag.current.idx !== slotIdx) return;
          drag.current.active = false;

          const { pageX, pageY } = evt.nativeEvent;
          const piece = piecesRef.current[slotIdx];

          setGhostCells([]);
          setActivePieceIdx(-1);

          if (!piece || !boardMeasured.current) {
            snapBack(slotIdx);
            return;
          }

          const coords = pageToBoard(
            pageX,
            pageY - LIFT_OFFSET_Y,
            piece,
            boardLayout.current,
          );
          if (!coords) {
            snapBack(slotIdx);
            return;
          }

          const { row, col } = coords;
          const valid = canPlacePiece(boardRef.current, piece, row, col);

          if (valid) {
            onTriggerHaptic("medium");
            onPlaySound("place");
            resetInstant(slotIdx);

            const { x: bx, y: by, width: bw } = boardLayout.current;
            const cs = bw / BOARD_SIZE;
            const pCols = piece.shape[0].length;
            const pRows = piece.shape.length;
            const particleX = bx + (col + pCols / 2) * cs;
            const particleY = by + (row + pRows / 2) * cs;

            // Signal drop position before dispatch so GameScreen can pair it
            // with the upcoming lastScore state update
            onDropPosition(particleX, particleY);
            onPlacePiece(slotIdx, row, col);
            const pid = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
            setParticles((prev) => [
              ...prev,
              {
                id: pid,
                x: particleX,
                y: particleY,
                colors: piece.color.gradient,
              },
            ]);
            setTimeout(
              () => setParticles((prev) => prev.filter((p) => p.id !== pid)),
              1100,
            );
          } else {
            onTriggerHaptic("error");
            onPlaySound("invalid");
            snapBack(slotIdx);
          }
        },

        onPanResponderTerminate: () => {
          if (drag.current.idx === slotIdx) {
            drag.current.active = false;
            setGhostCells([]);
            setActivePieceIdx(-1);
            snapBack(slotIdx);
          }
        },
      });
    },
    [
      dragX,
      dragY,
      dragScale,
      measureBoard,
      onTriggerHaptic,
      onPlaySound,
      onDropPosition,
      onPlacePiece,
      resetInstant,
      snapBack,
    ],
  );

  const responders = useRef([
    createResponder(0),
    createResponder(1),
    createResponder(2),
  ]).current;

  return {
    ghostCells,
    activePieceIdx,
    particles,
    responders,
    dragX,
    dragY,
    dragScale,
    measureBoard,
    boardViewRef,
    handleBoardLayout,
  };
}
