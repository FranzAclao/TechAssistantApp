import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "../../components/PrimaryButton";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !loading;
  }, [email, loading, password]);

  async function onSubmit() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signIn(trimmedEmail, trimmedPassword);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign in failed. Please try again.";
      setError(message);
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>PesoSense</Text>
        <Text style={styles.tagline}>Your personal finance companion</Text>

        <View style={styles.spacer24} />

        <Text style={styles.sectionLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null);
          }}
          placeholder="you@email.com"
          placeholderTextColor={COLORS.DISCLAIMER}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.spacer16} />

        <Text style={styles.sectionLabel}>Password</Text>
        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError(null);
          }}
          placeholder="••••••••"
          placeholderTextColor={COLORS.DISCLAIMER}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.spacer20} />

        <PrimaryButton label="Sign In" onPress={onSubmit} disabled={!canSubmit} loading={loading} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.spacer16} />

        <Pressable
          onPress={() => router.push("/screens/auth/SignUpScreen")}
          disabled={loading}
          style={({ pressed }) => [styles.linkContainer, pressed && !loading ? styles.linkPressed : null]}
        >
          <Text style={styles.linkText}>Don&apos;t have an account? Sign Up</Text>
        </Pressable>
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
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
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
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  errorText: {
    marginTop: 12,
    color: COLORS.DANGER,
    fontSize: 14,
    lineHeight: 18,
  },
  linkContainer: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  spacer16: { height: 16 },
  spacer20: { height: 20 },
  spacer24: { height: 24 },
});

