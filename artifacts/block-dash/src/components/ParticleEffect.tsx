import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';

const PARTICLE_COUNT = 10;
const USE_NATIVE = Platform.OS !== 'web';

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface ParticleData {
  id: number;
  color: string;
  delay: number;
  destX: number;
  destY: number;
  size: number;
}

interface ParticleProps extends ParticleData {}

const Particle = memo(function Particle({ color, delay, destX, destY, size }: ParticleProps) {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: USE_NATIVE }),
        Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: USE_NATIVE }),
        Animated.timing(tx, { toValue: destX, duration: 550, useNativeDriver: USE_NATIVE }),
        Animated.timing(ty, { toValue: destY, duration: 550, useNativeDriver: USE_NATIVE }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: USE_NATIVE }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateX: tx }, { translateY: ty }, { scale }],
        },
      ]}
    />
  );
});

interface ParticleEffectProps {
  x: number;
  y: number;
  colors?: string[];
}

const ParticleEffect = memo(function ParticleEffect({
  x,
  y,
  colors = ['#FF6B6B', '#FFDD59', '#2ED573', '#18DCFF'],
}: ParticleEffectProps) {
  const particles = useRef<ParticleData[]>(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      delay: i * 18,
      destX: rnd(-55, 55),
      destY: rnd(-75, 15),
      size: rnd(4, 9),
    }))
  ).current;

  return (
    <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
});

export default ParticleEffect;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    zIndex: 200,
  },
  particle: {
    position: 'absolute',
  },
});
