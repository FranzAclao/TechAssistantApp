import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../constants/colors";

type Props = ViewProps & {
  children: React.ReactNode;
  gradientStart?: string;
  gradientEnd?: string;
  glowColor?: string;
};

export function Card({ children, style, gradientStart, gradientEnd, glowColor, ...rest }: Props) {
  const borderColor = gradientStart ? `${gradientStart}30` : COLORS.BORDER;

  const shadowStyle = glowColor
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 30,
        elevation: 12,
      }
    : {
        shadowColor: COLORS.BACKGROUND_DEEP,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 6,
      };

  return (
    <View {...rest} style={[styles.glowWrap, shadowStyle, style]}>
      {gradientStart ? (
        <LinearGradient
          colors={[`${gradientStart}40`, gradientEnd ?? COLORS.BACKGROUND]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor }]}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.card, styles.cardDefault, { borderColor }]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    borderRadius: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  cardDefault: {
    backgroundColor: COLORS.GLASS,
  },
});
