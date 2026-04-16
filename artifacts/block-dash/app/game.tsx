import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import GameScreen from '@/src/screens/GameScreen';
import { GameProvider, useGame } from '@/src/context/GameContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { loadGame as loadSavedGame, getHighScore, hasTutorialBeenSeen, markTutorialSeen } from '@/src/utils/storage';
import TutorialOverlay from '@/src/components/TutorialOverlay';
import { COLORS } from '@/src/utils/constants';

import type { GameMode } from '@/src/utils/types';

function GameWrapper({ resume, mode }: { resume: boolean; mode: GameMode }) {
  const { initGame, loadGame } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [hs, tutorialSeen] = await Promise.all([
        getHighScore(),
        hasTutorialBeenSeen(),
      ]);

      if (resume) {
        const saved = await loadSavedGame();
        if (saved) {
          loadGame({ ...saved, highScore: Math.max(saved.highScore || 0, hs) });
          setIsLoading(false);
          return;
        }
      }

      initGame(hs, mode);
      setIsLoading(false);

      if (!tutorialSeen) {
        setShowTutorial(true);
      }
    };
    init();
  }, [resume, mode]);

  if (isLoading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <GameScreen />
      {showTutorial && (
        <TutorialOverlay
          onDone={() => {
            setShowTutorial(false);
            markTutorialSeen();
          }}
        />
      )}
    </>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function GameRoute() {
  const { resume, mode } = useLocalSearchParams<{ resume?: string; mode?: string }>();
  const isResume = resume === 'true';
  const gameMode = (['classic', 'zen', 'timed'].includes(mode ?? '') ? mode : 'classic') as GameMode;

  return (
    <SettingsProvider>
      <GameProvider>
        <GameWrapper resume={isResume} mode={gameMode} />
      </GameProvider>
    </SettingsProvider>
  );
}
