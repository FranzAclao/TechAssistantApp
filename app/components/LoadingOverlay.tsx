import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../constants/colors";

export function LoadingOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message?: string;
}) {
  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  message: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
  },
});

