import React, { useState } from 'react';
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
import { resetStats } from '../utils/storage';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const handleResetStats = () => {
    Alert.alert(
      'Reset Stats',
      'This will clear your high score and all game statistics. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetStats();
            Alert.alert('Stats Reset', 'All stats have been cleared.');
          },
        },
      ]
    );
  };

  const topPad = paddingTop + 16;

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={['#0d0d1a', '#16162e', '#0d0d1a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, {
          paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20
        }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sound & Haptics */}
        <SectionHeader title="GAMEPLAY" />

        <SettingRow
          icon="volume-2"
          label="Sound Effects"
          value={settings.sounds}
          onToggle={v => updateSetting('sounds', v)}
        />
        <SettingRow
          icon="smartphone"
          label="Haptic Feedback"
          value={settings.haptics}
          onToggle={v => updateSetting('haptics', v)}
        />

        {/* Data */}
        <SectionHeader title="DATA" />

        <TouchableOpacity onPress={handleResetStats} style={styles.dangerRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <Feather name="trash-2" size={18} color="#ef4444" />
            </View>
            <Text style={[styles.rowLabel, { color: '#ef4444' }]}>Reset High Scores</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#ef4444" />
        </TouchableOpacity>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.aboutBox}>
          <Text style={styles.appName}>Block Dash</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            A polished block puzzle game. Drop pieces to complete rows and columns.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

function SettingRow({ icon, label, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={18} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
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
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
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
