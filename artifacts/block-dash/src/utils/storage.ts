import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Stats, Settings, StreakData, DailyChallenge, UnlockedAchievement, GameHistoryEntry } from "./types";

/** Storage schema version — bump when data structure changes to force migration/reset. */
const SCHEMA_VERSION = 1;
const SCHEMA_KEY = "blockdash_schema_version";

/**
 * Checks stored schema version against current.
 * If mismatch, clears stale keys that may have incompatible structures.
 * Simple integer-based versioning — no complex migrations.
 */
export async function ensureSchemaVersion(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SCHEMA_KEY);
    const storedVer = stored ? parseInt(stored, 10) : 0;
    if (storedVer < SCHEMA_VERSION) {
      // Clear structured data that may be stale (preserve high score + stats)
      await AsyncStorage.multiRemove([
        KEYS.SAVED_GAME,
        KEYS.GAME_HISTORY,
        KEYS.ACHIEVEMENTS,
        KEYS.DAILY_CHALLENGE,
      ]);
      await AsyncStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION.toString());
    }
  } catch (error) {
    console.error("ensureSchemaVersion error:", error);
  }
}

const KEYS = {
  HIGH_SCORE: "blockdash_high_score",
  GAMES_PLAYED: "blockdash_games_played",
  BEST_COMBO: "blockdash_best_combo",
  TOTAL_LINES: "blockdash_total_lines",
  SAVED_GAME: "blockdash_saved_game",
  SETTINGS: "blockdash_settings",
  STREAK: "blockdash_streak",
  DAILY_CHALLENGE: "blockdash_daily_challenge",
  TUTORIAL_SEEN: "blockdash_tutorial_seen",
  ACHIEVEMENTS: "blockdash_achievements",
  GAME_HISTORY: "blockdash_game_history",
  COINS: "blockdash_coins",
  UNLOCKED_THEMES: "blockdash_unlocked_themes",
};

export async function getHighScore(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch (error) {
    console.error("getHighScore error:", error);
    return 0;
  }
}

export async function setHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.HIGH_SCORE, score.toString());
  } catch (error) {
    console.error("setHighScore error:", error);
  }
}

export async function getStats(): Promise<Stats> {
  try {
    const [gamesPlayed, bestCombo, totalLines, highScore] = await Promise.all([
      AsyncStorage.getItem(KEYS.GAMES_PLAYED),
      AsyncStorage.getItem(KEYS.BEST_COMBO),
      AsyncStorage.getItem(KEYS.TOTAL_LINES),
      AsyncStorage.getItem(KEYS.HIGH_SCORE),
    ]);
    return {
      gamesPlayed: gamesPlayed ? parseInt(gamesPlayed, 10) : 0,
      bestCombo: bestCombo ? parseInt(bestCombo, 10) : 0,
      totalLines: totalLines ? parseInt(totalLines, 10) : 0,
      highScore: highScore ? parseInt(highScore, 10) : 0,
    };
  } catch (error) {
    console.error("getStats error:", error);
    return { gamesPlayed: 0, bestCombo: 0, totalLines: 0, highScore: 0 };
  }
}

interface UpdateStatsParams {
  score: number;
  combo: number;
  lines: number;
}

export async function updateStats(
  params: UpdateStatsParams,
): Promise<{ isNewHighScore: boolean }> {
  try {
    const stats = await getStats();
    const newGamesPlayed = stats.gamesPlayed + 1;
    const newBestCombo = Math.max(stats.bestCombo, params.combo);
    const newTotalLines = stats.totalLines + params.lines;
    const newHighScore = Math.max(stats.highScore, params.score);

    await Promise.all([
      AsyncStorage.setItem(KEYS.GAMES_PLAYED, newGamesPlayed.toString()),
      AsyncStorage.setItem(KEYS.BEST_COMBO, newBestCombo.toString()),
      AsyncStorage.setItem(KEYS.TOTAL_LINES, newTotalLines.toString()),
      AsyncStorage.setItem(KEYS.HIGH_SCORE, newHighScore.toString()),
    ]);

    return { isNewHighScore: params.score > stats.highScore };
  } catch (error) {
    console.error("updateStats error:", error);
    return { isNewHighScore: false };
  }
}

export async function saveGame<T>(gameState: T): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SAVED_GAME, JSON.stringify(gameState));
  } catch (error) {
    console.error("saveGame error:", error);
  }
}

export async function loadGame<T>(): Promise<T | null> {
  try {
    const val = await AsyncStorage.getItem(KEYS.SAVED_GAME);
    return val ? JSON.parse(val) : null;
  } catch (error) {
    console.error("loadGame error:", error);
    return null;
  }
}

export async function clearSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SAVED_GAME);
  } catch (error) {
    console.error("clearSavedGame error:", error);
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const val = await AsyncStorage.getItem(KEYS.SETTINGS);
    const defaults: Settings = { haptics: true, sounds: true, colorblind: false, reducedMotion: false, activeTheme: 'cosmic', language: 'en' };
    return val ? { ...defaults, ...JSON.parse(val) } : defaults;
  } catch (error) {
    console.error("getSettings error:", error);
    return { haptics: true, sounds: true, colorblind: false, reducedMotion: false, activeTheme: 'cosmic', language: 'en' };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("saveSettings error:", error);
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

const DEFAULT_STREAK: StreakData = { currentStreak: 0, longestStreak: 0, lastPlayedDate: '' };

export async function getStreakData(): Promise<StreakData> {
  try {
    const val = await AsyncStorage.getItem(KEYS.STREAK);
    return val ? JSON.parse(val) : DEFAULT_STREAK;
  } catch (error) {
    console.error("getStreakData error:", error);
    return DEFAULT_STREAK;
  }
}

export async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(data));
  } catch (error) {
    console.error("saveStreakData error:", error);
  }
}

// ─── Daily challenge progress ─────────────────────────────────────────────────

export async function getDailyChallengeProgress(): Promise<DailyChallenge | null> {
  try {
    const val = await AsyncStorage.getItem(KEYS.DAILY_CHALLENGE);
    return val ? JSON.parse(val) : null;
  } catch (error) {
    console.error("getDailyChallengeProgress error:", error);
    return null;
  }
}

export async function saveDailyChallengeProgress(challenge: DailyChallenge): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
  } catch (error) {
    console.error("saveDailyChallengeProgress error:", error);
  }
}

// ─── Coins & themes ──────────────────────────────────────────────────────────

export async function getCoins(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.COINS);
    return val ? parseInt(val, 10) : 0;
  } catch { return 0; }
}

export async function setCoins(amount: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.COINS, amount.toString());
  } catch (error) { console.error("setCoins error:", error); }
}

export async function addCoins(amount: number): Promise<number> {
  const current = await getCoins();
  const newTotal = current + amount;
  await setCoins(newTotal);
  return newTotal;
}

export async function getUnlockedThemes(): Promise<string[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.UNLOCKED_THEMES);
    return val ? JSON.parse(val) : ['cosmic']; // default theme always unlocked
  } catch { return ['cosmic']; }
}

export async function saveUnlockedThemes(themes: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.UNLOCKED_THEMES, JSON.stringify(themes));
  } catch (error) { console.error("saveUnlockedThemes error:", error); }
}

// ─── Game history ─────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

export async function getGameHistory(): Promise<GameHistoryEntry[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.GAME_HISTORY);
    return val ? JSON.parse(val) : [];
  } catch (error) {
    console.error("getGameHistory error:", error);
    return [];
  }
}

export async function addGameToHistory(entry: GameHistoryEntry): Promise<void> {
  try {
    const history = await getGameHistory();
    // Prepend latest, cap at MAX_HISTORY
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(KEYS.GAME_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error("addGameToHistory error:", error);
  }
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function getUnlockedAchievements(): Promise<UnlockedAchievement[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
    return val ? JSON.parse(val) : [];
  } catch (error) {
    console.error("getUnlockedAchievements error:", error);
    return [];
  }
}

export async function saveUnlockedAchievements(list: UnlockedAchievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(list));
  } catch (error) {
    console.error("saveUnlockedAchievements error:", error);
  }
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────

export async function hasTutorialBeenSeen(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.TUTORIAL_SEEN);
    return val === "true";
  } catch {
    return false;
  }
}

export async function markTutorialSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.TUTORIAL_SEEN, "true");
  } catch (error) {
    console.error("markTutorialSeen error:", error);
  }
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export async function resetStats(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.HIGH_SCORE,
      KEYS.GAMES_PLAYED,
      KEYS.BEST_COMBO,
      KEYS.TOTAL_LINES,
      KEYS.SAVED_GAME,
    ]);
  } catch (error) {
    console.error("resetStats error:", error);
  }
}
