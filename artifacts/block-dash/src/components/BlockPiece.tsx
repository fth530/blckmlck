import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CB_COLOR_BY_NAME } from '../utils/constants';
import type { Piece } from '../utils/types';

interface BlockPieceProps {
  piece: Piece | null;
  cellSize: number;
  colorblind?: boolean;
  style?: ViewStyle;
}

const BlockPiece = memo(function BlockPiece({ piece, cellSize, colorblind = false, style }: BlockPieceProps) {
  if (!piece) return null;

  const { shape, color } = piece;
  const rows = shape.length;
  const cols = shape[0].length;

  const cbEntry = colorblind ? CB_COLOR_BY_NAME[color.name] : null;
  const displayColor = cbEntry ? cbEntry.color : color;
  const pattern = cbEntry ? cbEntry.pattern : null;
  const patternSize = Math.max(8, cellSize * 0.36);

  return (
    <View
      style={[
        styles.container,
        {
          width: cols * cellSize,
          height: rows * cellSize,
        },
        style,
      ]}
    >
      {shape.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          return (
            <LinearGradient
              key={`${r}-${c}`}
              colors={displayColor.gradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.cell,
                {
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize - 1.5,
                  height: cellSize - 1.5,
                  borderRadius: cellSize * 0.18,
                },
              ]}
            >
              <View style={styles.innerGlow} />
              {pattern && (
                <Text style={[styles.pattern, { fontSize: patternSize }]}>{pattern}</Text>
              )}
            </LinearGradient>
          );
        })
      )}
    </View>
  );
});

export default BlockPiece;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
  },
  innerGlow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'rgba(0,0,0,0.42)',
    fontWeight: '900',
    lineHeight: undefined,
  },
});
