import HomeScreen from '@/src/screens/HomeScreen';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { GameProvider } from '@/src/context/GameContext';
import React from 'react';

export default function HomeRoute() {
  return (
    <SettingsProvider>
      <GameProvider>
        <HomeScreen />
      </GameProvider>
    </SettingsProvider>
  );
}
