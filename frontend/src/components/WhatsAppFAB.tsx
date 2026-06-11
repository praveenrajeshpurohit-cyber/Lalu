import React from "react";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WA_NUMBER = "8401094966";
const WA_MESSAGE = "Hello, I want information about Comman School courses.";

export function WhatsAppFAB({ bottomOffset = 24 }: { bottomOffset?: number }) {
  const insets = useSafeAreaInsets();
  const onPress = async () => {
    const url = `https://wa.me/91${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;
    try {
      await Linking.openURL(url);
    } catch {
      /* noop */
    }
  };
  return (
    <View
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 8) + bottomOffset, pointerEvents: "box-none" }]}
    >
      <Pressable
        accessibilityLabel="Chat on WhatsApp"
        testID="whatsapp-fab"
        onPress={onPress}
        style={({ pressed }) => [styles.btn, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <Ionicons name="logo-whatsapp" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 18,
    zIndex: 50,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
});
