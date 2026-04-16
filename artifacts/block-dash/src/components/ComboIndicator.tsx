import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/constants';

interface ComboIndicatorProps {
  comboCount: number;
}

const COMBO_COLORS = ['#FF6B6B', '#FF9F43', '#FFDD59', '#2ED573', '#18DCFF', '#A55EEA'];

const ComboIndicator = memo(function ComboIndicator({ comboCount }: ComboIndicatorProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (comboCount > 1) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 200,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1200),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [comboCount]);

  if (comboCount <= 1) return <View style={styles.placeholder} />;

  const color = COMBO_COLORS[(comboCount - 2) % COMBO_COLORS.length];

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={[styles.text, { color }]}>COMBO</Text>
      <Text style={[styles.multiplier, { color }]}>×{comboCount}</Text>
    </Animated.View>
  );
});

export default ComboIndicator;

const styles = StyleSheet.create({
  placeholder: {
    height: 36,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
  },
  text: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  multiplier: {
    fontSize: 22,
    fontWeight: '900',
  },
});
