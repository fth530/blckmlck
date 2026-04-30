import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FloatingBlock from '../components/FloatingBlock';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { COLORS, PIECE_COLORS } from '../utils/constants';
import { getStats, loadGame, getCoins } from '../utils/storage';
import { useDailyChallenge } from '../hooks/useDailyChallenge';
import { useAchievements } from '../hooks/useAchievements';
import { useHaptics } from '../hooks/useHaptics';
import { useTranslation } from '../hooks/useTranslation';
import { ALL_ACHIEVEMENTS, TIER_COLORS } from '../utils/achievements';
import type { Stats } from '../utils/types';

const { width, height } = Dimensions.get('window');

interface FloatingBlockData {
  id: number;
  x: number;
  y: number;
  colorIndex: number;
  size: number;
}

const FLOATING_BLOCKS: FloatingBlockData[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * (width - 50),
  y: Math.random() * (height - 100),
  colorIndex: i % PIECE_COLORS.length,
  size: 16 + Math.random() * 28,
}));

const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  bestCombo: 0,
  totalLines: 0,
  highScore: 0,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [coins, setCoins] = useState(0);
  const { trigger } = useHaptics();
  const { t } = useTranslation();
  const { challenge, streak, reload: reloadChallenge } = useDailyChallenge();
  const { unlocked, total: totalAchievements, reload: reloadAch } = useAchievements();

  useEffect(() => {
    getStats().then((s) => setStats(s));
    loadGame().then((g) => setHasSavedGame(!!g));
    reloadChallenge();
    reloadAch();
    getCoins().then(setCoins);

    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePlay = useCallback((mode: string = 'classic') => {
    trigger('light');
    router.push(`/game?mode=${mode}`);
  }, [router, trigger]);

  const handleContinue = useCallback(() => {
    trigger('light');
    router.push('/game?resume=true');
  }, [router, trigger]);

  const handleSettings = useCallback(() => {
    trigger('selection');
    router.push('/settings');
  }, [router, trigger]);

  const handleStats = useCallback(() => {
    trigger('selection');
    router.push('/stats');
  }, [router, trigger]);

  const handleShop = useCallback(() => {
    trigger('selection');
    router.push('/shop');
  }, [router, trigger]);

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      {FLOATING_BLOCKS.map((b) => (
        <FloatingBlock key={b.id} {...b} />
      ))}

      <View style={[styles.topButtons, { top: paddingTop + 16 }]}>
        <TouchableOpacity
          onPress={handleShop}
          style={styles.coinBtn}
          accessibilityLabel="Shop"
          accessibilityRole="button"
        >
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={styles.coinCount}>{coins.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleStats}
          style={styles.topBtn}
          accessibilityLabel="Statistics"
          accessibilityRole="button"
        >
          <Feather name="bar-chart-2" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.topBtn}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Feather name="settings" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: paddingTop + 60, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          <LinearGradient
            colors={['#A29BFE', '#6C5CE7', '#4ECDC4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>BLOCK</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#FF6B81', '#FF9F43', '#FFDD59']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>RUSH</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.highScoreBox, { opacity: contentOpacity }]}>
          <LinearGradient
            colors={['rgba(255,221,89,0.15)', 'rgba(255,221,89,0.05)']}
            style={styles.highScoreGrad}
          >
            <Feather name="star" size={14} color="#FFDD59" />
            <Text style={styles.highScoreLabel}>{t('home.bestScore')}</Text>
            <Text style={styles.highScoreValue}>{stats.highScore.toLocaleString()}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.buttons, { opacity: contentOpacity }]}>
          {/* Mode selector row */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              onPress={() => handlePlay('classic')}
              activeOpacity={0.85}
              style={styles.modeCard}
              accessibilityLabel="Play classic mode"
            >
              <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.modeGrad}>
                <Feather name="play" size={20} color="#fff" />
                <Text style={styles.modeLabel}>{t('home.classic')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePlay('zen')}
              activeOpacity={0.85}
              style={styles.modeCard}
              accessibilityLabel="Play zen mode"
            >
              <LinearGradient colors={['#4ECDC4', '#2C9B7B']} style={styles.modeGrad}>
                <Feather name="sun" size={20} color="#fff" />
                <Text style={styles.modeLabel}>{t('home.zen')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePlay('timed')}
              activeOpacity={0.85}
              style={styles.modeCard}
              accessibilityLabel="Play timed mode"
            >
              <LinearGradient colors={['#FF9F43', '#E55D2B']} style={styles.modeGrad}>
                <Feather name="clock" size={20} color="#fff" />
                <Text style={styles.modeLabel}>{t('home.timed')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {hasSavedGame && (
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.85}
              accessibilityLabel="Continue"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['rgba(78,205,196,0.2)', 'rgba(78,205,196,0.1)']}
                style={[styles.playBtn, styles.continueBtn]}
              >
                <Feather name="rotate-ccw" size={18} color="#4ECDC4" />
                <Text style={[styles.playBtnText, { color: '#4ECDC4' }]}>{t('home.continue')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View style={[styles.statsContainer, { opacity: contentOpacity }]}>
          <StatItem label={t('home.games')} value={stats.gamesPlayed} />
          <View style={styles.statDivider} />
          <StatItem label={t('home.lines')} value={stats.totalLines} />
          <View style={styles.statDivider} />
          <StatItem label={t('home.combo')} value={`×${stats.bestCombo}`} />
          <View style={styles.statDivider} />
          <StatItem
            label={t('home.streak')}
            value={streak.currentStreak > 0 ? `🔥${streak.currentStreak}` : '—'}
          />
        </Animated.View>

        {challenge && (
          <Animated.View style={[{ width: '100%' }, { opacity: contentOpacity }]}>
            <DailyChallengeCard challenge={challenge} streak={streak} />
          </Animated.View>
        )}

        {/* Achievement showcase */}
        <Animated.View style={[styles.achSection, { opacity: contentOpacity }]}>
          <View style={styles.achHeader}>
            <Text style={styles.achTitle}>{t('home.achievements')}</Text>
            <Text style={styles.achCount}>{unlocked.length}/{totalAchievements}</Text>
          </View>
          <View style={styles.achGrid}>
            {ALL_ACHIEVEMENTS.slice(0, 8).map((ach) => {
              const isUnlocked = unlocked.some((u) => u.id === ach.id);
              const tier = TIER_COLORS[ach.tier];
              return (
                <View
                  key={ach.id}
                  style={[
                    styles.achBadge,
                    {
                      backgroundColor: isUnlocked ? tier.bg : 'rgba(255,255,255,0.03)',
                      borderColor: isUnlocked ? tier.border : 'rgba(255,255,255,0.06)',
                    },
                  ]}
                >
                  <Feather
                    name={ach.icon as any}
                    size={16}
                    color={isUnlocked ? tier.text : 'rgba(255,255,255,0.15)'}
                  />
                  <Text
                    style={[
                      styles.achBadgeLabel,
                      { color: isUnlocked ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)' },
                    ]}
                    numberOfLines={1}
                  >
                    {ach.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topButtons: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  topBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  coinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  coinEmoji: { fontSize: 14 },
  coinCount: { fontSize: 13, fontWeight: '800', color: '#FFD700' },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginBottom: 4,
  },
  titleGradient: {
    borderRadius: 4,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
    lineHeight: 66,
  },
  highScoreBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,221,89,0.2)',
  },
  highScoreGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  highScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFDD59',
    letterSpacing: 2,
  },
  highScoreValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFDD59',
    marginLeft: 4,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modeCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  modeGrad: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    width: '100%',
  },
  continueBtn: {
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.3)',
  },
  playBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  achSection: {
    width: '100%',
    gap: 10,
  },
  achHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  achTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  achCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  achGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  achBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
