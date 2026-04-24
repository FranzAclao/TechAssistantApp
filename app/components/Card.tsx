import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { Colors } from "../constants/colors";

export function Card({
  children,
  accent,
  style,
  ...rest
}: ViewProps & { accent?: "success" }) {
  return (
    <View
      {...rest}
      style={[
        styles.card,
        accent === "success" ? styles.cardSuccess : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    paddingLeft: 12,
  },
});

