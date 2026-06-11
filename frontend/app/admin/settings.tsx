import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
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
import * as ImagePicker from "expo-image-picker";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { useToast } from "@/src/components/Toast";
import type { LiveClass, Settings } from "@/src/lib/types";

export default function AdminSettings() {
  const { colors } = useApp();
  const toast = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [liveItems, setLiveItems] = useState<LiveClass[]>([]);
  const [liveForm, setLiveForm] = useState({ title: "", join_url: "", description: "", date: "", time: "" });

  const load = useCallback(async () => {
    try {
      const settings = await api.get<Settings>("/settings", false);
      setS(settings);
      const live = await api.get<LiveClass[]>("/live");
      setLiveItems(live);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pickQR = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.show("Photo permission required", "error");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!res.canceled && res.assets[0].base64 && s) {
      setS({ ...s, upi_qr: `data:image/jpeg;base64,${res.assets[0].base64}` });
    }
  };

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      const updated = await api.put<Settings>("/settings", s);
      setS(updated);
      toast.show("Settings saved", "success");
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const addLive = async () => {
    if (!liveForm.title || !liveForm.join_url || !liveForm.date || !liveForm.time) {
      toast.show("Title, URL, date and time required", "error");
      return;
    }
    try {
      const dt = new Date(`${liveForm.date}T${liveForm.time}`);
      if (isNaN(dt.getTime())) {
        toast.show("Invalid date/time", "error");
        return;
      }
      await api.post("/live", {
        title: liveForm.title,
        description: liveForm.description,
        join_url: liveForm.join_url,
        scheduled_at: dt.toISOString(),
        duration_min: 60,
      });
      toast.show("Live class scheduled", "success");
      setLiveForm({ title: "", join_url: "", description: "", date: "", time: "" });
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  const delLive = async (id: string) => {
    try {
      await api.del(`/live/${id}`);
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  if (loading || !s) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="admin-settings">
      <SafeAreaView edges={["top"]}>
        <View style={{ padding: 16 }}>
          <Text style={[styles.h1, { color: colors.textPrimary }]}>Settings</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>UPI, branding & live classes</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
        {/* UPI */}
        <Section title="UPI Payment">
          <Field label="UPI ID" value={s.upi_id} onChangeText={(v: string) => setS({ ...s, upi_id: v })} testID="upi-id-input" />
          <Text style={[fstyles.label, { color: colors.textPrimary, marginTop: 12 }]}>UPI QR Code</Text>
          {s.upi_qr ? (
            <View>
              <Image source={{ uri: s.upi_qr }} style={styles.qr} />
              <Pressable onPress={pickQR} style={[styles.changeBtn, { borderColor: colors.border }]} testID="change-qr">
                <Ionicons name="image" size={14} color={colors.textPrimary} />
                <Text style={{ color: colors.textPrimary, fontWeight: "700", fontSize: 12 }}>Change QR</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={pickQR} style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.surface }]} testID="upload-qr">
              <Ionicons name="qr-code" size={36} color={colors.primary} />
              <Text style={{ color: colors.textPrimary, fontWeight: "700", marginTop: 8 }}>Upload UPI QR</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>JPG/PNG</Text>
            </Pressable>
          )}
        </Section>

        {/* Contact */}
        <Section title="Contact Info">
          <Field label="WhatsApp Number" value={s.whatsapp_number} onChangeText={(v: string) => setS({ ...s, whatsapp_number: v })} testID="whatsapp-input" />
          <Field label="Support Email" value={s.support_email} onChangeText={(v: string) => setS({ ...s, support_email: v })} testID="support-email-input" />
          <Field label="Support Phone" value={s.support_phone} onChangeText={(v: string) => setS({ ...s, support_phone: v })} testID="support-phone-input" />
        </Section>

        {/* Branding */}
        <Section title="Branding & Hero">
          <Field label="Hero Title" value={s.hero_title} onChangeText={(v: string) => setS({ ...s, hero_title: v })} testID="hero-title-input" />
          <Field label="Hero Subtitle" value={s.hero_subtitle} onChangeText={(v: string) => setS({ ...s, hero_subtitle: v })} multiline testID="hero-sub-input" />
          <Field label="Teacher Bio" value={s.teacher_bio} onChangeText={(v: string) => setS({ ...s, teacher_bio: v })} multiline testID="bio-input" />
          <Field label="Teacher Qualifications" value={s.teacher_qualifications} onChangeText={(v: string) => setS({ ...s, teacher_qualifications: v })} testID="qual-input" />
        </Section>

        <Button title="Save Settings" onPress={save} loading={saving} fullWidth size="lg" testID="save-settings-btn" />

        {/* Live classes */}
        <Section title="Live Classes">
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8 }}>
            Schedule new live class & paste your Zoom/Meet URL
          </Text>
          <Field label="Title" value={liveForm.title} onChangeText={(v: string) => setLiveForm({ ...liveForm, title: v })} testID="live-title" />
          <Field label="Join URL (Zoom/Meet/YouTube)" value={liveForm.join_url} onChangeText={(v: string) => setLiveForm({ ...liveForm, join_url: v })} autoCapitalize="none" testID="live-url" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="Date (YYYY-MM-DD)" value={liveForm.date} onChangeText={(v: string) => setLiveForm({ ...liveForm, date: v })} placeholder="2026-12-31" testID="live-date" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Time (HH:MM)" value={liveForm.time} onChangeText={(v: string) => setLiveForm({ ...liveForm, time: v })} placeholder="19:00" testID="live-time" />
            </View>
          </View>
          <Field label="Description (optional)" value={liveForm.description} onChangeText={(v: string) => setLiveForm({ ...liveForm, description: v })} testID="live-desc" />
          <Button title="Schedule Live Class" onPress={addLive} fullWidth testID="schedule-live" />

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginTop: 16 }}>
            EXISTING ({liveItems.length})
          </Text>
          {liveItems.map((l) => (
            <View key={l.id} style={[styles.liveRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="videocam" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.liveTitle, { color: colors.textPrimary }]} numberOfLines={1}>{l.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {new Date(l.scheduled_at).toLocaleString()}
                </Text>
              </View>
              <Pressable onPress={() => delLive(l.id)} testID={`del-live-${l.id}`}>
                <Ionicons name="trash" size={16} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionT, { color: colors.textPrimary }]}>{title}</Text>
      <View style={{ gap: 10, marginTop: 12 }}>{children}</View>
    </View>
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
          { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
          rest.multiline && { minHeight: 80, textAlignVertical: "top", paddingTop: 12 },
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub: { fontSize: 12, marginTop: 2 },
  section: { padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionT: { fontSize: 16, fontWeight: "800" },
  qr: { width: 200, height: 200, alignSelf: "center", borderRadius: 12 },
  uploadBox: {
    padding: 24, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed",
    alignItems: "center",
  },
  changeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
    alignSelf: "center", marginTop: 10,
  },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 8 },
  liveTitle: { fontSize: 13, fontWeight: "700" },
});

const fstyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
});
