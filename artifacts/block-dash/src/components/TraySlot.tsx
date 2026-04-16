import React, { useEffect, useRef } from "react";
import { View, Animated, PanResponder, StyleSheet } from "react-native";
import BlockPiece from "./BlockPiece";
import { TRAY_CELL_SIZE, ANIMATION_CONFIG } from "../utils/constants";
import type { Piece } from "../utils/types";

interface TraySlotProps {
  piece: Piece | null;
  responder: ReturnType<typeof PanResponder.create>;
  translateX: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
  isActive: boolean;
  slotIndex: number;
  isGameOver: boolean;
  colorblind?: boolean;
  reducedMotion?: boolean;
}

const SLOT_DIM = TRAY_CELL_SIZE * 5;

// Shake: fast horizontal oscillation, staggered by slot index
function runShake(anim: Animated.Value, delay: number) {
  Animated.sequence([
    Animated.delay(delay),
    Animated.sequence([
      Animated.timing(anim, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  9, duration: 55, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -7, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  7, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  4, duration: 40, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  0, duration: 35, useNativeDriver: true }),
    ]),
  ]).start();
}

// Red border glow: fade in quickly, stay, then fade when modal opens
function runGlow(anim: Animated.Value, delay: number) {
  Animated.sequence([
    Animated.delay(delay),
    Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
  ]).start();
}

export default function TraySlot({
  piece,
  responder,
  translateX,
  translateY,
  scale,
  isActive,
  slotIndex,
  isGameOver,
  colorblind = false,
  reducedMotion = false,
}: TraySlotProps) {
  const shakeX      = useRef(new Animated.Value(0)).current;
  const glowOp      = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  // Game over: shake + glow
  useEffect(() => {
    if (isGameOver && piece) {
      const stagger = slotIndex * 90;
      runShake(shakeX, stagger);
      runGlow(glowOp, stagger);
    } else {
      shakeX.setValue(0);
      glowOp.setValue(0);
    }
  }, [isGameOver]);

  // Idle breathing: subtle scale pulse when piece is resting in tray (skip if reduced motion)
  useEffect(() => {
    if (piece && !isActive && !isGameOver && !reducedMotion) {
      breatheAnim.setValue(1);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: ANIMATION_CONFIG.BREATHE_SCALE,
            duration: ANIMATION_CONFIG.BREATHE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: ANIMATION_CONFIG.BREATHE_MS,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    breatheAnim.setValue(1);
  }, [!!piece, isActive, isGameOver]);

  return (
    <View style={[styles.traySlot, { width: SLOT_DIM, height: SLOT_DIM }]}>
      {piece ? (
        <>
          {/* Red "can't fit" border that appears on game over */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.gameOverRing,
              { width: SLOT_DIM, height: SLOT_DIM, opacity: glowOp },
            ]}
          />

          <Animated.View
            {...responder.panHandlers}
            style={[
              styles.draggable,
              isActive && styles.dragShadow,
              {
                zIndex: isActive ? 999 : 1,
                elevation: isActive ? 20 : 1,
                transform: [
                  { translateX: Animated.add(translateX, shakeX) },
                  { translateY },
                  { scale: Animated.multiply(scale, breatheAnim) },
                ],
              },
            ]}
          >
            <View style={[styles.pieceCenter, { width: SLOT_DIM, height: SLOT_DIM }]}>
              <BlockPiece piece={piece} cellSize={TRAY_CELL_SIZE} colorblind={colorblind} />
            </View>
          </Animated.View>
        </>
      ) : (
        <View style={styles.emptySlot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  traySlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  draggable: {
    position: "absolute",
  },
  dragShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  pieceCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    borderStyle: "dashed",
  },
  gameOverRing: {
    position: "absolute",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255,107,107,0.08)",
    // Subtle outer glow via shadow
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
});
