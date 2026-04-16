import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BOARD_SIZE } from "../utils/constants";
import type { PowerUpType } from "../utils/types";

interface PowerUpTargetOverlayProps {
  cellSize: number;
  mode: PowerUpType;
  onCellPress: (row: number, col: number) => void;
}

/**
 * Transparent tappable grid overlaid on the board when a power-up is active.
 * Each cell is a touchable area. Tapping fires `onCellPress(row, col)`.
 */
export default function PowerUpTargetOverlay({
  cellSize,
  mode,
  onCellPress,
}: PowerUpTargetOverlayProps) {
  const dim = cellSize * BOARD_SIZE;

  return (
    <View style={[styles.overlay, { width: dim, height: dim }]} pointerEvents="box-none">
      {Array.from({ length: BOARD_SIZE }, (_, r) =>
        Array.from({ length: BOARD_SIZE }, (_, c) => (
          <TouchableOpacity
            key={`${r}-${c}`}
            onPress={() => onCellPress(r, c)}
            activeOpacity={0.5}
            style={[
              styles.cell,
              {
                left: c * cellSize,
                top: r * cellSize,
                width: cellSize,
                height: cellSize,
              },
            ]}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  cell: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
