import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Animated, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TIER_COLORS } from "../utils/achievements";
import type { AchievementDef } from "../utils/types";

interface AchievementToastProps {
  /** Queue of achievements to show one after another. */
  queue: AchievementDef[];
  onDone: () => void;
}

export default function AchievementToast({ queue, onDone }: AchievementToastProps) {
  const [current, setCurrent] = useState(0);
  const translateY = useRef(new Animated.Value(-90)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const ach = queue[current];

  useEffect(() => {
    if (!ach) { onDone(); return; }

    translateY.setValue(-90);
    opacity.setValue(0);

    // Slide in
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 200, friction: 12, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss after 2.4s, then show next or finish
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -90, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        if (current + 1 < queue.length) {
          setCurrent((i) => i + 1);
        } else {
          onDone();
        }
      });
    }, 2400);

    return () => clearTimeout(t);
  }, [current, ach]);

  if (!ach) return null;

  const tier = TIER_COLORS[ach.tier];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: tier.bg,
          borderColor: tier.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: tier.bg }]}>
        <Feather name={ach.icon as any} size={18} color={tier.text} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: tier.text }]}>{ach.title}</Text>
        <Text style={styles.desc}>{ach.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 54,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    zIndex: 700,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 320,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },
});
