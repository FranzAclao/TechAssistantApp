import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Colors } from "../constants/colors";

export function DiagnosisScreen({
  diagnosis,
  onStartOver,
  loading,
}: {
  diagnosis: string;
  onStartOver: () => void;
  loading: boolean;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>Diagnosis</Text>
      <Card accent="success">
        <Text style={styles.cardTitle}>Recommended Fix</Text>
        <Text style={styles.diagnosisText}>{diagnosis}</Text>
      </Card>
      <View style={styles.spacer12} />
      <PrimaryButton
        title="Start Over"
        tone="destructive"
        onPress={onStartOver}
        disabled={loading}
      />
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
  diagnosisText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "400",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  spacer12: {
    height: 12,
  },
});

