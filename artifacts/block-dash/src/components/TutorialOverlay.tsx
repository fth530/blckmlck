import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../utils/constants";
import { useTranslation } from "../hooks/useTranslation";
import type { TranslationKey } from "../utils/i18n";

const { width: SW } = Dimensions.get("window");

interface TutorialOverlayProps {
  onDone: () => void;
}

interface Step {
  icon: React.ComponentProps<typeof Feather>["name"];
  iconColor: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const STEPS: Step[] = [
  { icon: "move",    iconColor: "#A29BFE", titleKey: "tutorial.dragTitle",  descKey: "tutorial.dragDesc" },
  { icon: "columns", iconColor: "#4ECDC4", titleKey: "tutorial.clearTitle", descKey: "tutorial.clearDesc" },
  { icon: "zap",     iconColor: "#FFDD59", titleKey: "tutorial.comboTitle", descKey: "tutorial.comboDesc" },
  { icon: "target",  iconColor: "#FF6B81", titleKey: "tutorial.dailyTitle", descKey: "tutorial.dailyDesc" },
];

export default function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const { t } = useTranslation();
  const [stepIdx, setStepIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const animateToNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      if (isLast) {
        onDone();
        return;
      }
      setStepIdx((i) => i + 1);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleSkip = () => onDone();

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: step.iconColor + "20" }]}>
          <Feather name={step.icon} size={32} color={step.iconColor} />
        </View>

        {/* Text */}
        <Text style={styles.title}>{t(step.titleKey)}</Text>
        <Text style={styles.description}>{t(step.descKey)}</Text>

        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === stepIdx && { backgroundColor: COLORS.primary, width: 18 },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLast && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('tutorial.skip')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={animateToNext} style={styles.nextBtnWrap}>
            <LinearGradient
              colors={["#6C5CE7", "#A29BFE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextText}>{isLast ? t('tutorial.go') : t('tutorial.next')}</Text>
              {!isLast && <Feather name="arrow-right" size={16} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 900,
    padding: 28,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(26,26,60,0.97)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(108,92,231,0.25)",
    padding: 28,
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  nextBtnWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  nextText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
});
