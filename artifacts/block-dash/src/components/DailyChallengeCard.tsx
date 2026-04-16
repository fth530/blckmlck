import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';
import type { DailyChallenge, StreakData } from '../utils/types';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  streak: StreakData;
}

const TYPE_ICONS: Record<DailyChallenge['type'], React.ComponentProps<typeof Feather>['name']> = {
  score:  'star',
  lines:  'layers',
  pieces: 'grid',
};

export default function DailyChallengeCard({ challenge, streak }: DailyChallengeCardProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ratio = Math.min(1, challenge.bestProgress / challenge.target);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ratio,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const barColor = challenge.completed ? '#2ED573' : '#7C5CFC';
  const icon     = TYPE_ICONS[challenge.type];

  return (
    <LinearGradient
      colors={challenge.completed
        ? ['rgba(46,213,115,0.14)', 'rgba(46,213,115,0.04)']
        : ['rgba(124,92,252,0.14)', 'rgba(124,92,252,0.04)']}
      style={styles.card}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.dailyLabel}>DAILY CHALLENGE</Text>
          {/* Streak badge */}
          {streak.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakCount}>{streak.currentStreak}</Text>
            </View>
          )}
        </View>
        {challenge.completed && (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={14} color="#2ED573" />
            <Text style={styles.completedText}>Done!</Text>
          </View>
        )}
      </View>

      {/* Challenge description */}
      <View style={styles.challengeRow}>
        <View style={[styles.iconBox, { backgroundColor: challenge.completed
          ? 'rgba(46,213,115,0.18)' : 'rgba(124,92,252,0.18)' }]}>
          <Feather name={icon} size={16} color={challenge.completed ? '#2ED573' : '#A29BFE'} />
        </View>
        <Text style={styles.challengeLabel}>{challenge.label}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: barColor,
              width: progressAnim.interpolate({
                inputRange:  [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Progress numbers */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {challenge.bestProgress.toLocaleString()} / {challenge.target.toLocaleString()}
        </Text>
        <Text style={[styles.progressPct, { color: barColor }]}>
          {Math.round(ratio * 100)}%
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,159,67,0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  streakFire: {
    fontSize: 11,
  },
  streakCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9F43',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2ED573',
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '800',
  },
});
