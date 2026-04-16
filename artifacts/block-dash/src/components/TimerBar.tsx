import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface TimerBarProps {
  secondsLeft: number;
  maxSeconds: number;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const TimerBar = memo(function TimerBar({ secondsLeft, maxSeconds }: TimerBarProps) {
  const ratio = Math.max(0, Math.min(1, secondsLeft / maxSeconds));
  const color =
    secondsLeft <= 10 ? "#FF6B6B" : secondsLeft <= 20 ? "#FF9F43" : "#4ECDC4";

  return (
    <View style={styles.container}>
      <Feather name="clock" size={14} color={color} />
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.time, { color }]}>{formatTime(secondsLeft)}</Text>
    </View>
  );
});

export default TimerBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  time: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    minWidth: 38,
    textAlign: "right",
  },
});
