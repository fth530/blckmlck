import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface LevelBadgeProps {
  level: number;
}

/** Colour tiers per level range */
function levelColor(level: number): string {
  if (level <= 3) return '#4ECDC4';   // cyan  — easy
  if (level <= 6) return '#FFDD59';   // yellow — medium
  if (level <= 9) return '#FF9F43';   // orange — hard
  return '#FF6B6B';                   // red   — max
}

const LevelBadge = memo(function LevelBadge({ level }: LevelBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevLevel  = useRef(level);

  useEffect(() => {
    if (level !== prevLevel.current) {
      prevLevel.current = level;
      // Level-up pulse: scale up → overshoot → settle
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.55,
          tension: 280,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [level]);

  const color = levelColor(level);

  return (
    <Animated.View
      style={[styles.badge, { borderColor: color, transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.label}>LVL</Text>
      <Text style={[styles.number, { color }]}>{level}</Text>
    </Animated.View>
  );
});

export default LevelBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
  },
  number: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
