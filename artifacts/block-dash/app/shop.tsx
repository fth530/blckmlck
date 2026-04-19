import React from 'react';
import { SettingsProvider } from '@/src/context/SettingsContext';
import ShopScreen from '@/src/screens/ShopScreen';

export default function ShopRoute() {
  return (
    <SettingsProvider>
      <ShopScreen />
    </SettingsProvider>
  );
}
