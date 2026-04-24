import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";

function CategoryTag({ categoryId }: { categoryId: string }) {
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? null;
  if (!category) return null;

  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{`${category.icon} ${category.label}`}</Text>
    </View>
  );
}

export default function DiagnosisScreen() {
  const router = useRouter();
  const { category, diagnosis: diagnosisParam } = useLocalSearchParams();

  const categoryId = typeof category === "string" ? category : "";
  const diagnosis = useMemo(() => {
    if (typeof diagnosisParam !== "string") return "";
    try {
      return String(JSON.parse(diagnosisParam));
    } catch {
      return diagnosisParam;
    }
  }, [diagnosisParam]);

  const [savedAdvice, setSavedAdvice] = useState<string | null>(null);

  const isSaved = useMemo(() => savedAdvice === diagnosis && diagnosis.length > 0, [savedAdvice, diagnosis]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Your Financial Snapshot</Text>
      <CategoryTag categoryId={categoryId} />

      <Card>
        <Text style={styles.diagnosisText}>{diagnosis || "No advice found. Please go back and try again."}</Text>
      </Card>

      <View style={styles.spacer16} />
      <PrimaryButton label="New Concern" onPress={() => router.replace("/screens/HomeScreen")} />

      <View style={styles.spacer12} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (diagnosis) setSavedAdvice(diagnosis);
        }}
        style={[styles.secondaryButton, isSaved ? styles.secondaryButtonSaved : null]}
      >
        <Text style={styles.secondaryButtonText}>{isSaved ? "Saved" : "Save Advice"}</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        This is general financial information only and does not constitute professional financial advice. For major
        financial decisions, please consult a licensed financial advisor.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  tag: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 14,
    backgroundColor: COLORS.BORDER,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
  },
  diagnosisText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  spacer16: {
    height: 16,
  },
  spacer12: {
    height: 12,
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonSaved: {
    opacity: 0.8,
  },
  secondaryButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  disclaimer: {
    marginTop: 18,
    fontStyle: "italic",
    color: COLORS.DISCLAIMER,
    fontSize: 12,
    lineHeight: 18,
  },
});
