import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { COLORS } from "../constants/colors";

type Props = ViewProps & {
  children: React.ReactNode;
};

export function Card({ children, style, ...rest }: Props) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

