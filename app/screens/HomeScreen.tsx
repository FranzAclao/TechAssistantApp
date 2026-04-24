import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Colors } from "../constants/colors";

export function HomeScreen({
  problem,
  onChangeProblem,
  onAnalyze,
  loading,
}: {
  problem: string;
  onChangeProblem: (text: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}) {
  const canAnalyze = problem.trim().length > 0 && !loading;

  return (
    <>
      <Text style={styles.sectionLabel}>Problem Input</Text>
      <Card>
        <Text style={styles.cardTitle}>What’s going wrong?</Text>
        <TextInput
          value={problem}
          onChangeText={onChangeProblem}
          placeholder="e.g., My laptop won’t connect to Wi‑Fi after the latest update…"
          placeholderTextColor={Colors.placeholder}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.problemInput]}
          editable={!loading}
        />
        <View style={styles.spacer12} />
        <PrimaryButton
          title="Analyze Problem"
          onPress={onAnalyze}
          disabled={!canAnalyze}
          loading={loading}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  input: {
    marginTop: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 44,
  },
  problemInput: {
    minHeight: 120,
  },
  spacer12: {
    height: 12,
  },
});

