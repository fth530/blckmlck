import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const PARTICLE_COUNT = 12;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const Particle = memo(function Particle({ color, delay, startX, startY }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const destX = randomBetween(-60, 60);
  const destY = randomBetween(-80, 20);
  const size = randomBetween(4, 10);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 200,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: destX,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: destY,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
});

const ParticleEffect = memo(function ParticleEffect({ x, y, colors = ['#FF6B6B', '#FFDD59', '#2ED573', '#18DCFF'] }) {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      delay: i * 20,
      startX: randomBetween(-10, 10),
      startY: randomBetween(-10, 10),
    }))
  ).current;

  return (
    <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
      {particles.map(p => (
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
  },
  particle: {
    position: 'absolute',
  },
});
