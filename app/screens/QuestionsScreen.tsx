import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Card } from "../components/Card";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { PrimaryButton } from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";
import { generateDiagnosis } from "../services/apiService";

function CategoryTag({ categoryId }: { categoryId: string }) {
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? null;
  if (!category) return null;

  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{`${category.icon} ${category.label}`}</Text>
    </View>
  );
}

export default function QuestionsScreen() {
  const router = useRouter();
  const { problem, category, questions: questionsParam } = useLocalSearchParams();

  const problemText = typeof problem === "string" ? problem : "";
  const categoryId = typeof category === "string" ? category : "";
  const questions = useMemo(() => {
    if (typeof questionsParam !== "string") return [];
    try {
      const parsed = JSON.parse(questionsParam) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.map((q) => String(q));
    } catch {
      return [];
    }
  }, [questionsParam]);

  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answersFilledCount = useMemo(() => {
    return answers.filter((a) => a.trim().length > 0).length;
  }, [answers]);

  const canSubmit = answersFilledCount >= 2 && !loading && questions.length === 4;

  async function onSubmit() {
    if (!canSubmit) return;

    setError(null);
    setLoading(true);
    try {
      const answersRecord: Record<number, string> = {
        0: answers[0] ?? "",
        1: answers[1] ?? "",
        2: answers[2] ?? "",
        3: answers[3] ?? "",
      };

      const diagnosis = await generateDiagnosis(problemText, questions, answersRecord);

      router.push({
        pathname: "/screens/DiagnosisScreen",
        params: {
          problem: problemText,
          category: categoryId,
          diagnosis: JSON.stringify(diagnosis),
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <LoadingOverlay visible={loading} message="Generating your advice..." />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Help me understand better</Text>
        <CategoryTag categoryId={categoryId} />

        {questions.length !== 4 ? (
          <Text style={styles.errorText}>Missing questions. Please go back and try again.</Text>
        ) : (
          questions.map((q, i) => (
            <View key={`${i}-${q}`} style={styles.block}>
              <Card>
                <Text style={styles.questionLabel}>{`QUESTION ${i + 1}`}</Text>
                <Text style={styles.questionText}>{q}</Text>
                <View style={styles.spacer12} />
                <TextInput
                  value={answers[i] ?? ""}
                  onChangeText={(text) => {
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[i] = text;
                      return next;
                    });
                    if (error) setError(null);
                  }}
                  placeholder="Type your answer…"
                  placeholderTextColor={COLORS.DISCLAIMER}
                  multiline
                  style={styles.input}
                  editable={!loading}
                />
              </Card>
            </View>
          ))
        )}

        <PrimaryButton label="Get Advice" onPress={onSubmit} disabled={!canSubmit} loading={loading} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.helperText}>Answer at least 2 questions to continue.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
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
  block: {
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  questionText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  spacer12: {
    height: 12,
  },
  errorText: {
    marginTop: 12,
    color: COLORS.DANGER,
    fontSize: 14,
    lineHeight: 18,
  },
  helperText: {
    marginTop: 10,
    color: COLORS.DISCLAIMER,
    fontSize: 13,
    lineHeight: 18,
  },
});
