import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { Button } from "@/src/components/Button";
import { Logo } from "@/src/components/Logo";
import { useToast } from "@/src/components/Toast";

export default function Login() {
  const { colors, login } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      toast.show("Please enter email and password", "error");
      return;
    }
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      toast.show(`Welcome back, ${u.name}!`, "success");
      router.replace(u.role === "admin" ? "/admin/dashboard" : "/student/home");
    } catch (e: any) {
      toast.show(e?.detail || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} testID="login-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Back</Text>
          </Pressable>

          <View style={{ marginTop: 12 }}>
            <Logo size="lg" showTagline />
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={[styles.h1, { color: colors.textPrimary }]}>Welcome back</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Sign in to continue your learning journey
            </Text>
          </View>

          <View style={{ marginTop: 28, gap: 14 }}>
            <Field
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail"
              testID="login-email-input"
            />
            <Field
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              icon="lock-closed"
              right={
                <Pressable onPress={() => setShow((s) => !s)} testID="toggle-password">
                  <Ionicons
                    name={show ? "eye-off" : "eye"}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              }
              testID="login-password-input"
            />
          </View>

          <Button
            title="Sign In"
            onPress={onSubmit}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 24 }}
            testID="login-submit-button"
          />

          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>Don't have an account?</Text>
            <Link href="/register" testID="goto-register">
              <Text style={{ color: colors.primary, fontWeight: "700" }}> Register</Text>
            </Link>
          </View>

          <View
            style={[styles.adminHint, { backgroundColor: colors.surface, borderColor: colors.border }]}
            testID="admin-hint"
          >
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, flex: 1, lineHeight: 17 }}>
              Admin? Login with your registered admin credentials to access the admin panel.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Field({
  label,
  icon,
  right,
  testID,
  ...rest
}: any) {
  const { colors } = useApp();
  return (
    <View>
      <Text style={[fstyles.label, { color: colors.textPrimary }]}>{label}</Text>
      <View
        style={[
          fstyles.box,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.textSecondary} />}
        <TextInput
          style={[fstyles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.textSecondary}
          testID={testID}
          {...rest}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  back: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" },
  h1: { fontSize: 30, fontWeight: "800", letterSpacing: -0.6 },
  sub: { fontSize: 14, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16 },
  adminHint: {
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});

const fstyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 6 },
});
