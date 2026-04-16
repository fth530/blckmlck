/**
 * GameScreen — Block Dash main gameplay screen.
 *
 * Layout and render responsibilities only. Drag-and-drop logic is in
 * useDragAndDrop hook, TraySlot component handles individual slot rendering.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BOARD_SIZE, COLORS, TRAY_CELL_SIZE, SAVE_DEBOUNCE_MS, ANIMATION_CONFIG } from "../utils/constants";
import { useGame } from "../context/GameContext";
import { useSettings } from "../context/SettingsContext";
import { useHaptics } from "../hooks/useHaptics";
import { useSounds } from "../hooks/useSounds";
import { useDragAndDrop, ParticleData } from "../hooks/useDragAndDrop";
import { useDailyChallenge } from "../hooks/useDailyChallenge";
import GameBoard from "../components/GameBoard";
import ScoreBoard from "../components/ScoreBoard";
import ComboIndicator from "../components/ComboIndicator";
import LevelBadge from "../components/LevelBadge";
import GameOverModal from "../components/GameOverModal";
import PauseOverlay from "../components/PauseOverlay";
import ParticleEffect from "../components/ParticleEffect";
import FloatingScore from "../components/FloatingScore";
import TraySlot from "../components/TraySlot";
import ChallengeCompleteToast from "../components/ChallengeCompleteToast";
import AchievementToast from "../components/AchievementToast";
import PowerUpBar from "../components/PowerUpBar";
import PowerUpTargetOverlay from "../components/PowerUpTargetOverlay";
import TimerBar from "../components/TimerBar";
import { saveGame } from "../utils/storage";
import { useAchievements } from "../hooks/useAchievements";
import type { AchievementDef, PowerUpType } from "../utils/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ScorePopup {
  id: string;
  x: number;
  y: number;
  score: number;
  combo: number;
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, level, canUndo, placePieceAction, usePowerUp, timeUp, confirmGameOver, clearLastLines, initGame, undo } =
    useGame();
  const { trigger } = useHaptics();
  const { play } = useSounds();
  const { settings } = useSettings();
  const { recordGameResult } = useDailyChallenge();
  const { checkAchievements } = useAchievements();
  const [achQueue, setAchQueue] = useState<AchievementDef[]>([]);
  const [powerUpMode, setPowerUpMode] = useState<PowerUpType | null>(null);

  // Timed mode: countdown timer
  const TIMED_START = 60;
  const TIMED_BONUS = 3; // seconds per line cleared
  const [timedSeconds, setTimedSeconds] = useState(TIMED_START);
  const timedRef = useRef(timedSeconds);
  timedRef.current = timedSeconds;

  const [showGameOver, setShowGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showChallengeToast, setShowChallengeToast] = useState(false);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const lastDropPos = useRef<{ x: number; y: number } | null>(null);

  // Board juice animations
  const boardScale  = useRef(new Animated.Value(1)).current;
  const boardShakeX = useRef(new Animated.Value(0)).current;

  const {
    ghostCells,
    activePieceIdx,
    particles,
    responders,
    dragX,
    dragY,
    dragScale,
    boardViewRef,
    handleBoardLayout,
  } = useDragAndDrop({
    pieces: state.pieces,
    board: state.board,
    isPaused,
    onPlacePiece: (pieceIndex, row, col) => {
      placePieceAction(pieceIndex, row, col);
    },
    onTriggerHaptic: trigger,
    onPlaySound: play,
    onDropPosition: (x, y) => { lastDropPos.current = { x, y }; },
  });

  useEffect(() => {
    if (state.isGameOver && !showGameOver) {
      // Record daily challenge progress + streak + check achievements
      recordGameResult(state.score, state.linesCleared, state.piecesPlaced).then(
        (outcome) => {
          if (outcome.challengeJustCompleted) {
            play("challenge");
            setShowChallengeToast(true);
          }
        }
      );
      checkAchievements({
        score: state.score,
        linesCleared: state.linesCleared,
        maxCombo: state.maxCombo,
        piecesPlaced: state.piecesPlaced,
        level,
        highScore: state.highScore,
      }).then((newAchs) => {
        if (newAchs.length > 0) setAchQueue(newAchs);
      });
      const t = setTimeout(() => {
        trigger("heavy");
        // New high score gets a fanfare instead of the sad gameover tone
        play(state.isNewHighScore ? "highscore" : "gameover");
        confirmGameOver(state);
        setShowGameOver(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [state.isGameOver, showGameOver]);

  // Level-up fanfare
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) {
      prevLevel.current = level;
      trigger("success");
      play("levelup");
    }
  }, [level]);

  // Board "thud" — quick scale overshoot when a piece lands (skip if reduced motion)
  const prevPiecesPlaced = useRef(state.piecesPlaced);
  useEffect(() => {
    if (state.piecesPlaced > prevPiecesPlaced.current) {
      prevPiecesPlaced.current = state.piecesPlaced;
      if (!settings.reducedMotion) {
        Animated.sequence([
          Animated.timing(boardScale, { toValue: 1.018, duration: 55, useNativeDriver: true }),
          Animated.spring(boardScale, {
            toValue: 1,
            ...ANIMATION_CONFIG.BOARD_LAND,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [state.piecesPlaced]);

  useEffect(() => {
    if (state.lastClearedLines) {
      const total =
        (state.lastClearedLines.rows?.length ?? 0) +
        (state.lastClearedLines.cols?.length ?? 0);
      if (total > 0) {
        trigger("success");
        play(state.comboCount > 1 ? "combo" : "clear");

        // Board shake on line clear (skip if reduced motion)
        if (!settings.reducedMotion) {
          const amp = Math.min(6, 3 + total);
          const ms = ANIMATION_CONFIG.BOARD_SHAKE_MS;
          Animated.sequence([
            Animated.timing(boardShakeX, { toValue: -amp, duration: ms, useNativeDriver: true }),
            Animated.timing(boardShakeX, { toValue:  amp, duration: ms, useNativeDriver: true }),
            Animated.timing(boardShakeX, { toValue: -amp * 0.6, duration: ms - 5, useNativeDriver: true }),
            Animated.timing(boardShakeX, { toValue:  amp * 0.6, duration: ms - 5, useNativeDriver: true }),
            Animated.timing(boardShakeX, { toValue: 0, duration: ms - 10, useNativeDriver: true }),
          ]).start();
        }
      }
      // Timed mode: add bonus seconds per line cleared
      if (state.mode === 'timed' && total > 0) {
        setTimedSeconds((s) => s + total * TIMED_BONUS);
      }
      clearLastLines();
    }
  }, [state.lastClearedLines]);

  // Timed mode: 1-second countdown interval
  useEffect(() => {
    if (state.mode !== 'timed' || state.isGameOver || isPaused) return;
    const iv = setInterval(() => {
      setTimedSeconds((s) => {
        if (s <= 1) { timeUp(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [state.mode, state.isGameOver, isPaused, timeUp]);

  // Spawn floating score popup on each placement
  useEffect(() => {
    if (state.lastScore > 0 && lastDropPos.current) {
      const { x, y } = lastDropPos.current;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setScorePopups((prev) => [
        ...prev,
        { id, x: x - 24, y: y - 20, score: state.lastScore, combo: state.comboCount },
      ]);
    }
  }, [state.lastScore]);

  const removeScorePopup = useCallback((id: string) => {
    setScorePopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state.isGameOver && state.score > 0) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { saveGame(state); }, SAVE_DEBOUNCE_MS);
    }
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state.score, state.isGameOver]);

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false);
    if (state.mode === 'timed') setTimedSeconds(TIMED_START);
    initGame(state.highScore, state.mode);
  }, [state.highScore, state.mode, initGame]);

  const handleHome = useCallback(() => {
    setShowGameOver(false);
    router.replace("/");
  }, [router]);

  const handleBack = useCallback(() => {
    router.replace("/");
  }, [router]);

  const handlePowerUpCell = useCallback((row: number, col: number) => {
    if (!powerUpMode) return;
    trigger("medium");
    play("place");
    usePowerUp(powerUpMode, row, col);
    setPowerUpMode(null);
  }, [powerUpMode, trigger, play, usePowerUp]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    trigger("light");
    play("select");
    undo();
  }, [canUndo, trigger, play, undo]);

  const handlePause = useCallback(() => {
    trigger("light");
    play("select");
    setIsPaused(true);
  }, [trigger, play]);

  const handleResume = useCallback(() => {
    trigger("light");
    play("select");
    setIsPaused(false);
  }, [trigger, play]);

  const handlePauseHome = useCallback(() => {
    setIsPaused(false);
    router.replace("/");
  }, [router]);

  const paddingTop =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const trayHeight = TRAY_CELL_SIZE * 5 + 28;
  const headerH = 72;
  const comboH = 38;
  const availH =
    SCREEN_HEIGHT -
    paddingTop -
    headerH -
    comboH -
    trayHeight -
    paddingBottom -
    24;
  const availW = SCREEN_WIDTH - 24;
  const boardDim = Math.min(availW, availH);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0d0d1a", "#13132a", "#0d0d1a"]}
        style={StyleSheet.absoluteFill}
      />

      {particles.map((p: ParticleData) => (
        <ParticleEffect key={p.id} x={p.x} y={p.y} colors={p.colors} />
      ))}

      {scorePopups.map((p) => (
        <FloatingScore
          key={p.id}
          id={p.id}
          x={p.x}
          y={p.y}
          score={p.score}
          combo={p.combo}
          onDone={removeScorePopup}
        />
      ))}

      <View style={[styles.header, { paddingTop: paddingTop + 8 }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <ScoreBoard score={state.score} highScore={state.highScore} />
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleUndo}
            style={[styles.iconBtn, !canUndo && styles.iconBtnDisabled]}
            disabled={!canUndo}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Undo last move"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canUndo }}
          >
            <Feather
              name="rotate-ccw"
              size={18}
              color={canUndo ? COLORS.text : COLORS.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePause}
            style={[styles.iconBtn, (state.isGameOver || showGameOver) && styles.iconBtnDisabled]}
            disabled={state.isGameOver || showGameOver}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Pause game"
            accessibilityRole="button"
            accessibilityState={{ disabled: state.isGameOver || showGameOver }}
          >
            <Feather name="pause" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.comboRow}>
        <LevelBadge level={level} />
        <ComboIndicator comboCount={state.comboCount} />
        <View style={styles.comboRowSpacer} />
      </View>

      {state.mode === 'timed' && (
        <TimerBar secondsLeft={timedSeconds} maxSeconds={TIMED_START} />
      )}

      <PowerUpBar
        powerUps={state.powerUps}
        activeMode={powerUpMode}
        onSelect={setPowerUpMode}
      />

      <View style={styles.boardContainer}>
        <Animated.View
          style={{
            transform: [
              { translateX: boardShakeX },
              { scale: boardScale },
            ],
          }}
        >
          <View
            ref={boardViewRef}
            onLayout={handleBoardLayout}
            style={{ width: boardDim, height: boardDim }}
          >
            <GameBoard
              board={state.board}
              cellSize={boardDim / BOARD_SIZE}
              ghostCells={ghostCells}
              colorblind={settings.colorblind}
            />
            {powerUpMode && (
              <PowerUpTargetOverlay
                cellSize={boardDim / BOARD_SIZE}
                mode={powerUpMode}
                onCellPress={handlePowerUpCell}
              />
            )}
          </View>
        </Animated.View>
      </View>

      <View style={[styles.tray, { paddingBottom: paddingBottom + 12 }]}>
        {([0, 1, 2] as const).map((idx) => (
          <TraySlot
            key={idx}
            piece={state.pieces[idx]}
            responder={responders[idx]}
            translateX={dragX[idx]}
            translateY={dragY[idx]}
            scale={dragScale[idx]}
            isActive={activePieceIdx === idx}
            slotIndex={idx}
            isGameOver={state.isGameOver}
            colorblind={settings.colorblind}
            reducedMotion={settings.reducedMotion}
          />
        ))}
      </View>

      <ChallengeCompleteToast
        visible={showChallengeToast}
        onDone={() => setShowChallengeToast(false)}
      />

      {achQueue.length > 0 && (
        <AchievementToast
          queue={achQueue}
          onDone={() => setAchQueue([])}
        />
      )}

      <PauseOverlay
        visible={isPaused}
        onResume={handleResume}
        onHome={handlePauseHome}
      />

      <GameOverModal
        visible={showGameOver}
        score={state.score}
        highScore={state.highScore}
        isNewHighScore={state.isNewHighScore}
        linesCleared={state.linesCleared}
        maxCombo={state.maxCombo}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDisabled: {
    opacity: 0.35,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comboRow: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  comboRowSpacer: {
    width: 60,
  },
  boardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  tray: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(10,10,24,0.85)",
  },
});
