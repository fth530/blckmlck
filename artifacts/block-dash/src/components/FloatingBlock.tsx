import React, { useEffect, useRef, memo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PIECE_COLORS } from '../utils/constants';

interface FloatingBlockProps {
  x: number;
  y: number;
  colorIndex: number;
  size?: number;
  shape?: number[][];
}

const FloatingBlock = memo(function FloatingBlock({
  x,
  y,
  colorIndex,
  size = 24,
  shape = [[1]],
}: FloatingBlockProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3 + Math.random() * 0.3)).current;

  const duration = 3000 + Math.random() * 3000;
  const distance = 20 + Math.random() * 30;
  const startDelay = Math.random() * 2000;

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, {
          toValue: 1,
          duration: duration * 2,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: -1,
          duration: duration * 2,
          useNativeDriver: true,
        }),
      ])
    );

    const timeout = setTimeout(() => {
      floatAnim.start();
      rotateAnim.start();
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      floatAnim.stop();
      rotateAnim.stop();
    };
  }, []);

  const color = PIECE_COLORS[colorIndex % PIECE_COLORS.length];
  const rotateInterp = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }, { rotate: rotateInterp }],
        },
      ]}
    >
      <LinearGradient
        colors={color.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.block, { width: size, height: size, borderRadius: size * 0.2 }]}
      />
    </Animated.View>
  );
});

export default FloatingBlock;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  block: {},
});
