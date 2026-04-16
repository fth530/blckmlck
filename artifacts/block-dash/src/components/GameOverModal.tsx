import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GameOverModalProps {
  visible: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  linesCleared: number;
  maxCombo: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Feather>['name'];
}

// ─── Component ───────────────────────────────────────────────────────────────

const GameOverModal = memo(function GameOverModal({
  visible,
  score,
  highScore,
  isNewHighScore,
  linesCleared,
  maxCombo,
  onPlayAgain,
  onHome,
}: GameOverModalProps) {
  const scaleAnim    = useRef(new Animated.Value(0)).current;
  const opacityAnim  = useRef(new Animated.Value(0)).current;
  const badgePulse   = useRef(new Animated.Value(1)).current;
  const badgeGlow    = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // High-score badge shimmer loop
      if (isNewHighScore) {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(badgePulse, { toValue: 1.1, duration: 600, useNativeDriver: true }),
            Animated.timing(badgePulse, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
        );
        const glow = Animated.loop(
          Animated.sequence([
            Animated.timing(badgeGlow, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(badgeGlow, { toValue: 0.5, duration: 700, useNativeDriver: true }),
          ]),
        );
        loop.start();
        glow.start();
        return () => { loop.stop(); glow.stop(); };
      }
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      badgePulse.setValue(1);
      badgeGlow.setValue(0.6);
    }
  }, [visible]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I scored ${score.toLocaleString()} points in Block Dash! Can you beat me? 🎮`,
      });
    } catch {}
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      accessible
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.modal, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient colors={['#1a1a3e', '#0d0d2e']} style={styles.modalInner}>
            <Text style={styles.title}>GAME OVER</Text>

            {isNewHighScore && (
              <Animated.View
                style={[
                  styles.newHighScoreBadge,
                  {
                    transform: [{ scale: badgePulse }],
                    opacity: badgeGlow,
                    shadowColor: '#FFDD59',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.7,
                    shadowRadius: 14,
                    elevation: 10,
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FFDD59', '#FFC312']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.newHighScoreGrad}
                >
                  <Feather name="star" size={14} color="#1a1a2e" />
                  <Text style={styles.newHighScoreText}>NEW HIGH SCORE!</Text>
                  <Feather name="star" size={14} color="#1a1a2e" />
                </LinearGradient>
              </Animated.View>
            )}

            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>FINAL SCORE</Text>
              <Text style={styles.finalScore}>{score.toLocaleString()}</Text>
              <Text style={styles.bestLabel}>BEST: {highScore.toLocaleString()}</Text>
            </View>

            <View style={styles.statsRow}>
              <StatBox label="LINES" value={linesCleared} icon="minus" />
              <StatBox label="COMBO" value={`×${maxCombo}`} icon="zap" />
            </View>

            <TouchableOpacity
              onPress={onPlayAgain}
              style={styles.playAgainBtn}
              accessibilityLabel="Play again"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#6C5CE7', '#A29BFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.playAgainGrad}
              >
                <Feather name="refresh-cw" size={18} color="#fff" />
                <Text style={styles.playAgainText}>PLAY AGAIN</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryBtns}>
              <TouchableOpacity
                onPress={onHome}
                style={styles.secondaryBtn}
                accessibilityLabel="Go to home"
                accessibilityRole="button"
              >
                <Feather name="home" size={18} color={COLORS.textSecondary} />
                <Text style={styles.secondaryBtnText}>HOME</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.secondaryBtn}
                accessibilityLabel="Share score"
                accessibilityRole="button"
              >
                <Feather name="share-2" size={18} color={COLORS.textSecondary} />
                <Text style={styles.secondaryBtnText}>SHARE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
});

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <View style={statStyles.box}>
      <Feather name={icon} size={16} color={COLORS.primaryLight} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

export default GameOverModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.3)',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  modalInner: {
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 4,
    marginBottom: 12,
  },
  newHighScoreBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  newHighScoreGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  newHighScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 1.5,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  finalScore: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  bestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  playAgainBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  playAgainGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  secondaryBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
  },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
});
