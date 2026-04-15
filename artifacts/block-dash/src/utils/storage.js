import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  HIGH_SCORE: 'blockdash_high_score',
  GAMES_PLAYED: 'blockdash_games_played',
  BEST_COMBO: 'blockdash_best_combo',
  TOTAL_LINES: 'blockdash_total_lines',
  SAVED_GAME: 'blockdash_saved_game',
  SETTINGS: 'blockdash_settings',
};

export async function getHighScore() {
  try {
    const val = await AsyncStorage.getItem(KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch { return 0; }
}

export async function setHighScore(score) {
  try {
    await AsyncStorage.setItem(KEYS.HIGH_SCORE, score.toString());
  } catch {}
}

export async function getStats() {
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
  } catch {
    return { gamesPlayed: 0, bestCombo: 0, totalLines: 0, highScore: 0 };
  }
}

export async function updateStats({ score, combo, lines }) {
  try {
    const stats = await getStats();
    const newGamesPlayed = stats.gamesPlayed + 1;
    const newBestCombo = Math.max(stats.bestCombo, combo);
    const newTotalLines = stats.totalLines + lines;
    const newHighScore = Math.max(stats.highScore, score);

    await Promise.all([
      AsyncStorage.setItem(KEYS.GAMES_PLAYED, newGamesPlayed.toString()),
      AsyncStorage.setItem(KEYS.BEST_COMBO, newBestCombo.toString()),
      AsyncStorage.setItem(KEYS.TOTAL_LINES, newTotalLines.toString()),
      AsyncStorage.setItem(KEYS.HIGH_SCORE, newHighScore.toString()),
    ]);

    return { isNewHighScore: score > stats.highScore };
  } catch {
    return { isNewHighScore: false };
  }
}

export async function saveGame(gameState) {
  try {
    await AsyncStorage.setItem(KEYS.SAVED_GAME, JSON.stringify(gameState));
  } catch {}
}

export async function loadGame() {
  try {
    const val = await AsyncStorage.getItem(KEYS.SAVED_GAME);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function clearSavedGame() {
  try {
    await AsyncStorage.removeItem(KEYS.SAVED_GAME);
  } catch {}
}

export async function getSettings() {
  try {
    const val = await AsyncStorage.getItem(KEYS.SETTINGS);
    return val ? JSON.parse(val) : {
      haptics: true,
      sounds: true,
      darkTheme: true,
    };
  } catch {
    return { haptics: true, sounds: true, darkTheme: true };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export async function resetStats() {
  try {
    await AsyncStorage.multiRemove([
      KEYS.HIGH_SCORE,
      KEYS.GAMES_PLAYED,
      KEYS.BEST_COMBO,
      KEYS.TOTAL_LINES,
      KEYS.SAVED_GAME,
    ]);
  } catch {}
}
