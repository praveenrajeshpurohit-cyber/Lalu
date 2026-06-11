import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useApp } from "@/src/context/AppContext";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  style,
  testID,
  fullWidth,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  fullWidth?: boolean;
}) {
  const { colors } = useApp();

  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.primaryFg },
    accent: { bg: colors.accent, fg: colors.accentFg },
    outline: { bg: "transparent", fg: colors.primary, border: colors.primary },
    ghost: { bg: "transparent", fg: colors.primary },
    danger: { bg: colors.danger, fg: "#fff" },
  };

  const sizes: Record<Size, { ph: number; pv: number; fs: number; h: number }> = {
    sm: { ph: 14, pv: 8, fs: 13, h: 36 },
    md: { ph: 20, pv: 12, fs: 15, h: 46 },
    lg: { ph: 24, pv: 16, fs: 17, h: 56 },
  };

  const p = palette[variant];
  const s = sizes[size];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border || "transparent",
          borderWidth: p.border ? 1.5 : 0,
          paddingHorizontal: s.ph,
          paddingVertical: s.pv,
          minHeight: s.h,
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={p.fg} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, { color: p.fg, fontSize: s.fs }] as TextStyle[]}>
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { fontWeight: "700", letterSpacing: 0.2 },
});
