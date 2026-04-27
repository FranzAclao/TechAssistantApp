import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";

function getGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(fullName: string | null | undefined, email: string | null | undefined): string {
  const name = (fullName ?? "").trim();
  if (name) return name;
  const e = (email ?? "").trim();
  if (!e) return "there";
  const beforeAt = e.split("@")[0] ?? "";
  return beforeAt.trim() || "there";
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const fullName = (user?.user_metadata as { full_name?: unknown } | undefined)?.full_name;
  const name = getDisplayName(typeof fullName === "string" ? fullName : null, user?.email ?? null);

  const greeting = useMemo(() => getGreeting(new Date()), []);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>{`${greeting}, ${name}! 👋`}</Text>
      <Text style={styles.subtitle}>How&apos;s your financial health today?</Text>

      <View style={styles.spacer24} />

      <Card>
        <Text style={styles.cardTitle}>Financial Health Score</Text>
        <Text style={styles.score}>-- / 100</Text>
        <Text style={styles.cardSubtitle}>Complete a check-in to see your score</Text>
        <View style={styles.spacer16} />
        <PrimaryButton label="Start Check-in" onPress={() => router.push("/screens/HomeScreen")} />
      </Card>

      <View style={styles.spacer24} />

      <Text style={styles.sectionLabel}>Recent Check-ins</Text>
      <Card>
        <Text style={styles.emptyState}>No check-ins yet</Text>
      </Card>
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
  greeting: {
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
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  score: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  sectionLabel: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  emptyState: {
    fontSize: 15,
    color: COLORS.DISCLAIMER,
    lineHeight: 20,
  },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
});

