import React, { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import GameScreen from '@/src/screens/GameScreen';
import { GameProvider, useGame } from '@/src/context/GameContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { loadGame as loadSavedGame, getHighScore } from '@/src/utils/storage';

function GameWrapper({ resume }: { resume: boolean }) {
  const { initGame, loadGame, setHighScore } = useGame();

  useEffect(() => {
    const init = async () => {
      const hs = await getHighScore();
      if (resume) {
        const saved = await loadSavedGame();
        if (saved) {
          loadGame({ ...saved, highScore: Math.max(saved.highScore || 0, hs) });
          return;
        }
      }
      initGame(hs);
    };
    init();
  }, [resume]);

  return <GameScreen resume={resume} />;
}

export default function GameRoute() {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const isResume = resume === 'true';

  return (
    <SettingsProvider>
      <GameProvider>
        <GameWrapper resume={isResume} />
      </GameProvider>
    </SettingsProvider>
  );
}
