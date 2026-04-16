import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import type { PowerUpType, PowerUps } from "../utils/types";

interface PowerUpBarProps {
  powerUps: PowerUps;
  activeMode: PowerUpType | null;
  onSelect: (type: PowerUpType | null) => void;
}

interface ButtonDef {
  type: PowerUpType;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
}

const BUTTONS: ButtonDef[] = [
  { type: "bomb",   icon: "target",  label: "Bomb",   color: "#FF6B6B" },
  { type: "sweep",  icon: "plus",    label: "Sweep",  color: "#4ECDC4" },
  { type: "eraser", icon: "x",       label: "Eraser", color: "#FFDD59" },
];

export default function PowerUpBar({ powerUps, activeMode, onSelect }: PowerUpBarProps) {
  const hasAny = powerUps.bomb + powerUps.sweep + powerUps.eraser > 0;
  if (!hasAny && !activeMode) return null;

  return (
    <View style={styles.bar}>
      {BUTTONS.map((btn) => {
        const count = powerUps[btn.type];
        const isActive = activeMode === btn.type;
        const disabled = count === 0 && !isActive;

        return (
          <TouchableOpacity
            key={btn.type}
            onPress={() => onSelect(isActive ? null : btn.type)}
            disabled={disabled}
            style={[
              styles.btn,
              isActive && { backgroundColor: btn.color + "25", borderColor: btn.color + "55" },
              disabled && styles.btnDisabled,
            ]}
            accessibilityLabel={`${btn.label} power-up, ${count} remaining`}
          >
            <Feather
              name={btn.icon}
              size={16}
              color={disabled ? "rgba(255,255,255,0.15)" : btn.color}
            />
            {count > 0 && (
              <View style={[styles.badge, { backgroundColor: btn.color }]}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {activeMode && (
        <Text style={styles.hint}>Tap a cell on the board</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  btn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.3,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000",
  },
  hint: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginLeft: 6,
  },
});
