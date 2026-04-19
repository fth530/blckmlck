/**
 * GameBoard — renders the 10x10 grid.
 * Supports:
 *  - Empty cells (dark bg)
 *  - Filled cells (gradient with inner highlight)
 *  - Ghost cells while dragging (green = valid, red = invalid)
 *  - Line-clear flash animation on cleared rows/cols
 */
import React, { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Board, Cell as BoardCell, GhostCell } from '../utils/types';
import { BOARD_SIZE, COLORS, CB_COLOR_BY_NAME, ANIMATION_CONFIG } from '../utils/constants';

// ─── GameBoard ───────────────────────────────────────────────────────────────

interface GameBoardProps {
  board: Board;
  cellSize: number;
  ghostCells?: GhostCell[];
  clearingRows?: number[];
  clearingCols?: number[];
  colorblind?: boolean;
  boardBg?: string;
  cellBorder?: string;
  cellEmpty?: string;
}

const GameBoard = memo(function GameBoard({
  board,
  cellSize,
  ghostCells = [],
  clearingRows = [],
  clearingCols = [],
  colorblind = false,
  boardBg = COLORS.boardBg,
  cellBorder = COLORS.cellBorder,
  cellEmpty = COLORS.cellEmpty,
}: GameBoardProps) {
  const ghostMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const g of ghostCells) {
      m[`${g.row},${g.col}`] = g.valid;
    }
    return m;
  }, [ghostCells]);

  const clearingSet = useMemo(() => {
    const s = new Set<string>();
    for (const r of clearingRows) {
      for (let c = 0; c < BOARD_SIZE; c++) s.add(`${r},${c}`);
    }
    for (const c of clearingCols) {
      for (let r = 0; r < BOARD_SIZE; r++) s.add(`${r},${c}`);
    }
    return s;
  }, [clearingRows, clearingCols]);

  // Single pulsing Animated.Value shared by all ghost cells
  const ghostPulse = useRef(new Animated.Value(1)).current;
  const ghostLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const hasGhosts = ghostCells.length > 0;

  useEffect(() => {
    if (hasGhosts) {
      ghostPulse.setValue(1);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(ghostPulse, {
            toValue: 0.4,
            duration: ANIMATION_CONFIG.GHOST_PULSE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(ghostPulse, {
            toValue: 1,
            duration: ANIMATION_CONFIG.GHOST_PULSE_MS,
            useNativeDriver: true,
          }),
        ]),
      );
      ghostLoopRef.current = loop;
      loop.start();
    } else {
      ghostPulse.setValue(1);
      if (ghostLoopRef.current) {
        ghostLoopRef.current.stop();
        ghostLoopRef.current = null;
      }
    }
    return () => {
      if (ghostLoopRef.current) ghostLoopRef.current.stop();
    };
  }, [hasGhosts]);

  const cs = cellSize;
  const inner = cs - 1.5;

  return (
    <View
      style={[
        styles.board,
        {
          width: cs * BOARD_SIZE,
          height: cs * BOARD_SIZE,
          borderRadius: cs * 0.35,
          backgroundColor: boardBg,
          borderColor: cellBorder,
        },
      ]}
      accessibilityRole="grid"
      accessibilityLabel={`Game board, ${BOARD_SIZE} by ${BOARD_SIZE}`}
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
              colorblind={colorblind}
              ghostPulse={ghostPulse}
              themeCellEmpty={cellEmpty}
              themeCellBorder={cellBorder}
            />
          );
        })
      )}
    </View>
  );
});

// ─── Cell ────────────────────────────────────────────────────────────────────

interface CellProps {
  r: number;
  c: number;
  color: BoardCell;
  isGhost: boolean;
  ghostValid: boolean | undefined;
  isClearing: boolean;
  cellSize: number;
  innerSize: number;
  colorblind: boolean;
  ghostPulse: Animated.Value;
  themeCellEmpty: string;
  themeCellBorder: string;
}

const Cell = memo(function Cell({
  r, c, color, isGhost, ghostValid, isClearing, cellSize, innerSize, colorblind, ghostPulse, themeCellEmpty, themeCellBorder,
}: CellProps) {
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isClearing) {
      // Diagonal wave: cells closer to top-left flash first
      const staggerDelay = (r + c) * 18;
      Animated.sequence([
        Animated.delay(staggerDelay),
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
    position: 'absolute' as const,
    left,
    top,
    width: innerSize,
    height: innerSize,
    borderRadius: radius,
  };

  const cbEntry = colorblind && color ? CB_COLOR_BY_NAME[color.name] : null;
  const displayColor = cbEntry ? cbEntry.color : color;
  const pattern = cbEntry ? cbEntry.pattern : null;
  const patternSize = Math.max(7, innerSize * 0.34);

  // Screen-reader label: "Row 3, Column 5, red block" or "Row 1, Column 1, empty"
  const a11yLabel = color
    ? `Row ${r + 1}, Column ${c + 1}, ${color.name} block`
    : isGhost
    ? `Row ${r + 1}, Column ${c + 1}, ${ghostValid ? 'valid' : 'invalid'} placement`
    : `Row ${r + 1}, Column ${c + 1}, empty`;

  if (isClearing && color) {
    return (
      <Animated.View
        accessible
        accessibilityLabel={a11yLabel}
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

  if (displayColor) {
    return (
      <LinearGradient
        accessible
        accessibilityLabel={a11yLabel}
        colors={displayColor.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, styles.filledCell]}
      >
        <View style={[styles.innerHighlight, { borderRadius: Math.max(2, radius - 2) }]} />
        {pattern && (
          <Text style={[styles.pattern, { fontSize: patternSize }]}>{pattern}</Text>
        )}
      </LinearGradient>
    );
  }

  if (isGhost) {
    return (
      <Animated.View
        accessible
        accessibilityLabel={a11yLabel}
        style={[
          baseStyle,
          {
            opacity: ghostPulse,
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
      accessible
      accessibilityLabel={a11yLabel}
      style={[
        baseStyle,
        {
          backgroundColor: themeCellEmpty,
          borderWidth: 0.5,
          borderColor: themeCellBorder,
          borderRadius: Math.max(1, radius * 0.7),
        },
      ]}
    />
  );
}, (prev, next) => {
  if (prev.isClearing !== next.isClearing) return false;
  if (prev.isGhost !== next.isGhost) return false;
  if (prev.ghostValid !== next.ghostValid) return false;
  if (prev.color !== next.color) return false;
  if (prev.cellSize !== next.cellSize) return false;
  if (prev.colorblind !== next.colorblind) return false;
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
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'rgba(0,0,0,0.40)',
    fontWeight: '900',
  },
  emptyCell: {
    backgroundColor: COLORS.cellEmpty,
    borderWidth: 0.5,
    borderColor: COLORS.cellBorder,
  },
});
