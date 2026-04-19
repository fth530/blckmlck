import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import { useTranslation } from "../hooks/useTranslation";

interface PauseOverlayProps {
  visible: boolean;
  onResume: () => void;
  onHome: () => void;
  onHaptic?: (type: 'light' | 'selection') => void;
}

export default function PauseOverlay({ visible, onResume, onHome, onHaptic }: PauseOverlayProps) {
  const { t } = useTranslation();
  const opacity  = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(0.88)).current;
  const slideY   = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, friction: 8, tension: 140, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.88, duration: 140, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 30, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="box-none">
      <Animated.View style={[styles.card, { transform: [{ scale }, { translateY: slideY }] }]}>
        <Text style={styles.title}>{t('game.paused')}</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => { onHaptic?.('light'); onResume(); }}
          accessibilityLabel="Resume game"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Feather name="play" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{t('game.resume')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => { onHaptic?.('light'); onHome(); }}
          accessibilityLabel="Quit to home"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Feather name="home" size={16} color={COLORS.textMuted} />
          <Text style={styles.secondaryBtnText}>{t('game.quit')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,5,18,0.82)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
  },
  card: {
    width: 240,
    borderRadius: 24,
    backgroundColor: "rgba(20,20,46,0.97)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 4,
    color: COLORS.text,
    marginBottom: 32,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#7C5CFC",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
});
