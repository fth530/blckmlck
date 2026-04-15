import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BlockPiece = memo(function BlockPiece({ piece, cellSize, style }) {
  if (!piece) return null;

  const { shape, color } = piece;
  const rows = shape.length;
  const cols = shape[0].length;

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
              colors={color.gradient}
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
});
