import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BOARD_SIZE, COLORS } from '../utils/constants';

const GameBoard = memo(function GameBoard({
  board,
  cellSize,
  ghostCells = [],  // { row, col, color, valid }
}) {
  const cells = useMemo(() => {
    const result = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cellColor = board[r][c];
        const ghost = ghostCells.find(g => g.row === r && g.col === c);
        result.push({ r, c, cellColor, ghost });
      }
    }
    return result;
  }, [board, ghostCells]);

  return (
    <View style={[styles.board, { width: cellSize * BOARD_SIZE, height: cellSize * BOARD_SIZE }]}>
      {cells.map(({ r, c, cellColor, ghost }) => (
        <Cell
          key={`${r}-${c}`}
          r={r}
          c={c}
          cellColor={cellColor}
          ghost={ghost}
          cellSize={cellSize}
        />
      ))}
    </View>
  );
});

const Cell = memo(function Cell({ r, c, cellColor, ghost, cellSize }) {
  const style = [
    styles.cell,
    {
      left: c * cellSize,
      top: r * cellSize,
      width: cellSize - 1,
      height: cellSize - 1,
    },
  ];

  if (cellColor) {
    return (
      <LinearGradient
        colors={cellColor.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[style, styles.filledCell, { borderRadius: cellSize * 0.18 }]}
      >
        <View style={styles.cellInnerGlow} />
      </LinearGradient>
    );
  }

  if (ghost) {
    return (
      <View
        style={[
          style,
          {
            borderRadius: cellSize * 0.18,
            backgroundColor: ghost.valid ? COLORS.validGhost : COLORS.invalidGhost,
            borderWidth: 1.5,
            borderColor: ghost.valid ? COLORS.validBorder : COLORS.invalidBorder,
          },
        ]}
      />
    );
  }

  return <View style={[style, styles.emptyCell, { borderRadius: cellSize * 0.12 }]} />;
});

export default GameBoard;

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: COLORS.boardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
  },
  emptyCell: {
    backgroundColor: COLORS.cellEmpty,
    borderWidth: 0.5,
    borderColor: COLORS.cellBorder,
  },
  filledCell: {},
  cellInnerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
  },
});
