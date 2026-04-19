import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "../hooks/useTranslation";

interface ChallengeCompleteToastProps {
  visible: boolean;
  onDone: () => void;
}

/**
 * Brief animated toast that slides down from the top to announce
 * daily challenge completion, then auto-dismisses after ~2.5s.
 */
export default function ChallengeCompleteToast({ visible, onDone }: ChallengeCompleteToastProps) {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 180, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        // Hold, then slide out
        const t = setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: -80, duration: 280, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
          ]).start(() => onDone());
        }, 2200);
        return () => clearTimeout(t);
      });
    } else {
      translateY.setValue(-80);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity }]}>
      <Feather name="check-circle" size={18} color="#2ED573" />
      <Text style={styles.text}>{t('daily.complete')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(46,213,115,0.16)",
    borderWidth: 1,
    borderColor: "rgba(46,213,115,0.35)",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    zIndex: 600,
    shadowColor: "#2ED573",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2ED573",
    letterSpacing: 0.5,
  },
});
