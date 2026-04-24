import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "./constants/colors";
import { DiagnosisScreen } from "./screens/DiagnosisScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { QuestionsScreen } from "./screens/QuestionsScreen";
import { generateDiagnosis, generateQuestions } from "./services/geminiService";

type Step = 1 | 2 | 3;

export default function IndexScreen() {
  const [step, setStep] = useState<Step>(1);
  const [problem, setProblem] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswersProvided = useMemo(
    () => answers.length === 4 && answers.every((a) => a.trim().length > 0),
    [answers],
  );

  async function onAnalyzeProblem() {
    if (!problem.trim()) return;

    setError(null);
    setLoading(true);
    try {
      const nextQuestions = await generateQuestions(problem.trim());
      setQuestions(nextQuestions);
      setAnswers(["", "", "", ""]);
      setDiagnosis("");
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onGetDiagnosis() {
    if (!allAnswersProvided) {
      setError("Please answer all 4 questions before getting a diagnosis.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const answersRecord: Record<number, string> = {
        0: answers[0]?.trim() ?? "",
        1: answers[1]?.trim() ?? "",
        2: answers[2]?.trim() ?? "",
        3: answers[3]?.trim() ?? "",
      };

      const text = await generateDiagnosis(problem.trim(), questions, answersRecord);
      setDiagnosis(text);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function onStartOver() {
    setStep(1);
    setProblem("");
    setQuestions([]);
    setAnswers(["", "", "", ""]);
    setDiagnosis("");
    setError(null);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tech Assistant</Text>
        <Text style={styles.subtitle}>
          Describe your tech issue, answer 4 quick questions, then get a clear diagnosis and fix.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {step === 1 ? (
          <HomeScreen
            problem={problem}
            onChangeProblem={setProblem}
            onAnalyze={onAnalyzeProblem}
            loading={loading}
          />
        ) : null}

        {step === 2 ? (
          <QuestionsScreen
            questions={questions}
            answers={answers}
            onChangeAnswer={(index, text) => {
              setAnswers((prev) => {
                const next = [...prev];
                next[index] = text;
                return next;
              });
            }}
            onGetDiagnosis={onGetDiagnosis}
            onStartOver={onStartOver}
            loading={loading}
          />
        ) : null}

        {step === 3 ? (
          <DiagnosisScreen diagnosis={diagnosis} onStartOver={onStartOver} loading={loading} />
        ) : null}

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Thinking…</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "400",
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  errorText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "400",
    color: Colors.destructive,
    lineHeight: 20,
  },
  loadingRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.textSecondary,
  },
});

