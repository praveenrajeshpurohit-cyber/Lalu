import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { Button } from "@/src/components/Button";
import { Logo } from "@/src/components/Logo";
import { useToast } from "@/src/components/Toast";
import { Field } from "./login";

export default function Register() {
  const { colors, register } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      toast.show("Please fill all required fields", "error");
      return;
    }
    if (password.length < 6) {
      toast.show("Password must be at least 6 characters", "error");
      return;
    }
    setLoading(true);
    try {
      const u = await register(email.trim(), password, name.trim(), phone || undefined);
      toast.show(`Welcome aboard, ${u.name}!`, "success");
      router.replace("/student/home");
    } catch (e: any) {
      toast.show(e?.detail || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} testID="register-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Back</Text>
          </Pressable>
          <View style={{ marginTop: 12 }}>
            <Logo size="lg" showTagline />
          </View>
          <View style={{ marginTop: 28 }}>
            <Text style={[styles.h1, { color: colors.textPrimary }]}>Create your account</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Free signup — start learning in seconds
            </Text>
          </View>

          <View style={{ marginTop: 24, gap: 14 }}>
            <Field
              label="Full Name *"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              icon="person"
              testID="register-name-input"
            />
            <Field
              label="Email *"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail"
              testID="register-email-input"
            />
            <Field
              label="Phone (optional)"
              placeholder="+91 9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call"
              testID="register-phone-input"
            />
            <Field
              label="Password *"
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              icon="lock-closed"
              right={
                <Pressable onPress={() => setShow((s) => !s)} testID="toggle-password">
                  <Ionicons name={show ? "eye-off" : "eye"} size={18} color={colors.textSecondary} />
                </Pressable>
              }
              testID="register-password-input"
            />
          </View>

          <Button
            title="Create Account"
            onPress={onSubmit}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 24 }}
            testID="register-submit-button"
          />

          <View style={styles.row}>
            <Text style={{ color: colors.textSecondary }}>Already have an account?</Text>
            <Link href="/login" testID="goto-login">
              <Text style={{ color: colors.primary, fontWeight: "700" }}> Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  back: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" },
  h1: { fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  sub: { fontSize: 14, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16 },
});
