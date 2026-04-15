/**
 * GameBoard — renders the 10x10 grid.
 * Supports:
 *  - Empty cells (dark bg)
 *  - Filled cells (gradient with inner highlight)
 *  - Ghost cells while dragging (green = valid, red = invalid)
 *  - Line-clear flash animation on cleared rows/cols
 */
import React, { memo, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BOARD_SIZE, COLORS } from '../utils/constants';

// ─── Board ──────────────────────────────────────────────────────────────────

const GameBoard = memo(function GameBoard({
  board,
  cellSize,
  ghostCells = [],
  clearingRows = [],
  clearingCols = [],
}) {
  // Build a lookup set for fast ghost & clearing checks
  const ghostMap = useMemo(() => {
    const m = {};
    for (const g of ghostCells) {
      m[`${g.row},${g.col}`] = g.valid;
    }
    return m;
  }, [ghostCells]);

  const clearingSet = useMemo(() => {
    const s = new Set();
    for (const r of clearingRows) {
      for (let c = 0; c < BOARD_SIZE; c++) s.add(`${r},${c}`);
    }
    for (const c of clearingCols) {
      for (let r = 0; r < BOARD_SIZE; r++) s.add(`${r},${c}`);
    }
    return s;
  }, [clearingRows, clearingCols]);

  const cs = cellSize;
  const inner = cs - 1.5; // small gap between cells

  return (
    <View
      style={[
        styles.board,
        { width: cs * BOARD_SIZE, height: cs * BOARD_SIZE, borderRadius: cs * 0.35 },
      ]}
    >
      {Array.from({ length: BOARD_SIZE }, (_, r) =>
        Array.from({ length: BOARD_SIZE }, (_, c) => {
          const key = `${r},${c}`;
          const color = board[r][c];
          const ghostValid = ghostMap[key];
          const isGhost = key in ghostMap;
          const isClearing = clearingSet.has(key);

          return (
            <Cell
              key={key}
              r={r}
              c={c}
              color={color}
              isGhost={isGhost}
              ghostValid={ghostValid}
              isClearing={isClearing}
              cellSize={cs}
              innerSize={inner}
            />
          );
        })
      )}
    </View>
  );
});

// ─── Cell ────────────────────────────────────────────────────────────────────

const Cell = memo(function Cell({
  r, c, color, isGhost, ghostValid, isClearing, cellSize, innerSize,
}) {
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isClearing) {
      // Pulse bright on clearing
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 2,
          duration: 80,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isClearing]);

  const left = c * cellSize;
  const top = r * cellSize;
  const radius = Math.max(2, innerSize * 0.18);

  const baseStyle = {
    position: 'absolute',
    left,
    top,
    width: innerSize,
    height: innerSize,
    borderRadius: radius,
  };

  if (isClearing && color) {
    return (
      <Animated.View
        style={[
          baseStyle,
          {
            backgroundColor: '#ffffff',
            opacity: flashAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [0, 1, 1],
            }),
          },
        ]}
      />
    );
  }

  if (color) {
    return (
      <LinearGradient
        colors={color.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, styles.filledCell]}
      >
        <View style={[styles.innerHighlight, { borderRadius: Math.max(2, radius - 2) }]} />
      </LinearGradient>
    );
  }

  if (isGhost) {
    return (
      <View
        style={[
          baseStyle,
          {
            backgroundColor: ghostValid
              ? 'rgba(46,213,115,0.38)'
              : 'rgba(255,107,107,0.32)',
            borderWidth: 1.5,
            borderColor: ghostValid ? '#2ED573' : '#FF6B6B',
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        baseStyle,
        styles.emptyCell,
        { borderRadius: Math.max(1, radius * 0.7) },
      ]}
    />
  );
}, (prev, next) => {
  // Custom comparator — only re-render if this cell's data changed
  if (prev.isClearing !== next.isClearing) return false;
  if (prev.isGhost !== next.isGhost) return false;
  if (prev.ghostValid !== next.ghostValid) return false;
  if (prev.color !== next.color) return false;
  if (prev.cellSize !== next.cellSize) return false;
  return true;
});

export default GameBoard;

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: COLORS.boardBg,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
    overflow: 'hidden',
  },
  filledCell: {
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: '40%',
    bottom: '40%',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  emptyCell: {
    backgroundColor: COLORS.cellEmpty,
    borderWidth: 0.5,
    borderColor: COLORS.cellBorder,
  },
});
