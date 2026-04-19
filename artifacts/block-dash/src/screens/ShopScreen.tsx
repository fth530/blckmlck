import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../utils/constants';
import { ALL_THEMES } from '../utils/themes';
import { useSettings } from '../context/SettingsContext';
import { useHaptics } from '../hooks/useHaptics';
import { useTranslation } from '../hooks/useTranslation';
import { getCoins, setCoins, getUnlockedThemes, saveUnlockedThemes } from '../utils/storage';
import type { BoardTheme } from '../utils/types';

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const { trigger } = useHaptics();
  const { t } = useTranslation();
  const [coins, setCoinsState] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>(['cosmic']);

  useEffect(() => {
    getCoins().then(setCoinsState);
    getUnlockedThemes().then(setUnlocked);
  }, []);

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const handleBuy = useCallback(async (theme: BoardTheme) => {
    if (coins < theme.price) {
      trigger('error');
      Alert.alert(t('shop.notEnoughCoins'), t('shop.needMore', { n: theme.price - coins }));
      return;
    }
    trigger('success');
    const newCoins = coins - theme.price;
    const newUnlocked = [...unlocked, theme.id];
    await setCoins(newCoins);
    await saveUnlockedThemes(newUnlocked);
    setCoinsState(newCoins);
    setUnlocked(newUnlocked);
    await updateSetting('activeTheme', theme.id);
  }, [coins, unlocked, updateSetting, trigger]);

  const handleSelect = useCallback(async (themeId: string) => {
    trigger('selection');
    await updateSetting('activeTheme', themeId);
  }, [updateSetting, trigger]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: paddingTop + 16 }]}>
        <TouchableOpacity onPress={() => { trigger('light'); router.back(); }} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('shop.title')}</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinText}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('shop.boardThemes')}</Text>

        {ALL_THEMES.map((theme) => {
          const isOwned = unlocked.includes(theme.id);
          const isActive = settings.activeTheme === theme.id;

          return (
            <View key={theme.id} style={styles.themeCard}>
              {/* Preview strip */}
              <LinearGradient
                colors={theme.bgGradient as [string, string, string]}
                style={styles.preview}
              >
                <View style={[styles.previewBoard, { backgroundColor: theme.boardBg }]}>
                  {[0, 1, 2, 3, 4].map((r) => (
                    <View key={r} style={styles.previewRow}>
                      {[0, 1, 2, 3, 4].map((c) => (
                        <View
                          key={c}
                          style={[
                            styles.previewCell,
                            {
                              backgroundColor: (r + c) % 3 === 0 ? theme.accent + '55' : theme.cellEmpty,
                              borderColor: theme.cellBorder,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
                <View style={styles.previewAccent}>
                  <View style={[styles.accentDot, { backgroundColor: theme.accent }]} />
                  <View style={[styles.accentDot, { backgroundColor: theme.accentLight }]} />
                </View>
              </LinearGradient>

              {/* Info row */}
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {theme.price === 0 && <Text style={styles.freeLabel}>{t('shop.free')}</Text>}
                </View>

                {isActive ? (
                  <View style={styles.activeBadge}>
                    <Feather name="check" size={14} color="#2ED573" />
                    <Text style={styles.activeText}>{t('shop.active')}</Text>
                  </View>
                ) : isOwned ? (
                  <TouchableOpacity
                    onPress={() => handleSelect(theme.id)}
                    style={styles.selectBtn}
                  >
                    <Text style={styles.selectText}>{t('shop.equip')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleBuy(theme)}
                    style={[styles.buyBtn, coins < theme.price && styles.buyBtnDisabled]}
                  >
                    <Text style={styles.coinIcon}>🪙</Text>
                    <Text style={styles.buyText}>{theme.price}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, letterSpacing: 3 },
  coinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
  },
  coinIcon: { fontSize: 14 },
  coinText: { fontSize: 14, fontWeight: '800', color: '#FFD700' },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  sectionTitle: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 2,
    marginTop: 8, marginBottom: 4, marginLeft: 4,
  },
  themeCard: {
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  preview: { padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 16 },
  previewBoard: { borderRadius: 8, padding: 4, gap: 2 },
  previewRow: { flexDirection: 'row', gap: 2 },
  previewCell: { width: 14, height: 14, borderRadius: 3, borderWidth: 0.5 },
  previewAccent: { gap: 6 },
  accentDot: { width: 18, height: 18, borderRadius: 9 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  themeName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  freeLabel: { fontSize: 10, fontWeight: '700', color: '#2ED573', letterSpacing: 1 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(46,213,115,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  activeText: { fontSize: 12, fontWeight: '700', color: '#2ED573' },
  selectBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  selectText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  buyBtnDisabled: { opacity: 0.4 },
  buyText: { fontSize: 13, fontWeight: '800', color: '#FFD700' },
});
