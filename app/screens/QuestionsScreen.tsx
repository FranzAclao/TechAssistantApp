import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Colors } from "../constants/colors";

export function QuestionsScreen({
  questions,
  answers,
  onChangeAnswer,
  onGetDiagnosis,
  onStartOver,
  loading,
}: {
  questions: string[];
  answers: string[];
  onChangeAnswer: (index: number, text: string) => void;
  onGetDiagnosis: () => void;
  onStartOver: () => void;
  loading: boolean;
}) {
  const allAnswersProvided =
    answers.length === 4 && answers.every((a) => a.trim().length > 0);

  return (
    <>
      <Text style={styles.sectionLabel}>Follow-up Questions</Text>

      {questions.map((question, index) => (
        <View key={`${index}-${question}`} style={styles.questionBlock}>
          <Card>
            <Text style={styles.questionLabel}>{`QUESTION ${index + 1}`}</Text>
            <Text style={styles.questionText}>{question}</Text>
            <View style={styles.spacer12} />
            <TextInput
              value={answers[index] ?? ""}
              onChangeText={(text) => onChangeAnswer(index, text)}
              placeholder="Type your answer…"
              placeholderTextColor={Colors.placeholder}
              multiline
              style={styles.input}
              editable={!loading}
            />
          </Card>
        </View>
      ))}

      <PrimaryButton
        title="Get Diagnosis"
        onPress={onGetDiagnosis}
        disabled={!allAnswersProvided}
        loading={loading}
      />
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
  questionBlock: {
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  questionText: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "400",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 44,
  },
  spacer12: {
    height: 12,
  },
});

