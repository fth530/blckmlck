import { useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useSettings } from '../context/SettingsContext';

// ─── Sound manifest ──────────────────────────────────────────────────────────

const SOUND_FILES = {
  place:     require('../../assets/sounds/place.wav'),
  clear:     require('../../assets/sounds/clear.wav'),
  combo:     require('../../assets/sounds/combo.wav'),
  invalid:   require('../../assets/sounds/invalid.wav'),
  gameover:  require('../../assets/sounds/gameover.wav'),
  select:    require('../../assets/sounds/select.wav'),
  levelup:   require('../../assets/sounds/levelup.wav'),
  highscore: require('../../assets/sounds/highscore.wav'),
  challenge: require('../../assets/sounds/challenge.wav'),
} as const;

export type SoundName = keyof typeof SOUND_FILES;

type SoundCache = Partial<Record<SoundName, Audio.Sound>>;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSounds() {
  const { settings } = useSettings();
  const cache = useRef<SoundCache>({});

  // Configure audio session and preload all sounds on mount
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    (Object.keys(SOUND_FILES) as SoundName[]).forEach(async (name) => {
      try {
        const { sound } = await Audio.Sound.createAsync(SOUND_FILES[name], {
          shouldPlay: false,
          volume: 1,
        });
        cache.current[name] = sound;
      } catch {
        // Sound preload failed — play() will silently skip this sound
      }
    });

    return () => {
      Object.values(cache.current).forEach((s) => s?.unloadAsync());
    };
  }, []);

  const play = useCallback(
    async (name: SoundName) => {
      if (!settings.sounds) return;
      try {
        const sound = cache.current[name];
        if (!sound) return;
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch {
        // Never crash the game over a sound failure
      }
    },
    [settings.sounds]
  );

  return { play };
}
