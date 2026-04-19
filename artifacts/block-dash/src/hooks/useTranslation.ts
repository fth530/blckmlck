import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { t as translate, type TranslationKey } from '../utils/i18n';

/**
 * Returns a translation function bound to the active language.
 */
export function useTranslation() {
  const { settings } = useSettings();

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(settings.language, key, params),
    [settings.language],
  );

  return { t, language: settings.language };
}
