import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { PrimaryButton } from "../../components/PrimaryButton";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      confirmPassword.trim().length > 0 &&
      !loading
    );
  }, [confirmPassword, email, fullName, loading, password]);

  function validate(): string | null {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return "Please fill out all fields.";
    }
    if (password.trim().length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  }

  async function onSubmit() {
    const validationError = validate();
    if (validationError) {
      setSuccess(null);
      setError(validationError);
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      setSuccess("Account created! Please check your email.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign up failed. Please try again.";
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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          disabled={loading}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your financial journey</Text>

        <View style={styles.spacer24} />

        <Text style={styles.sectionLabel}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (error) setError(null);
            if (success) setSuccess(null);
          }}
          placeholder="Juan Dela Cruz"
          placeholderTextColor={COLORS.DISCLAIMER}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.spacer16} />

        <Text style={styles.sectionLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null);
            if (success) setSuccess(null);
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
            if (success) setSuccess(null);
          }}
          placeholder="••••••••"
          placeholderTextColor={COLORS.DISCLAIMER}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          style={styles.input}
          editable={!loading}
        />

        <View style={styles.spacer16} />

        <Text style={styles.sectionLabel}>Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (error) setError(null);
            if (success) setSuccess(null);
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

        <PrimaryButton label="Create Account" onPress={onSubmit} disabled={!canSubmit} loading={loading} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <View style={styles.spacer16} />

        <Pressable
          onPress={() => router.replace("/screens/auth/LoginScreen")}
          disabled={loading}
          style={({ pressed }) => [styles.linkContainer, pressed && !loading ? styles.linkPressed : null]}
        >
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginLeft: -10,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  subtitle: {
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
  successText: {
    marginTop: 12,
    color: COLORS.SUCCESS,
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

