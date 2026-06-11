import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/src/context/AppContext";

export function Logo({ size = "md", showTagline }: { size?: "sm" | "md" | "lg"; showTagline?: boolean }) {
  const { colors } = useApp();
  const wordSize = size === "lg" ? 26 : size === "md" ? 20 : 16;
  const iconSize = size === "lg" ? 32 : size === "md" ? 26 : 22;
  return (
    <View style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
        <Ionicons name="school" size={iconSize - 6} color={colors.accent} />
      </View>
      <View>
        <Text style={[styles.word, { color: colors.textPrimary, fontSize: wordSize }]}>
          Comman<Text style={{ color: colors.primary }}> School</Text>
        </Text>
        {showTagline && (
          <Text style={[styles.tag, { color: colors.textSecondary }]}>Learn Anytime, Anywhere</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  word: { fontWeight: "800", letterSpacing: -0.4 },
  tag: { fontSize: 11, marginTop: 2, fontWeight: "500" },
});
