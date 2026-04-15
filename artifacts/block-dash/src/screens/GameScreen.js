/**
 * GameScreen — Block Dash main gameplay screen.
 *
 * Drag-and-drop design:
 *  - PanResponders are created once per tray slot (via useRef) and read
 *    current game state from a stateRef — this avoids expensive re-creation
 *    on every board change while still seeing fresh state.
 *  - Board absolute position is measured after layout with boardRef.measure(),
 *    stored in boardLayout ref so coordinate transforms are always up-to-date.
 *  - Ghost preview centers the piece under the finger (top-left offset by
 *    half the piece dimensions). We show a full green/red ghost for the entire
 *    piece shape.
 *  - On valid drop: piece is placed immediately, ghost cleared, animations
 *    reset. On invalid drop: spring animation bounces piece back to tray.
 */

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BOARD_SIZE, COLORS } from '../utils/constants';
import { canPlacePiece, getBoardCells } from '../utils/gameHelpers';
import { useGame } from '../context/GameContext';
import { useHaptics } from '../hooks/useHaptics';
import GameBoard from '../components/GameBoard';
import BlockPiece from '../components/BlockPiece';
import ScoreBoard from '../components/ScoreBoard';
import ComboIndicator from '../components/ComboIndicator';
import GameOverModal from '../components/GameOverModal';
import ParticleEffect from '../components/ParticleEffect';
import { saveGame } from '../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cell size used in the tray piece display
const TRAY_CELL_SIZE = 30;
// How far above finger to float piece while dragging (px)
const LIFT_OFFSET_Y = 30;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert absolute page coords to board (row, col), centering the piece. */
function pageToBoard(pageX, pageY, piece, boardLayout) {
  const { x, y, width } = boardLayout;
  if (width === 0) return null;
  const cellSize = width / BOARD_SIZE;
  const pCols = piece.shape[0].length;
  const pRows = piece.shape.length;

  // Position of finger relative to board
  const relX = pageX - x;
  const relY = pageY - y;

  // Raw cell under finger
  const rawCol = Math.floor(relX / cellSize);
  const rawRow = Math.floor(relY / cellSize);

  // Offset to center piece on finger
  const col = rawCol - Math.floor(pCols / 2);
  const row = rawRow - Math.floor(pRows / 2);

  return { row, col, cellSize };
}

/** Build ghost cell list from a board position. */
function buildGhost(board, piece, row, col) {
  const valid = canPlacePiece(board, piece, row, col);
  const cells = getBoardCells(piece)
    .map(({ r, c }) => ({
      row: row + r,
      col: col + c,
      valid,
    }))
    .filter(g => g.row >= 0 && g.row < BOARD_SIZE && g.col >= 0 && g.col < BOARD_SIZE);
  return { cells, valid };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, placePieceAction, confirmGameOver, clearLastLines, initGame } = useGame();
  const { trigger } = useHaptics();

  // Keep a ref of current state so PanResponder callbacks always see fresh values
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const placePieceRef = useRef(placePieceAction);
  useEffect(() => { placePieceRef.current = placePieceAction; }, [placePieceAction]);

  // Board absolute position — measured after layout
  const boardViewRef = useRef(null);
  const boardLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [boardCellSize, setBoardCellSize] = useState(32);
  const boardMeasured = useRef(false);

  // Drag animation values (one set per tray slot, created once)
  const dragX = useRef([
    new RNAnimated.Value(0),
    new RNAnimated.Value(0),
    new RNAnimated.Value(0),
  ]).current;
  const dragY = useRef([
    new RNAnimated.Value(0),
    new RNAnimated.Value(0),
    new RNAnimated.Value(0),
  ]).current;
  const dragScale = useRef([
    new RNAnimated.Value(1),
    new RNAnimated.Value(1),
    new RNAnimated.Value(1),
  ]).current;

  // Ghost / UI state
  const [ghostCells, setGhostCells] = useState([]);
  const [activePieceIdx, setActivePieceIdx] = useState(-1);
  const [particles, setParticles] = useState([]);
  const [showGameOver, setShowGameOver] = useState(false);

  // Track drag in ref to avoid stale closures inside PanResponder
  const drag = useRef({ active: false, idx: -1 });

  // Measure board absolute position
  const measureBoard = useCallback(() => {
    if (!boardViewRef.current) return;
    boardViewRef.current.measure((fx, fy, w, h, px, py) => {
      if (w > 0) {
        boardLayout.current = { x: px, y: py, width: w, height: h };
        const cs = w / BOARD_SIZE;
        setBoardCellSize(cs);
        boardMeasured.current = true;
      }
    });
  }, []);

  const handleBoardLayout = useCallback(() => {
    // Slight delay to ensure layout has settled
    requestAnimationFrame(measureBoard);
  }, [measureBoard]);

  // ─── Animation helpers ─────────────────────────────────────────────────

  const snapBack = useCallback((idx) => {
    RNAnimated.parallel([
      RNAnimated.spring(dragX[idx], { toValue: 0, tension: 180, friction: 9, useNativeDriver: true }),
      RNAnimated.spring(dragY[idx], { toValue: 0, tension: 180, friction: 9, useNativeDriver: true }),
      RNAnimated.spring(dragScale[idx], { toValue: 1, tension: 220, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [dragX, dragY, dragScale]);

  const resetInstant = useCallback((idx) => {
    dragX[idx].setValue(0);
    dragY[idx].setValue(0);
    dragScale[idx].setValue(1);
  }, [dragX, dragY, dragScale]);

  // ─── Create PanResponders (once per slot) ──────────────────────────────

  const createResponder = useCallback((slotIdx) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return !!stateRef.current.pieces[slotIdx];
      },
      onMoveShouldSetPanResponder: () => {
        return !!stateRef.current.pieces[slotIdx];
      },
      onPanResponderGrant: () => {
        const piece = stateRef.current.pieces[slotIdx];
        if (!piece) return;
        drag.current = { active: true, idx: slotIdx };
        setActivePieceIdx(slotIdx);
        trigger('light');

        RNAnimated.spring(dragScale[slotIdx], {
          toValue: 1.15,
          tension: 300,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Re-measure board position every drag start (handles scroll/resize)
        if (!boardMeasured.current) measureBoard();
      },

      onPanResponderMove: (evt, gs) => {
        if (!drag.current.active || drag.current.idx !== slotIdx) return;

        dragX[slotIdx].setValue(gs.dx);
        // Offset upward so finger doesn't hide the piece
        dragY[slotIdx].setValue(gs.dy - LIFT_OFFSET_Y);

        // Update ghost
        const { pageX, pageY } = evt.nativeEvent;
        const piece = stateRef.current.pieces[slotIdx];
        if (!piece || !boardMeasured.current) return;

        const coords = pageToBoard(pageX, pageY - LIFT_OFFSET_Y, piece, boardLayout.current);
        if (!coords) return;

        const { row, col } = coords;
        const { cells } = buildGhost(stateRef.current.board, piece, row, col);
        setGhostCells(cells);
      },

      onPanResponderRelease: (evt) => {
        if (!drag.current.active || drag.current.idx !== slotIdx) return;
        drag.current.active = false;

        const { pageX, pageY } = evt.nativeEvent;
        const piece = stateRef.current.pieces[slotIdx];

        setGhostCells([]);
        setActivePieceIdx(-1);

        if (!piece || !boardMeasured.current) {
          snapBack(slotIdx);
          return;
        }

        const coords = pageToBoard(pageX, pageY - LIFT_OFFSET_Y, piece, boardLayout.current);
        if (!coords) {
          snapBack(slotIdx);
          return;
        }

        const { row, col } = coords;
        const valid = canPlacePiece(stateRef.current.board, piece, row, col);

        if (valid) {
          trigger('medium');
          resetInstant(slotIdx);

          // Dispatch placement
          placePieceRef.current(slotIdx, row, col);

          // Particle burst at center of piece on board
          const { x: bx, y: by, width: bw } = boardLayout.current;
          const cs = bw / BOARD_SIZE;
          const pCols = piece.shape[0].length;
          const pRows = piece.shape.length;
          const particleX = bx + (col + pCols / 2) * cs;
          const particleY = by + (row + pRows / 2) * cs;
          const pid = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
          setParticles(prev => [...prev, { id: pid, x: particleX, y: particleY, colors: piece.color.gradient }]);
          setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 1100);
        } else {
          trigger('error');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Created once — reads state via stateRef

  // Create responders once on mount
  const responders = useRef([
    createResponder(0),
    createResponder(1),
    createResponder(2),
  ]).current;

  // ─── Side-effects ──────────────────────────────────────────────────────

  // Game over
  useEffect(() => {
    if (state.isGameOver && !showGameOver) {
      const t = setTimeout(() => {
        trigger('heavy');
        confirmGameOver(state);
        setShowGameOver(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [state.isGameOver]);

  // Line clear haptic + particles on row/col clears
  useEffect(() => {
    if (state.lastClearedLines) {
      const total =
        (state.lastClearedLines.rows?.length || 0) +
        (state.lastClearedLines.cols?.length || 0);
      if (total > 0) trigger('success');
      clearLastLines();
    }
  }, [state.lastClearedLines]);

  // Auto-save
  useEffect(() => {
    if (!state.isGameOver && state.score > 0) {
      saveGame(state);
    }
  }, [state.score]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false);
    initGame(state.highScore);
  }, [state.highScore, initGame]);

  const handleHome = useCallback(() => {
    setShowGameOver(false);
    router.replace('/');
  }, [router]);

  const handleBack = useCallback(() => {
    router.replace('/');
  }, [router]);

  // ─── Layout ─────────────────────────────────────────────────────────────

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const paddingBottom = Platform.OS === 'web' ? 34 : insets.bottom;

  const trayHeight = TRAY_CELL_SIZE * 5 + 28;
  const headerH = 72;
  const comboH = 38;
  const availH = SCREEN_HEIGHT - paddingTop - headerH - comboH - trayHeight - paddingBottom - 24;
  const availW = SCREEN_WIDTH - 24;
  const boardDim = Math.min(availW, availH);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d1a', '#13132a', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Particle effects */}
      {particles.map(p => (
        <ParticleEffect key={p.id} x={p.x} y={p.y} colors={p.colors} />
      ))}

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: paddingTop + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <ScoreBoard score={state.score} highScore={state.highScore} />
        <View style={styles.iconBtn} />
      </View>

      {/* ── Combo indicator ────────────────────────────────── */}
      <View style={styles.comboRow}>
        <ComboIndicator comboCount={state.comboCount} />
      </View>

      {/* ── Board ──────────────────────────────────────────── */}
      <View style={styles.boardContainer}>
        <View
          ref={boardViewRef}
          onLayout={handleBoardLayout}
          style={{ width: boardDim, height: boardDim }}
        >
          <GameBoard
            board={state.board}
            cellSize={boardDim / BOARD_SIZE}
            ghostCells={ghostCells}
          />
        </View>
      </View>

      {/* ── Piece tray ─────────────────────────────────────── */}
      <View style={[styles.tray, { paddingBottom: paddingBottom + 12 }]}>
        {[0, 1, 2].map(idx => (
          <TraySlot
            key={idx}
            piece={state.pieces[idx]}
            responder={responders[idx]}
            translateX={dragX[idx]}
            translateY={dragY[idx]}
            scale={dragScale[idx]}
            isActive={activePieceIdx === idx}
          />
        ))}
      </View>

      {/* ── Game Over ──────────────────────────────────────── */}
      <GameOverModal
        visible={showGameOver}
        score={state.score}
        highScore={state.highScore}
        isNewHighScore={state.isNewHighScore}
        linesCleared={state.linesCleared}
        maxCombo={state.maxCombo}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    </View>
  );
}

// ─── TraySlot ───────────────────────────────────────────────────────────────

function TraySlot({ piece, responder, translateX, translateY, scale, isActive }) {
  const SLOT_DIM = TRAY_CELL_SIZE * 5;

  return (
    <View style={[styles.traySlot, { width: SLOT_DIM, height: SLOT_DIM }]}>
      {piece ? (
        <RNAnimated.View
          {...responder.panHandlers}
          style={[
            styles.draggable,
            {
              zIndex: isActive ? 999 : 1,
              elevation: isActive ? 20 : 1,
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}
        >
          {/* Centering wrapper */}
          <View style={[styles.pieceCenter, { width: SLOT_DIM, height: SLOT_DIM }]}>
            <BlockPiece piece={piece} cellSize={TRAY_CELL_SIZE} />
          </View>
        </RNAnimated.View>
      ) : (
        // Used-up slot — faint placeholder
        <View style={styles.emptySlot} />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboRow: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tray: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(10,10,24,0.85)',
  },
  traySlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggable: {
    position: 'absolute',
  },
  pieceCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
  },
});
