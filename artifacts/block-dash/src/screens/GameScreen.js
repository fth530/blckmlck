import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
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

import { BOARD_SIZE, COLORS, CELL_SIZE, PIECE_COLORS } from '../utils/constants';
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

const TRAY_CELL_SIZE = 28;
const DRAG_SCALE = 1.1;

export default function GameScreen({ resume = false }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, placePieceAction, confirmGameOver, clearLastLines, initGame } = useGame();
  const { trigger } = useHaptics();

  const boardRef = useRef(null);
  const boardLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const dragState = useRef({
    active: false,
    pieceIndex: -1,
    offsetX: 0,
    offsetY: 0,
  });

  const piecePositions = useRef([
    { x: new RNAnimated.Value(0), y: new RNAnimated.Value(0) },
    { x: new RNAnimated.Value(0), y: new RNAnimated.Value(0) },
    { x: new RNAnimated.Value(0), y: new RNAnimated.Value(0) },
  ]);

  const pieceScales = useRef([
    new RNAnimated.Value(1),
    new RNAnimated.Value(1),
    new RNAnimated.Value(1),
  ]);

  const [ghostCells, setGhostCells] = useState([]);
  const [ghostValid, setGhostValid] = useState(false);
  const [activePieceIndex, setActivePieceIndex] = useState(-1);
  const [particles, setParticles] = useState([]);
  const [showGameOver, setShowGameOver] = useState(false);
  const trayRef = useRef(null);
  const trayLayouts = useRef([null, null, null]);
  const [trayMeasured, setTrayMeasured] = useState(false);

  // Board layout measuring
  const handleBoardLayout = useCallback(() => {
    if (boardRef.current) {
      boardRef.current.measure((fx, fy, w, h, px, py) => {
        boardLayout.current = { x: px, y: py, width: w, height: h };
        const cs = Math.floor(w / BOARD_SIZE);
        setCellSize(cs);
      });
    }
  }, []);

  // Convert screen coords to board row/col
  const screenToBoard = useCallback((sx, sy) => {
    const { x, y, width } = boardLayout.current;
    const cs = width / BOARD_SIZE;
    const col = Math.floor((sx - x) / cs);
    const row = Math.floor((sy - y) / cs);
    return { row, col };
  }, []);

  // Show ghost
  const updateGhost = useCallback((sx, sy, pieceIndex) => {
    const piece = state.pieces[pieceIndex];
    if (!piece) return;

    const { row, col } = screenToBoard(sx, sy);
    const pRows = piece.shape.length;
    const pCols = piece.shape[0].length;
    const adjustedRow = row - Math.floor(pRows / 2);
    const adjustedCol = col - Math.floor(pCols / 2);

    const valid = canPlacePiece(state.board, piece, adjustedRow, adjustedCol);
    const cells = getBoardCells(piece).map(({ r, c }) => ({
      row: adjustedRow + r,
      col: adjustedCol + c,
      color: piece.color,
      valid,
    })).filter(({ row: r, col: c }) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE);

    setGhostCells(cells);
    setGhostValid(valid);
    return { adjustedRow, adjustedCol, valid };
  }, [state.board, state.pieces, screenToBoard]);

  // Tray piece positions (measure each slot)
  const getTrayPieceLayout = useCallback((pieceIndex) => {
    return new Promise((resolve) => {
      if (trayLayouts.current[pieceIndex]) {
        resolve(trayLayouts.current[pieceIndex]);
        return;
      }
      resolve({ x: 0, y: 0, width: 100, height: 100 });
    });
  }, []);

  const createPieceResponder = useCallback((pieceIndex) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => state.pieces[pieceIndex] !== null,
      onMoveShouldSetPanResponder: () => state.pieces[pieceIndex] !== null,

      onPanResponderGrant: (evt) => {
        if (!state.pieces[pieceIndex]) return;
        const { pageX, pageY } = evt.nativeEvent;
        trigger('light');
        dragState.current = {
          active: true,
          pieceIndex,
          startX: pageX,
          startY: pageY,
        };
        setActivePieceIndex(pieceIndex);

        RNAnimated.spring(pieceScales.current[pieceIndex], {
          toValue: DRAG_SCALE,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderMove: (evt, gs) => {
        if (!dragState.current.active) return;
        const { pageX, pageY } = evt.nativeEvent;

        piecePositions.current[pieceIndex].x.setValue(gs.dx);
        piecePositions.current[pieceIndex].y.setValue(gs.dy);

        const ghostInfo = updateGhost(pageX, pageY, pieceIndex);
        if (ghostInfo) {
          // Haptic on entering valid zone
        }
      },

      onPanResponderRelease: (evt) => {
        if (!dragState.current.active) return;
        const { pageX, pageY } = evt.nativeEvent;
        dragState.current.active = false;

        const piece = state.pieces[pieceIndex];
        if (!piece) return;

        const { row, col } = screenToBoard(pageX, pageY);
        const pRows = piece.shape.length;
        const pCols = piece.shape[0].length;
        const adjustedRow = row - Math.floor(pRows / 2);
        const adjustedCol = col - Math.floor(pCols / 2);

        const valid = canPlacePiece(state.board, piece, adjustedRow, adjustedCol);

        if (valid) {
          trigger('medium');
          // Animate snap back
          RNAnimated.parallel([
            RNAnimated.spring(piecePositions.current[pieceIndex].x, {
              toValue: 0, tension: 300, friction: 12, useNativeDriver: true,
            }),
            RNAnimated.spring(piecePositions.current[pieceIndex].y, {
              toValue: 0, tension: 300, friction: 12, useNativeDriver: true,
            }),
            RNAnimated.spring(pieceScales.current[pieceIndex], {
              toValue: 1, tension: 200, friction: 8, useNativeDriver: true,
            }),
          ]).start();

          placePieceAction(pieceIndex, adjustedRow, adjustedCol);

          // Particles at board position
          const { x: bx, y: by, width: bw } = boardLayout.current;
          const cs = bw / BOARD_SIZE;
          const particleX = bx + (adjustedCol + pCols / 2) * cs;
          const particleY = by + (adjustedRow + pRows / 2) * cs;
          const pid = Date.now().toString() + Math.random().toString(36).substr(2, 4);
          setParticles(prev => [...prev, { id: pid, x: particleX, y: particleY, colors: piece.color.gradient }]);
          setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 1000);
        } else {
          trigger('error');
          // Animate piece back to tray
          RNAnimated.parallel([
            RNAnimated.spring(piecePositions.current[pieceIndex].x, {
              toValue: 0, tension: 150, friction: 8, useNativeDriver: true,
            }),
            RNAnimated.spring(piecePositions.current[pieceIndex].y, {
              toValue: 0, tension: 150, friction: 8, useNativeDriver: true,
            }),
            RNAnimated.spring(pieceScales.current[pieceIndex], {
              toValue: 1, tension: 200, friction: 8, useNativeDriver: true,
            }),
          ]).start();
        }

        setGhostCells([]);
        setActivePieceIndex(-1);
      },

      onPanResponderTerminate: () => {
        RNAnimated.parallel([
          RNAnimated.spring(piecePositions.current[pieceIndex].x, { toValue: 0, tension: 150, friction: 8, useNativeDriver: true }),
          RNAnimated.spring(piecePositions.current[pieceIndex].y, { toValue: 0, tension: 150, friction: 8, useNativeDriver: true }),
          RNAnimated.spring(pieceScales.current[pieceIndex], { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
        ]).start();
        setGhostCells([]);
        setActivePieceIndex(-1);
        dragState.current.active = false;
      },
    });
  }, [state.pieces, state.board, trigger, updateGhost, placePieceAction, screenToBoard]);

  const responders = useMemo(() => [
    createPieceResponder(0),
    createPieceResponder(1),
    createPieceResponder(2),
  ], [state.pieces, state.board]);

  // Game over trigger
  useEffect(() => {
    if (state.isGameOver && !showGameOver) {
      const timeout = setTimeout(() => {
        trigger('heavy');
        confirmGameOver(state);
        setShowGameOver(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state.isGameOver]);

  // Line clear haptic
  useEffect(() => {
    if (state.lastClearedLines) {
      const total = (state.lastClearedLines.rows?.length || 0) + (state.lastClearedLines.cols?.length || 0);
      if (total > 0) trigger('success');
      clearLastLines();
    }
  }, [state.lastClearedLines]);

  // Auto-save
  useEffect(() => {
    if (!state.isGameOver && state.score > 0) {
      saveGame(state);
    }
  }, [state.score, state.isGameOver]);

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

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const paddingBottom = Platform.OS === 'web' ? 34 : insets.bottom;

  // Compute board size that fits the screen
  const availableHeight = SCREEN_HEIGHT - paddingTop - paddingBottom - 200; // header + tray
  const availableWidth = SCREEN_WIDTH - 32;
  const boardDim = Math.min(availableWidth, availableHeight);

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Particles */}
      {particles.map(p => (
        <ParticleEffect key={p.id} x={p.x} y={p.y} colors={p.colors} />
      ))}

      {/* Header */}
      <View style={[styles.header, { paddingTop: paddingTop + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
          <Feather name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <ScoreBoard score={state.score} highScore={state.highScore} />
        <View style={styles.headerBtn} />
      </View>

      {/* Combo indicator */}
      <View style={styles.comboRow}>
        <ComboIndicator comboCount={state.comboCount} />
      </View>

      {/* Game board */}
      <View style={styles.boardContainer}>
        <View
          ref={boardRef}
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

      {/* Piece tray */}
      <View style={[styles.tray, { paddingBottom: paddingBottom + 16 }]}>
        {state.pieces.map((piece, idx) => (
          <TrayPiece
            key={piece ? piece.instanceId : `empty-${idx}`}
            piece={piece}
            pieceIndex={idx}
            responder={responders[idx]}
            translateX={piecePositions.current[idx].x}
            translateY={piecePositions.current[idx].y}
            scale={pieceScales.current[idx]}
            isActive={activePieceIndex === idx}
          />
        ))}
      </View>

      {/* Game Over Modal */}
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

function TrayPiece({ piece, responder, translateX, translateY, scale, isActive }) {
  const cellSize = TRAY_CELL_SIZE;

  if (!piece) {
    return <View style={styles.traySlot} />;
  }

  const pieceWidth = piece.shape[0].length * cellSize;
  const pieceHeight = piece.shape.length * cellSize;
  const maxDim = 5 * cellSize;

  return (
    <View style={[styles.traySlot]}>
      <RNAnimated.View
        {...responder.panHandlers}
        style={{
          transform: [{ translateX }, { translateY }, { scale }],
          zIndex: isActive ? 100 : 1,
        }}
      >
        <View style={[styles.pieceWrapper, { width: maxDim, height: maxDim, alignItems: 'center', justifyContent: 'center' }]}>
          <BlockPiece
            piece={piece}
            cellSize={cellSize}
          />
        </View>
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboRow: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tray: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(13,13,26,0.8)',
  },
  traySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 5 * TRAY_CELL_SIZE + 16,
  },
  pieceWrapper: {},
});
