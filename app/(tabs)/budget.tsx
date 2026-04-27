import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../constants/colors";

export default function BudgetScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.subtitle}>Plan your spending and stay in control.</Text>

      <View style={styles.spacer24} />

      <Text style={styles.emoji}>💰📊</Text>
      <Text style={styles.comingSoon}>Coming Soon</Text>
      <Text style={styles.hint}>We&apos;ll help you track expenses and build a monthly budget.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
    textAlign: "center",
  },
  emoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  comingSoon: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.PRIMARY,
  },
  hint: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.DISCLAIMER,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320,
  },
  spacer24: { height: 24 },
});

