import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { COLORS } from "../constants/colors";

type Props = Omit<TouchableOpacityProps, "onPress"> & {
  label?: string;
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  title,
  onPress,
  disabled,
  loading,
  style,
  ...rest
}: Props) {
  const computedLabel = label ?? title ?? "";
  const isDisabled = Boolean(disabled) || Boolean(loading);

  return (
    <TouchableOpacity
      {...rest}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isDisabled ? styles.disabled : null, style]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.CARD} />
      ) : (
        <Text style={styles.text}>{computedLabel}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: COLORS.CARD,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

