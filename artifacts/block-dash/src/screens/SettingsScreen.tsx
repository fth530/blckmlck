import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../utils/constants';
import { useSettings } from '../context/SettingsContext';
import { useHaptics } from '../hooks/useHaptics';
import { useTranslation } from '../hooks/useTranslation';
import { resetStats } from '../utils/storage';
import type { Settings } from '../utils/types';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const { trigger } = useHaptics();
  const { t } = useTranslation();

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const handleToggle = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    trigger('selection');
    await updateSetting(key, value);
  };

  const handleResetStats = () => {
    trigger('error');
    Alert.alert(
      t('settings.resetStats'),
      t('settings.resetConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.reset'),
          style: 'destructive',
          onPress: async () => {
            await resetStats();
            Alert.alert(t('settings.resetStats'), t('settings.resetDone'));
          },
        },
      ]
    );
  };

  const topPad = paddingTop + 16;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity
          onPress={() => { trigger('light'); router.back(); }}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title={t('settings.gameplay')} />

        <SettingRow
          icon="volume-2"
          label={t('settings.sounds')}
          value={settings.sounds}
          onToggle={(v) => handleToggle('sounds', v)}
        />
        <SettingRow
          icon="smartphone"
          label={t('settings.haptics')}
          value={settings.haptics}
          onToggle={(v) => handleToggle('haptics', v)}
        />

        <SectionHeader title={t('settings.accessibility')} />

        <SettingRow
          icon="eye"
          label={t('settings.colorblind')}
          description={t('settings.colorblindDesc')}
          value={settings.colorblind}
          onToggle={(v) => handleToggle('colorblind', v)}
        />
        <SettingRow
          icon="minimize-2"
          label={t('settings.reducedMotion')}
          description={t('settings.reducedMotionDesc')}
          value={settings.reducedMotion}
          onToggle={(v) => handleToggle('reducedMotion', v)}
        />

        {/* Language selector */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconBox}>
              <Feather name="globe" size={18} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.rowLabel}>{t('settings.language')}</Text>
          </View>
          <View style={styles.langSwitch}>
            {(['en', 'tr'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => handleToggle('language', lang)}
                style={[styles.langBtn, settings.language === lang && styles.langBtnActive]}
              >
                <Text style={[styles.langText, settings.language === lang && styles.langTextActive]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SectionHeader title={t('settings.data')} />

        <TouchableOpacity
          onPress={handleResetStats}
          style={styles.dangerRow}
          accessibilityLabel="Reset high scores"
          accessibilityRole="button"
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <Feather name="trash-2" size={18} color="#ef4444" />
            </View>
            <Text style={[styles.rowLabel, { color: '#ef4444' }]}>{t('settings.resetStats')}</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#ef4444" />
        </TouchableOpacity>

        <SectionHeader title={t('settings.about')} />
        <View style={styles.aboutBox}>
          <Text style={styles.appName}>Block Dash</Text>
          <Text style={styles.version}>{t('settings.version')} 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            A polished block puzzle game. Drop pieces to complete rows and columns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

interface SettingRowProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  description?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

function SettingRow({ icon, label, description, value, onToggle }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={18} color={COLORS.primaryLight} />
        </View>
        <View style={styles.rowTextGroup}>
          <Text style={styles.rowLabel}>{label}</Text>
          {description && <Text style={styles.rowDesc}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#444', true: COLORS.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(108,92,231,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextGroup: {
    flex: 1,
    flexShrink: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
    flexWrap: 'wrap',
  },
  langSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: COLORS.primary,
  },
  langText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  langTextActive: {
    color: '#fff',
  },
  aboutBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  aboutDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
});
