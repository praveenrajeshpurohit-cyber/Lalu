import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { useToast } from "@/src/components/Toast";
import { Header } from "./about";

export default function Contact() {
  const { colors, user } = useApp();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.show("Please fill all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", { name, email, phone, message }, false);
      toast.show("Message sent! We'll reply soon.", "success");
      setMessage("");
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="contact-screen">
      <SafeAreaView edges={["top"]}>
        <Header title="Contact Us" />
      </SafeAreaView>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }} keyboardShouldPersistTaps="handled">
          <Text style={[styles.h1, { color: colors.textPrimary }]}>Get in Touch</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Reach out for course inquiries, doubts, or general feedback.
          </Text>

          <View style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <QuickAction
              icon="logo-whatsapp"
              color="#25D366"
              label="WhatsApp"
              value="+91 84010 94966"
              onPress={() => Linking.openURL("https://wa.me/918401094966")}
              testID="quick-whatsapp"
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <QuickAction
              icon="call"
              color={colors.primary}
              label="Call"
              value="+91 84010 94966"
              onPress={() => Linking.openURL("tel:+918401094966")}
              testID="quick-call"
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <QuickAction
              icon="mail"
              color={colors.accent}
              label="Email"
              value="Praveenrajeshpurohit@gmail.com"
              onPress={() => Linking.openURL("mailto:Praveenrajeshpurohit@gmail.com")}
              testID="quick-email"
            />
          </View>

          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Send us a message</Text>
          <Field label="Name *" value={name} onChangeText={setName} testID="contact-name" />
          <Field label="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" testID="contact-email" />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="contact-phone" />
          <Field
            label="Message *"
            value={message}
            onChangeText={setMessage}
            multiline
            testID="contact-message"
          />
          <Button title="Send Message" onPress={submit} loading={loading} size="lg" fullWidth testID="contact-submit" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function QuickAction({ icon, color, label, value, onPress, testID }: any) {
  const { colors } = useApp();
  return (
    <Pressable onPress={onPress} style={styles.qa} testID={testID}>
      <View style={[styles.qaIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.qaLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.qaValue, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

function Field({ label, ...rest }: any) {
  const { colors } = useApp();
  return (
    <View>
      <Text style={[fstyles.label, { color: colors.textPrimary }]}>{label}</Text>
      <TextInput
        style={[
          fstyles.input,
          { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface },
          rest.multiline && { minHeight: 100, textAlignVertical: "top", paddingTop: 12 },
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub: { fontSize: 14, marginTop: 4 },
  quickCard: { borderRadius: 16, borderWidth: 1, padding: 4 },
  qa: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  qaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, fontWeight: "700" },
  qaValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  divider: { height: 1, marginHorizontal: 12 },
  formTitle: { fontSize: 16, fontWeight: "800", marginTop: 6 },
});

const fstyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
});
