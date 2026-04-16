import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_ACHIEVEMENTS } from '../utils/achievements';
import { getUnlockedAchievements, saveUnlockedAchievements, getStats, getStreakData } from '../utils/storage';
import type { UnlockedAchievement, AchievementDef, AchievementCheckContext } from '../utils/types';

interface UseAchievementsReturn {
  unlocked: UnlockedAchievement[];
  total: number;
  /** Check all achievements against current context. Returns newly unlocked ones. */
  checkAchievements: (gameCtx: {
    score: number;
    linesCleared: number;
    maxCombo: number;
    piecesPlaced: number;
    level: number;
    highScore: number;
  }) => Promise<AchievementDef[]>;
  reload: () => Promise<void>;
}

export function useAchievements(): UseAchievementsReturn {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const unlockedRef = useRef(unlocked);
  useEffect(() => { unlockedRef.current = unlocked; }, [unlocked]);

  const reload = useCallback(async () => {
    const list = await getUnlockedAchievements();
    setUnlocked(list);
  }, []);

  useEffect(() => { reload(); }, []);

  const checkAchievements = useCallback(
    async (gameCtx: {
      score: number;
      linesCleared: number;
      maxCombo: number;
      piecesPlaced: number;
      level: number;
      highScore: number;
    }): Promise<AchievementDef[]> => {
      // Gather cumulative stats + streak for the full context
      const [stats, streak] = await Promise.all([getStats(), getStreakData()]);

      const ctx: AchievementCheckContext = {
        score: gameCtx.score,
        highScore: Math.max(gameCtx.highScore, stats.highScore),
        linesCleared: gameCtx.linesCleared,
        maxCombo: gameCtx.maxCombo,
        piecesPlaced: gameCtx.piecesPlaced,
        level: gameCtx.level,
        gamesPlayed: stats.gamesPlayed,
        totalLines: stats.totalLines + gameCtx.linesCleared,
        bestCombo: Math.max(stats.bestCombo, gameCtx.maxCombo),
        currentStreak: streak.currentStreak,
      };

      const alreadyIds = new Set(unlockedRef.current.map((a) => a.id));
      const newlyUnlocked: AchievementDef[] = [];
      const now = new Date().toISOString();

      for (const ach of ALL_ACHIEVEMENTS) {
        if (alreadyIds.has(ach.id)) continue;
        if (ach.check(ctx)) {
          newlyUnlocked.push(ach);
          unlockedRef.current = [...unlockedRef.current, { id: ach.id, unlockedAt: now }];
        }
      }

      if (newlyUnlocked.length > 0) {
        setUnlocked([...unlockedRef.current]);
        await saveUnlockedAchievements(unlockedRef.current);
      }

      return newlyUnlocked;
    },
    [],
  );

  return {
    unlocked,
    total: ALL_ACHIEVEMENTS.length,
    checkAchievements,
    reload,
  };
}
