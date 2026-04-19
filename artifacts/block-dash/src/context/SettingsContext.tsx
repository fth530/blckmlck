import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../utils/types';
import { getSettings, saveSettings } from '../utils/storage';
import { detectSystemLanguage } from '../utils/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  loaded: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_SETTINGS: Settings = {
  haptics: true,
  sounds: true,
  colorblind: false,
  reducedMotion: false,
  activeTheme: 'cosmic',
  language: detectSystemLanguage(),
};

// ─── Provider ────────────────────────────────────────────────────────────────

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
