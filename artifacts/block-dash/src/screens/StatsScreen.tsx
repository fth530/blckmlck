import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../utils/constants';
import { getStats, getGameHistory, getStreakData } from '../utils/storage';
import { useHaptics } from '../hooks/useHaptics';
import { useTranslation } from '../hooks/useTranslation';
import type { Stats, GameHistoryEntry, StreakData } from '../utils/types';

const MODE_COLORS: Record<string, string> = {
  classic: '#A29BFE',
  zen:     '#4ECDC4',
  timed:   '#FF9F43',
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { trigger } = useHaptics();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    Promise.all([getStats(), getGameHistory(), getStreakData()]).then(([s, h, st]) => {
      setStats(s);
      setHistory(h);
      setStreak(st);
    });
  }, []);

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const top10 = [...history].sort((a, b) => b.score - a.score).slice(0, 10);

  // Compute averages
  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, g) => s + g.score, 0) / history.length)
    : 0;
  const avgLines = history.length > 0
    ? Math.round(history.reduce((s, g) => s + g.linesCleared, 0) / history.length)
    : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: paddingTop + 16 }]}>
        <TouchableOpacity
          onPress={() => { trigger('light'); router.back(); }}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('stats.title')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        {stats && (
          <View style={styles.summaryRow}>
            <SummaryCard label={t('stats.highScore')} value={stats.highScore.toLocaleString()} icon="star" color="#FFDD59" />
            <SummaryCard label={t('home.games')} value={stats.gamesPlayed.toString()} icon="play" color="#A29BFE" />
          </View>
        )}
        {stats && streak && (
          <View style={styles.summaryRow}>
            <SummaryCard label={t('stats.totalLines')} value={stats.totalLines.toLocaleString()} icon="layers" color="#4ECDC4" />
            <SummaryCard label={t('stats.bestCombo')} value={`×${stats.bestCombo}`} icon="zap" color="#FF9F43" />
          </View>
        )}
        <View style={styles.summaryRow}>
          <SummaryCard label={t('stats.avgScore')} value={avgScore.toLocaleString()} icon="bar-chart-2" color="#FF6B81" />
          <SummaryCard label={t('stats.avgLines')} value={avgLines.toString()} icon="minus" color="#18DCFF" />
        </View>

        {/* Streak */}
        {streak && streak.longestStreak > 0 && (
          <View style={styles.streakRow}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakText}>
              {streak.currentStreak === 1
                ? t('stats.currentStreak', { n: streak.currentStreak })
                : t('stats.currentStreakPlural', { n: streak.currentStreak })}
            </Text>
            <Text style={styles.streakBest}>
              {t('stats.best', { n: streak.longestStreak })}
            </Text>
          </View>
        )}

        {/* Top 10 Leaderboard */}
        <Text style={styles.sectionTitle}>{t('stats.top10')}</Text>

        {top10.length === 0 ? (
          <Text style={styles.emptyText}>{t('stats.empty')}</Text>
        ) : (
          top10.map((game, i) => {
            const mColor = MODE_COLORS[game.mode] ?? MODE_COLORS.classic;
            const mLabel = t(('home.' + game.mode) as any);
            const d = new Date(game.date);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            return (
              <View key={`${game.date}-${i}`} style={styles.row}>
                <Text style={[styles.rank, i < 3 && styles.rankTop]}>{i + 1}</Text>
                <View style={styles.rowMain}>
                  <Text style={styles.rowScore}>{game.score.toLocaleString()}</Text>
                  <Text style={styles.rowSub}>
                    {game.linesCleared} {t('home.lines').toLowerCase()} · ×{game.maxCombo} {t('game.combo').toLowerCase()} · LVL {game.level}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <View style={[styles.modeBadge, { backgroundColor: mColor + '22', borderColor: mColor + '44' }]}>
                    <Text style={[styles.modeText, { color: mColor }]}>{mLabel}</Text>
                  </View>
                  <Text style={styles.rowDate}>{dateStr}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Recent games */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('stats.recent')}</Text>
            {history.slice(0, 10).map((game, i) => {
              const mColor = MODE_COLORS[game.mode] ?? MODE_COLORS.classic;
              const mLabel = t(('home.' + game.mode) as any);
              const d = new Date(game.date);
              const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              const dateStr = `${d.getDate()}/${d.getMonth() + 1} ${timeStr}`;
              return (
                <View key={`recent-${game.date}-${i}`} style={styles.recentRow}>
                  <Text style={styles.recentScore}>{game.score.toLocaleString()}</Text>
                  <Text style={styles.recentSub}>{game.linesCleared} {t('home.lines').toLowerCase()}</Text>
                  <Text style={[styles.recentMode, { color: mColor }]}>{mLabel}</Text>
                  <Text style={styles.recentDate}>{dateStr}</Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryCard({ label, value, icon, color }: {
  label: string; value: string; icon: React.ComponentProps<typeof Feather>['name']; color: string;
}) {
  return (
    <View style={[styles.summaryCard, { borderColor: color + '25' }]}>
      <Feather name={icon} size={16} color={color} />
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 3,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    gap: 3,
  },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.5 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,159,67,0.1)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,159,67,0.2)',
  },
  streakFire: { fontSize: 18 },
  streakText: { fontSize: 13, fontWeight: '700', color: '#FF9F43', flex: 1 },
  streakBest: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 14,
    marginBottom: 4,
    marginLeft: 4,
  },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rank: { fontSize: 16, fontWeight: '800', color: COLORS.textMuted, width: 24, textAlign: 'center' },
  rankTop: { color: '#FFDD59' },
  rowMain: { flex: 1, gap: 2 },
  rowScore: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  rowSub: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  modeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  rowDate: { fontSize: 10, color: COLORS.textMuted },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  recentScore: { fontSize: 15, fontWeight: '800', color: COLORS.text, width: 70 },
  recentSub: { fontSize: 11, color: COLORS.textMuted, flex: 1 },
  recentMode: { fontSize: 10, fontWeight: '700' },
  recentDate: { fontSize: 10, color: COLORS.textMuted },
});
