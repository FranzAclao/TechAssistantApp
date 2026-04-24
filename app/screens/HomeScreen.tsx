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
import { useRouter } from "expo-router";

import { Card } from "../components/Card";
import { CategoryButton } from "../components/CategoryButton";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { PrimaryButton } from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";
import { generateQuestions } from "../services/apiService";

export default function HomeScreen() {
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    (typeof CATEGORIES)[number]["id"] | null
  >(null);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null;
  }, [selectedCategoryId]);

  async function onAnalyze() {
    const trimmed = problem.trim();
    if (!selectedCategory) {
      setError("Please choose a category to continue.");
      return;
    }
    if (!trimmed) {
      setError("Please describe your concern before continuing.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const questions = await generateQuestions(trimmed);
      router.push({
        pathname: "/screens/QuestionsScreen",
        params: {
          problem: trimmed,
          category: selectedCategory.id,
          questions: JSON.stringify(questions),
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = Boolean(selectedCategory) && problem.trim().length > 0 && !loading;

  const topRows = [
    [CATEGORIES[0], CATEGORIES[1]],
    [CATEGORIES[2], CATEGORIES[3]],
  ];
  const lastCategory = CATEGORIES[4];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <LoadingOverlay visible={loading} message="Analyzing your concern..." />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appName}>PesoSense</Text>
        <Text style={styles.tagline}>Your personal finance companion, built for Filipinos</Text>

        <Text style={styles.sectionLabel}>Choose a category</Text>
        <Card>
          <View style={styles.grid}>
            {topRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridRow}>
                {row.map((category) => (
                  <View key={category.id} style={styles.cell}>
                    <CategoryButton
                      label={category.label}
                      icon={category.icon}
                      selected={selectedCategoryId === category.id}
                      onPress={() => {
                        setSelectedCategoryId(category.id);
                        setProblem(category.hint);
                        setError(null);
                      }}
                    />
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.gridRowCentered}>
              <View style={styles.cellCentered}>
                <CategoryButton
                  label={lastCategory.label}
                  icon={lastCategory.icon}
                  selected={selectedCategoryId === lastCategory.id}
                  onPress={() => {
                    setSelectedCategoryId(lastCategory.id);
                    setProblem(lastCategory.hint);
                    setError(null);
                  }}
                />
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Your concern</Text>
        <Card>
          <TextInput
            value={problem}
            onChangeText={(text) => {
              setProblem(text);
              if (error) setError(null);
            }}
            placeholder="Describe your financial concern..."
            placeholderTextColor={COLORS.DISCLAIMER}
            multiline
            textAlignVertical="top"
            style={styles.input}
            editable={!loading}
          />
        </Card>

        <View style={styles.spacer16} />
        <PrimaryButton label="Analyze" onPress={onAnalyze} disabled={!canSubmit} loading={loading} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.PRIMARY,
    letterSpacing: -0.4,
  },
  tagline: {
    marginTop: 6,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 22,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    flex: 1,
    alignItems: "stretch",
  },
  cellCentered: {
    width: "48%",
    alignItems: "stretch",
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  spacer16: {
    height: 16,
  },
  errorText: {
    marginTop: 12,
    color: COLORS.DANGER,
    fontSize: 14,
    lineHeight: 18,
  },
});
