import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { getThemeById } from '../utils/themes';
import type { BoardTheme } from '../utils/types';

/**
 * Returns the currently active board theme based on user settings.
 */
export function useTheme(): BoardTheme {
  const { settings } = useSettings();
  return useMemo(() => getThemeById(settings.activeTheme), [settings.activeTheme]);
}
