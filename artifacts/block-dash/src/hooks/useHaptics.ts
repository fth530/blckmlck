import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useSettings } from "../context/SettingsContext";
import type { HapticType } from "../utils/types";

export function useHaptics(): { trigger: (type: HapticType) => Promise<void> } {
  const { settings } = useSettings();

  const trigger = useCallback(
    async (type: HapticType): Promise<void> => {
      if (!settings.haptics || Platform.OS === "web") return;
      try {
        switch (type) {
          case "light":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case "medium":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case "heavy":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case "success":
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            break;
          case "error":
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error,
            );
            break;
          case "selection":
            await Haptics.selectionAsync();
            break;
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch {}
    },
    [settings.haptics],
  );

  return { trigger };
}
