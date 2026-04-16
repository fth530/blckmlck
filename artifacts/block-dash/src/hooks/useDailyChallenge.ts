import { useState, useEffect, useCallback, useRef } from 'react';
import { generateChallenge, todayKey, yesterdayKey } from '../utils/dailyChallenge';
import {
  getStreakData,
  saveStreakData,
  getDailyChallengeProgress,
  saveDailyChallengeProgress,
} from '../utils/storage';
import type { DailyChallenge, StreakData } from '../utils/types';

interface GameResultOutcome {
  challengeJustCompleted: boolean;
}

interface UseDailyChallengeReturn {
  challenge: DailyChallenge | null;
  streak: StreakData;
  recordGameResult: (score: number, lines: number, pieces: number) => Promise<GameResultOutcome>;
  reload: () => Promise<void>;
}

const DEFAULT_STREAK: StreakData = { currentStreak: 0, longestStreak: 0, lastPlayedDate: '' };

export function useDailyChallenge(): UseDailyChallengeReturn {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [streak, setStreak]       = useState<StreakData>(DEFAULT_STREAK);

  // Keep mutable refs so recordGameResult always has the latest values
  const challengeRef = useRef(challenge);
  const streakRef    = useRef(streak);
  useEffect(() => { challengeRef.current = challenge; }, [challenge]);
  useEffect(() => { streakRef.current    = streak;    }, [streak]);

  const reload = useCallback(async () => {
    const [streakData, saved] = await Promise.all([
      getStreakData(),
      getDailyChallengeProgress(),
    ]);

    setStreak(streakData);

    const today = todayKey();
    if (saved && saved.dateKey === today) {
      setChallenge(saved);
    } else {
      // New day → fresh challenge (no progress yet)
      setChallenge(generateChallenge(today));
    }
  }, []);

  useEffect(() => { reload(); }, []);

  /**
   * Called when a game ends. Updates streak (once per day) and checks whether
   * the daily challenge was completed by this game's result.
   */
  const recordGameResult = useCallback(
    async (score: number, lines: number, pieces: number): Promise<GameResultOutcome> => {
      const today     = todayKey();
      const yesterday = yesterdayKey();
      const current   = streakRef.current;

      // ── Streak update ──────────────────────────────────────────────────────
      let newStreak = { ...current };
      if (current.lastPlayedDate !== today) {
        if (current.lastPlayedDate === yesterday) {
          newStreak.currentStreak  += 1;
        } else {
          newStreak.currentStreak = 1;
        }
        newStreak.longestStreak  = Math.max(newStreak.longestStreak, newStreak.currentStreak);
        newStreak.lastPlayedDate = today;
        await saveStreakData(newStreak);
        setStreak(newStreak);
      }

      // ── Daily challenge update ─────────────────────────────────────────────
      const ch = challengeRef.current;
      if (!ch || ch.completed) return { challengeJustCompleted: false };

      const progressMap: Record<DailyChallenge['type'], number> = { score, lines, pieces };
      const progress    = progressMap[ch.type];
      const bestProgress = Math.max(ch.bestProgress, progress);
      const completed    = bestProgress >= ch.target;

      const updated: DailyChallenge = { ...ch, bestProgress, completed };
      await saveDailyChallengeProgress(updated);
      setChallenge(updated);

      return { challengeJustCompleted: completed };
    },
    [],
  );

  return { challenge, streak, recordGameResult, reload };
}
