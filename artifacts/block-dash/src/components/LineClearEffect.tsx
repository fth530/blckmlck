/**
 * LineClearEffect — Spectacular line-clear explosion overlay.
 *
 * Rendered absolutely on top of the board. Shows the cleared cells
 * (captured before the board state was wiped) exploding outward,
 * then calls onDone() so GameScreen can clear the lastClearedLines state.
 *
 * Uses react-native-reanimated (UI thread) for 60fps on all devices.
 */
import React, { useEffect, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BOARD_SIZE } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

interface ClearedCell {
  row: number;
  col: number;
  gradient: string[];
}

interface LineClearEffectProps {
  cells: ClearedCell[];
  cellSize: number;
  clearingRows: number[];
  clearingCols: number[];
  onDone: () => void;
}

const TOTAL_MS = 480;

// ─── Overlay flash ────────────────────────────────────────────────────────────

const FlashOverlay = memo(function FlashOverlay({ color }: { color: string }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.55, { duration: 60, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 280, easing: Easing.in(Easing.cubic) }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: color }, style]}
    />
  );
});

// ─── Laser stripe across a cleared row or column ──────────────────────────────

interface LaserProps {
  index: number;
  isRow: boolean;
  cellSize: number;
  boardSize: number;
  color: string;
  delay: number;
}

const LaserStripe = memo(function LaserStripe({
  index, isRow, cellSize, boardSize, color, delay,
}: LaserProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.9, { duration: 55, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }),
      ),
    );
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 60, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: isRow
      ? [{ scaleX: scale.value }]
      : [{ scaleY: scale.value }],
  }));

  const pos = index * cellSize;
  const thick = cellSize * 1.1;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animStyle,
        isRow
          ? { position: 'absolute', left: 0, top: pos, width: boardSize, height: thick }
          : { position: 'absolute', top: 0, left: pos, width: thick, height: boardSize },
      ]}
    >
      <LinearGradient
        colors={['transparent', color + 'FF', color + 'FF', 'transparent']}
        start={isRow ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
        end={isRow ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
});

// ─── Single exploding cell ────────────────────────────────────────────────────

interface ExplodingCellProps {
  row: number;
  col: number;
  gradient: string[];
  cellSize: number;
  delay: number;
}

const ExplodingCell = memo(function ExplodingCell({
  row, col, gradient, cellSize, delay,
}: ExplodingCellProps) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(1);
  const tx      = useSharedValue(0);
  const ty      = useSharedValue(0);

  useEffect(() => {
    // Direction: fly away from the board center
    const centerR = (BOARD_SIZE - 1) / 2;
    const centerC = (BOARD_SIZE - 1) / 2;
    const angle   = Math.atan2(row - centerR, col - centerC);
    const dist    = cellSize * 2.4;
    const destX   = Math.cos(angle) * dist;
    const destY   = Math.sin(angle) * dist;

    const dur = 260;
    const ease = Easing.out(Easing.cubic);

    scale.value = withDelay(delay, withSequence(
      withTiming(1.5, { duration: 90, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(0,   { duration: dur, easing: ease }),
    ));
    opacity.value = withDelay(delay + 70, withTiming(0, { duration: dur, easing: ease }));
    tx.value      = withDelay(delay, withTiming(destX, { duration: dur + 90, easing: ease }));
    ty.value      = withDelay(delay, withTiming(destY, { duration: dur + 90, easing: ease }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const cs     = cellSize - 1.5;
  const radius = Math.max(2, cs * 0.18);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: col * cellSize,
          top: row * cellSize,
          width: cs,
          height: cs,
          borderRadius: radius,
          overflow: 'hidden',
        },
        animStyle,
      ]}
    >
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Inner highlight */}
      <View style={[styles.highlight, { borderRadius: Math.max(2, radius - 2) }]} />
    </Animated.View>
  );
});

// ─── Mini spark dot (orbits each cell) ───────────────────────────────────────

const Spark = memo(function Spark({
  row, col, cellSize, color, delay, angle, dist,
}: {
  row: number; col: number; cellSize: number;
  color: string; delay: number; angle: number; dist: number;
}) {
  const tx      = useSharedValue(0);
  const ty      = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale   = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 300, easing: ease }),
    ));
    scale.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 80, easing: Easing.out(Easing.back(2)) }),
      withTiming(0, { duration: 280, easing: ease }),
    ));
    tx.value = withDelay(delay, withTiming(Math.cos(angle) * dist, { duration: 360, easing: ease }));
    ty.value = withDelay(delay, withTiming(Math.sin(angle) * dist, { duration: 360, easing: ease }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const size = cellSize * 0.22;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: col * cellSize + cellSize * 0.5 - size / 2,
          top: row * cellSize + cellSize * 0.5 - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function LineClearEffect({
  cells,
  cellSize,
  clearingRows,
  clearingCols,
  onDone,
}: LineClearEffectProps) {
  const boardSize = cellSize * BOARD_SIZE;
  const dominantColor = cells[0]?.gradient[0] ?? '#A29BFE';

  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Full-board flash */}
      <FlashOverlay color={dominantColor} />

      {/* Row laser stripes */}
      {clearingRows.map((r, i) => (
        <LaserStripe
          key={`row-${r}`}
          index={r}
          isRow
          cellSize={cellSize}
          boardSize={boardSize}
          color={dominantColor}
          delay={i * 30}
        />
      ))}

      {/* Column laser stripes */}
      {clearingCols.map((c, i) => (
        <LaserStripe
          key={`col-${c}`}
          index={c}
          isRow={false}
          cellSize={cellSize}
          boardSize={boardSize}
          color={cells.find(cell => cell.col === c)?.gradient[0] ?? dominantColor}
          delay={i * 30 + 15}
        />
      ))}

      {/* Exploding cells */}
      {cells.map((cell, i) => (
        <ExplodingCell
          key={`cell-${cell.row}-${cell.col}`}
          row={cell.row}
          col={cell.col}
          gradient={cell.gradient}
          cellSize={cellSize}
          delay={i * 6}
        />
      ))}

      {/* Spark particles from each cell */}
      {cells.flatMap((cell, i) =>
        Array.from({ length: 6 }, (_, k) => (
          <Spark
            key={`spark-${cell.row}-${cell.col}-${k}`}
            row={cell.row}
            col={cell.col}
            cellSize={cellSize}
            color={cell.gradient[k % 2]}
            delay={i * 6 + k * 18}
            angle={(Math.PI * 2 * k) / 6 + i * 0.3}
            dist={cellSize * (1.2 + Math.random() * 1.2)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: '40%',
    bottom: '40%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
