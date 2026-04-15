import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FloatingBlock from '../components/FloatingBlock';
import { COLORS, PIECE_COLORS } from '../utils/constants';
import { getStats, loadGame } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const FLOATING_BLOCKS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * (width - 50),
  y: Math.random() * (height - 100),
  colorIndex: i % PIECE_COLORS.length,
  size: 16 + Math.random() * 28,
}));

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState({ gamesPlayed: 0, bestCombo: 0, totalLines: 0, highScore: 0 });
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    // Load stats
    getStats().then(s => setStats(s));
    loadGame().then(g => setHasSavedGame(!!g));

    // Entry animations
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(titleTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });

    // Pulse animation for play button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePlay = useCallback(() => {
    router.push('/game');
  }, [router]);

  const handleContinue = useCallback(() => {
    router.push('/game?resume=true');
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating background blocks */}
      {FLOATING_BLOCKS.map(b => (
        <FloatingBlock key={b.id} {...b} />
      ))}

      {/* Settings button */}
      <TouchableOpacity
        onPress={handleSettings}
        style={[styles.settingsBtn, { top: paddingTop + 16 }]}
      >
        <Feather name="settings" size={22} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Main content */}
      <View style={[styles.content, { paddingTop: paddingTop + 60 }]}>
        {/* Title */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.subtitle}>PUZZLE GAME</Text>
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
            <Text style={styles.title}>DASH</Text>
          </LinearGradient>
        </Animated.View>

        {/* High score */}
        <Animated.View style={[styles.highScoreBox, { opacity: contentOpacity }]}>
          <LinearGradient
            colors={['rgba(255,221,89,0.15)', 'rgba(255,221,89,0.05)']}
            style={styles.highScoreGrad}
          >
            <Feather name="star" size={14} color="#FFDD59" />
            <Text style={styles.highScoreLabel}>BEST SCORE</Text>
            <Text style={styles.highScoreValue}>{stats.highScore.toLocaleString()}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, { opacity: contentOpacity }]}>
          {/* Play button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={handlePlay} activeOpacity={0.85}>
              <LinearGradient
                colors={['#6C5CE7', '#A29BFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playBtn}
              >
                <Feather name="play" size={22} color="#fff" />
                <Text style={styles.playBtnText}>PLAY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Continue button */}
          {hasSavedGame && (
            <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
              <LinearGradient
                colors={['rgba(78,205,196,0.2)', 'rgba(78,205,196,0.1)']}
                style={[styles.playBtn, styles.continueBtn]}
              >
                <Feather name="rotate-ccw" size={18} color="#4ECDC4" />
                <Text style={[styles.playBtnText, { color: '#4ECDC4' }]}>CONTINUE</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: contentOpacity }]}>
          <StatItem label="GAMES" value={stats.gamesPlayed} />
          <View style={styles.statDivider} />
          <StatItem label="LINES" value={stats.totalLines} />
          <View style={styles.statDivider} />
          <StatItem label="COMBO" value={`×${stats.bestCombo}`} />
        </Animated.View>
      </View>
    </View>
  );
}

function StatItem({ label, value }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  settingsBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    flex: 1,
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
});
