import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { Colors } from "../constants/colors";

export function PrimaryButton({
  title,
  tone = "primary",
  loading,
  disabled,
  onPress,
  ...rest
}: Omit<TouchableOpacityProps, "onPress"> & {
  title: string;
  onPress: () => void;
  tone?: "primary" | "destructive";
  loading?: boolean;
}) {
  const isDisabled = Boolean(disabled) || Boolean(loading);

  return (
    <TouchableOpacity
      {...rest}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        tone === "destructive" ? styles.destructive : styles.primary,
        isDisabled ? styles.disabled : null,
        rest.style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  destructive: {
    backgroundColor: Colors.destructive,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.white,
    letterSpacing: 0.2,
  },
});

