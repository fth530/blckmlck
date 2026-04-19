import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, ANIMATION_CONFIG } from '../utils/constants';
import { useTranslation } from '../hooks/useTranslation';

interface ScoreBoardProps {
  score: number;
  highScore: number;
}

const ScoreBoard = memo(function ScoreBoard({ score, highScore }: ScoreBoardProps) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: ANIMATION_CONFIG.SCORE_BUMP.toValue,
        duration: ANIMATION_CONFIG.SCORE_BUMP.duration,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_CONFIG.SCORE_BUMP.duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [score]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(108,92,231,0.25)', 'rgba(108,92,231,0.05)']}
        style={styles.scoreBox}
      >
        <Text style={styles.label}>{t('game.score')}</Text>
        <Animated.Text style={[styles.score, { transform: [{ scale: scaleAnim }] }]}>
          {score.toLocaleString()}
        </Animated.Text>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(255,221,89,0.2)', 'rgba(255,221,89,0.05)']}
        style={styles.scoreBox}
      >
        <Text style={styles.label}>{t('game.best')}</Text>
        <Text style={[styles.score, styles.bestScore]}>
          {highScore.toLocaleString()}
        </Text>
      </LinearGradient>
    </View>
  );
});

export default ScoreBoard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  bestScore: {
    color: '#FFDD59',
  },
});
