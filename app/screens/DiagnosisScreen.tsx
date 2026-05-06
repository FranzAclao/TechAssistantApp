import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Marked from "react-native-marked";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";
import { generateFollowUp } from "../services/apiService";
import { saveCheckin } from "../services/checkinService";
import { useAuth } from "../context/AuthContext";

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
  const { category, diagnosis: diagnosisParam, problem, questions, answers } = useLocalSearchParams();
  const { user } = useAuth();

  const categoryId = typeof category === "string" ? category : "";
  const originalConcern = typeof problem === "string" ? problem : "";
  const diagnosis = useMemo(() => {
    if (typeof diagnosisParam !== "string") return "";
    try {
      return String(JSON.parse(diagnosisParam));
    } catch {
      return diagnosisParam;
    }
  }, [diagnosisParam]);

  const [savedAdvice, setSavedAdvice] = useState<string | null>(null);
  const [followUpInput, setFollowUpInput] = useState("");
  const [conversation, setConversation] = useState<{ role: "user" | "ai"; message: string }[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const isSaved = useMemo(() => savedAdvice === diagnosis && diagnosis.length > 0, [savedAdvice, diagnosis]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const save = async () => {
      try {
        console.log("=== DIAGNOSIS SCREEN MOUNTED ===");
        console.log("user:", user?.id);
        console.log("category:", category);
        console.log("problem:", problem);
        console.log("diagnosis length:", diagnosis?.length);

        if (!user?.id) {
          console.error("No user id found — skipping save");
          return;
        }

        if (!diagnosis) {
          console.error("No diagnosis found — skipping save");
          return;
        }

        // Parse questions and answers from router params
        const parsedQuestions = typeof questions === "string" ? JSON.parse(questions) : questions;

        const parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;

        console.log("Parsed questions:", parsedQuestions);
        console.log("Parsed answers:", parsedAnswers);

        await saveCheckin({
          user_id: user.id,
          category: category as string,
          concern: problem as string,
          questions: parsedQuestions,
          answers: parsedAnswers,
          advice: diagnosis as string,
          health_score: null,
        });
      } catch (error: any) {
        console.error("=== CHECKIN SAVE FAILED ===");
        console.error("Error:", error.message);
      }
    };

    save();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  async function sendFollowUp() {
    const trimmed = followUpInput.trim();
    if (!trimmed || followUpLoading) return;

    setFollowUpInput("");
    setConversation((prev) => [...prev, { role: "user", message: trimmed }]);

    setFollowUpLoading(true);
    try {
      const aiResponse = await generateFollowUp(originalConcern, diagnosis, conversation, trimmed);
      setConversation((prev) => [...prev, { role: "ai", message: aiResponse }]);
    } catch {
      setConversation((prev) => [
        ...prev,
        { role: "ai", message: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setFollowUpLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Your Financial Snapshot</Text>
      <CategoryTag categoryId={categoryId} />

      <Card>
        <Marked
          value={diagnosis}
          flatListProps={{
            scrollEnabled: false,
            style: { backgroundColor: COLORS.CARD },
          }}
          theme={{
            background: COLORS.CARD,
            text: COLORS.TEXT_PRIMARY,
            link: COLORS.PRIMARY,
            heading: COLORS.PRIMARY,
            code: COLORS.BACKGROUND,
            codeBlock: COLORS.BACKGROUND,
            border: COLORS.BORDER,
            table: {
              header: COLORS.PRIMARY,
              headerText: "#FFFFFF",
              oddRow: COLORS.CARD,
              evenRow: COLORS.BACKGROUND,
              text: COLORS.TEXT_PRIMARY,
              border: COLORS.BORDER,
            },
          }}
          styles={{
            text: {
              color: COLORS.TEXT_PRIMARY,
              fontSize: 15,
              lineHeight: 24,
            },
            heading1: {
              color: COLORS.PRIMARY,
              fontSize: 20,
              fontWeight: "700",
              marginTop: 16,
              marginBottom: 8,
            },
            heading2: {
              color: COLORS.PRIMARY,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 14,
              marginBottom: 6,
            },
            heading3: {
              color: COLORS.PRIMARY,
              fontSize: 16,
              fontWeight: "600",
              marginTop: 12,
              marginBottom: 4,
            },
            paragraph: {
              color: COLORS.TEXT_PRIMARY,
              fontSize: 15,
              lineHeight: 24,
              marginBottom: 8,
            },
            strong: {
              fontWeight: "700",
              color: COLORS.TEXT_PRIMARY,
            },
            em: {
              fontStyle: "italic",
              color: COLORS.TEXT_SECONDARY,
            },
            listItem: {
              color: COLORS.TEXT_PRIMARY,
              fontSize: 15,
              lineHeight: 24,
              marginBottom: 4,
            },
            code: {
              backgroundColor: COLORS.BACKGROUND,
              color: COLORS.PRIMARY,
              fontSize: 13,
              borderRadius: 4,
              padding: 4,
            },
            blockquote: {
              backgroundColor: COLORS.BACKGROUND,
              borderLeftColor: COLORS.PRIMARY,
              borderLeftWidth: 4,
              paddingLeft: 12,
              marginVertical: 8,
            },
            table: {
              borderWidth: 1,
              borderColor: COLORS.BORDER,
              borderRadius: 8,
              marginVertical: 12,
            },
            tableHeader: {
              backgroundColor: COLORS.PRIMARY,
              color: "#FFFFFF",
              fontWeight: "700",
              padding: 8,
              fontSize: 13,
            },
            tableData: {
              color: COLORS.TEXT_PRIMARY,
              padding: 8,
              fontSize: 13,
              borderTopWidth: 1,
              borderTopColor: COLORS.BORDER,
            },
          }}
        />
      </Card>

      <View style={styles.spacer16} />

      <Text style={styles.sectionTitle}>Continue the Conversation</Text>

      {conversation.length > 0 ? (
        <View style={styles.conversation}>
          {conversation.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <View key={`${idx}-${m.role}`} style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAi]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                  <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
                    {m.message}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.conversationEmpty}>Ask a follow-up question about your advice.</Text>
      )}

      <View style={styles.followUpRow}>
        <TextInput
          value={followUpInput}
          onChangeText={setFollowUpInput}
          placeholder="Ask a follow-up question..."
          placeholderTextColor={COLORS.DISCLAIMER}
          style={styles.followUpInput}
          editable={!followUpLoading}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={sendFollowUp}
          disabled={followUpLoading || followUpInput.trim().length === 0}
          style={[
            styles.sendButton,
            followUpLoading || followUpInput.trim().length === 0 ? styles.sendButtonDisabled : null,
          ]}
        >
          {followUpLoading ? (
            <ActivityIndicator color={COLORS.CARD} />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.spacer16} />

      <PrimaryButton
        label="New Concern"
        onPress={() => {
          setSavedAdvice(null);
          setFollowUpInput("");
          setConversation([]);
          setFollowUpLoading(false);
          router.replace("/screens/HomeScreen");
        }}
      />

      <View style={styles.spacer12} />
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (diagnosis) setSavedAdvice(diagnosis);
          }}
          style={[styles.secondaryHalfButton, isSaved ? styles.secondaryButtonSaved : null]}
        >
          <Text style={styles.secondaryHalfButtonText}>{isSaved ? "Saved" : "Save Advice"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Share.share({ message: diagnosis, title: "My Financial Advice from PesoSense" });
          }}
          style={styles.secondaryHalfButton}
        >
          <Text style={styles.secondaryHalfButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

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
  sectionTitle: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  conversation: {
    gap: 10,
  },
  conversationEmpty: {
    color: COLORS.DISCLAIMER,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowAi: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: COLORS.PRIMARY,
  },
  bubbleAi: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: COLORS.CARD,
  },
  bubbleTextAi: {
    color: COLORS.TEXT_PRIMARY,
  },
  followUpRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  followUpInput: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: COLORS.CARD,
    fontSize: 15,
    fontWeight: "700",
  },
  spacer16: {
    height: 16,
  },
  spacer12: {
    height: 12,
  },
  secondaryButtonSaved: {
    opacity: 0.8,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryHalfButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryHalfButtonText: {
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
