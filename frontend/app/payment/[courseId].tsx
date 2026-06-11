import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { useToast } from "@/src/components/Toast";
import type { Course, Settings } from "@/src/lib/types";

export default function Payment() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { colors } = useApp();
  const router = useRouter();
  const toast = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    if (!courseId) return;
    try {
      const [c, s] = await Promise.all([
        api.get<Course>(`/courses/${courseId}`, false),
        api.get<Settings>("/settings", false),
      ]);
      setCourse(c);
      setSettings(s);
    } catch (e: any) {
      toast.show(e?.detail || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.show("Photo permission required", "error");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets[0].base64) {
      setScreenshot(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const submit = async () => {
    if (!screenshot) {
      toast.show("Please upload your payment screenshot", "error");
      return;
    }
    if (!course) return;
    setSubmitting(true);
    try {
      await api.post("/payments", { course_id: course.id, screenshot, upi_ref: upiRef || undefined });
      setDone(true);
      toast.show("Payment submitted! Awaiting admin approval.", "success");
    } catch (e: any) {
      toast.show(e?.detail || "Failed to submit payment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openUpi = async () => {
    if (!settings) return;
    const amount = course?.discount_price ?? course?.price ?? 0;
    const url = `upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=Comman%20School&am=${amount}&cu=INR`;
    try {
      await Linking.openURL(url);
    } catch {
      toast.show("UPI app not available on this device", "error");
    }
  };

  if (loading || !course || !settings) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.doneWrap]}>
          <View style={[styles.doneIcon, { backgroundColor: colors.success + "22" }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.doneTitle, { color: colors.textPrimary }]}>Payment Submitted!</Text>
          <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
            Your payment is being verified by admin. Course access will be granted automatically once approved. You'll find the status in your profile.
          </Text>
          <Button
            title="Back to Dashboard"
            variant="primary"
            size="lg"
            onPress={() => router.replace("/student/home")}
            testID="done-back-home"
            fullWidth
          />
          <Button
            title="View Payment Status"
            variant="outline"
            onPress={() => router.replace("/student/profile")}
            testID="done-view-status"
            style={{ marginTop: 8 }}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  const amount = course.discount_price ?? course.price;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="payment-screen">
      <SafeAreaView edges={["top"]}>
        <View style={styles.head}>
          <Pressable onPress={() => router.back()} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headTitle, { color: colors.textPrimary }]}>Complete Payment</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 14 }}>
        {/* Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>YOU ARE ENROLLING IN</Text>
          <Text style={[styles.cTitle, { color: colors.textPrimary }]}>{course.title}</Text>
          <View style={styles.priceWrap}>
            <Text style={[styles.amount, { color: colors.primary }]}>₹{amount}</Text>
            {course.discount_price && (
              <Text style={[styles.strike, { color: colors.textSecondary }]}>₹{course.price}</Text>
            )}
          </View>
        </View>

        {/* Step 1: Pay via UPI */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stepHead}>
            <View style={[styles.stepNum, { backgroundColor: colors.primary }]}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Pay via UPI</Text>
          </View>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
            Scan the QR or use UPI ID below to pay ₹{amount}
          </Text>

          {settings.upi_qr ? (
            <Image source={{ uri: settings.upi_qr }} style={styles.qr} />
          ) : (
            <View style={[styles.qrPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="qr-code" size={64} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                QR will appear once admin uploads
              </Text>
            </View>
          )}

          <View style={[styles.upiRow, { backgroundColor: colors.secondary }]}>
            <Ionicons name="card" size={16} color={colors.secondaryFg} />
            <Text style={[styles.upiId, { color: colors.secondaryFg }]} selectable>
              {settings.upi_id}
            </Text>
          </View>

          <Button
            title="Open UPI App"
            variant="accent"
            onPress={openUpi}
            testID="open-upi"
            icon={<Ionicons name="open" size={16} color="#422800" />}
            fullWidth
          />
        </View>

        {/* Step 2: Upload screenshot */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stepHead}>
            <View style={[styles.stepNum, { backgroundColor: colors.primary }]}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Upload Payment Screenshot</Text>
          </View>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
            After paying, upload the success screenshot from your UPI app
          </Text>

          {screenshot ? (
            <View>
              <Image source={{ uri: screenshot }} style={styles.preview} />
              <Pressable
                onPress={() => setScreenshot(null)}
                style={[styles.removeBtn, { backgroundColor: colors.danger }]}
                testID="remove-screenshot"
              >
                <Ionicons name="trash" size={14} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickImage}
              style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.surface }]}
              testID="upload-screenshot"
            >
              <Ionicons name="cloud-upload" size={32} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.textPrimary }]}>Upload Screenshot</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>JPG, PNG up to ~5MB</Text>
            </Pressable>
          )}
        </View>

        {/* Step 3: UPI reference (optional) */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stepHead}>
            <View style={[styles.stepNum, { backgroundColor: colors.primary }]}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>UPI Reference (Optional)</Text>
          </View>
          <TextInput
            value={upiRef}
            onChangeText={setUpiRef}
            placeholder="e.g. 432109876543"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface }]}
            testID="upi-ref-input"
          />
        </View>

        <Button
          title="Submit Payment for Approval"
          onPress={submit}
          loading={submitting}
          size="lg"
          variant="primary"
          fullWidth
          testID="submit-payment"
        />
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          Admin will manually verify your payment within 24 hours. Once approved, course access is granted automatically.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headTitle: { fontSize: 15, fontWeight: "700" },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  smallLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  cTitle: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  priceWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  amount: { fontSize: 28, fontWeight: "800" },
  strike: { fontSize: 14, textDecorationLine: "line-through" },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  stepTitle: { fontSize: 15, fontWeight: "800" },
  stepSub: { fontSize: 13, marginTop: 2 },
  qr: { width: 220, height: 220, alignSelf: "center", borderRadius: 12, marginVertical: 12 },
  qrPlaceholder: {
    width: 220, height: 220, alignSelf: "center", borderRadius: 12, marginVertical: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  upiRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
  },
  upiId: { fontSize: 14, fontWeight: "700" },
  uploadBox: {
    padding: 32, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed",
    alignItems: "center", gap: 8,
  },
  uploadText: { fontSize: 14, fontWeight: "700" },
  preview: { width: "100%", aspectRatio: 1, borderRadius: 12, marginVertical: 8, resizeMode: "cover" },
  removeBtn: {
    position: "absolute", top: 16, right: 8,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
  },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  disclaimer: { fontSize: 11, textAlign: "center", marginTop: 8, lineHeight: 16, paddingHorizontal: 16 },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  doneIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  doneSub: { fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 18 },
});
