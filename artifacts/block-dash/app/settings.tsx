import React from 'react';
import SettingsScreen from '@/src/screens/SettingsScreen';
import { SettingsProvider } from '@/src/context/SettingsContext';

export default function SettingsRoute() {
  return (
    <SettingsProvider>
      <SettingsScreen />
    </SettingsProvider>
  );
}
