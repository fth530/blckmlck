import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface FloatingScoreProps {
  id: string;
  x: number;
  y: number;
  score: number;
  combo: number;
  onDone: (id: string) => void;
}

// Color scales with combo level
function scoreColor(combo: number): string {
  if (combo >= 4) return '#A29BFE'; // purple  — max combo
  if (combo >= 3) return '#FF9F43'; // orange  — high combo
  if (combo >= 2) return '#FFDD59'; // yellow  — combo
  return '#2ED573';                 // green   — normal
}

const FloatingScore = memo(function FloatingScore({
  id,
  x,
  y,
  score,
  combo,
  onDone,
}: FloatingScoreProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      // Pop in then settle
      Animated.sequence([
        Animated.spring(scale, {
          toValue: combo > 1 ? 1.4 : 1.15,
          tension: 320,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Fade in immediately, then drift up
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.delay(350),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      // Float upward
      Animated.timing(translateY, {
        toValue: -72,
        duration: 850,
        useNativeDriver: true,
      }),
    ]).start(() => onDone(id));
  }, []);

  const color = scoreColor(combo);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { left: x, top: y, opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <Text style={[styles.text, { color }]}>+{score.toLocaleString()}</Text>
    </Animated.View>
  );
});

export default FloatingScore;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 300,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
