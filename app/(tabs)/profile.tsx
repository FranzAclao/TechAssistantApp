import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";

function getInitials(fullName: string | null | undefined, email: string | null | undefined): string {
  const name = (fullName ?? "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "";
    const initials = `${first}${second}`.toUpperCase();
    return initials || "PS";
  }

  const e = (email ?? "").trim();
  if (e) {
    const beforeAt = (e.split("@")[0] ?? "").trim();
    const first = beforeAt[0] ?? "";
    const second = beforeAt[1] ?? "";
    const initials = `${first}${second}`.toUpperCase();
    return initials || "PS";
  }

  return "PS";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const fullName = (user?.user_metadata as { full_name?: unknown } | undefined)?.full_name;
  const name = typeof fullName === "string" && fullName.trim().length > 0 ? fullName.trim() : "PesoSense User";
  const email = user?.email ?? "";

  const initials = useMemo(() => getInitials(typeof fullName === "string" ? fullName : null, email), [email, fullName]);

  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignOut() {
    setError(null);
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/screens/auth/LoginScreen");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to sign out. Please try again.";
      setError(message);
    } finally {
      setSigningOut(false);
    }
  }

  const settingsItems = ["Notifications", "Privacy Policy", "Terms of Service", "About PesoSense"];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Settings</Text>
      <Card>
        {settingsItems.map((label, idx) => (
          <View key={label}>
            <TouchableOpacity activeOpacity={0.8} style={styles.row} onPress={() => {}}>
              <Text style={styles.rowText}>{label}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
            {idx < settingsItems.length - 1 ? <View style={styles.rowDivider} /> : null}
          </View>
        ))}
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.spacer24} />

      <PrimaryButton label="Sign Out" onPress={onSignOut} disabled={signingOut} loading={signingOut} />

      <View style={styles.spacer12} />
      <Text style={styles.signOutHint}>You&apos;ll be returned to the login screen.</Text>
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
  header: {
    alignItems: "center",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  name: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  email: {
    marginTop: 6,
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 22,
  },
  sectionLabel: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  row: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  rowChevron: {
    fontSize: 22,
    color: COLORS.DISCLAIMER,
    marginLeft: 10,
    marginTop: -1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginLeft: 14,
  },
  errorText: {
    marginTop: 12,
    color: COLORS.DANGER,
    fontSize: 14,
    lineHeight: 18,
  },
  signOutHint: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.DISCLAIMER,
    lineHeight: 18,
  },
  spacer12: { height: 12 },
  spacer24: { height: 24 },
});

