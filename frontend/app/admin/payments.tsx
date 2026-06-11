import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { useToast } from "@/src/components/Toast";
import type { Payment } from "@/src/lib/types";

const TABS: Array<{ k: "pending" | "approved" | "rejected"; label: string }> = [
  { k: "pending", label: "Pending" },
  { k: "approved", label: "Approved" },
  { k: "rejected", label: "Rejected" },
];

export default function AdminPayments() {
  const { colors } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Payment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Payment[]>(`/payments?status=${tab}`);
      setItems(data);
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    try {
      await api.post(`/payments/${id}/decision`, { status });
      toast.show(`Payment ${status}`, "success");
      setDetail(null);
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="admin-payments">
      <SafeAreaView edges={["top"]}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={[styles.h1, { color: colors.textPrimary }]}>Payments</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Review and approve UPI payments
          </Text>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", gap: 8 }}>
          {TABS.map((t) => {
            const active = tab === t.k;
            return (
              <Pressable
                key={t.k}
                onPress={() => setTab(t.k)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                testID={`tab-${t.k}`}
              >
                <Text style={{ color: active ? "#fff" : colors.textPrimary, fontWeight: "700", fontSize: 13 }}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setDetail(item)}
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              testID={`payment-${item.id}`}
            >
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Text style={{ color: colors.secondaryFg, fontWeight: "800" }}>
                  {item.user_name?.[0]?.toUpperCase() || "S"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.user_name}</Text>
                <Text style={[styles.course, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.course_title}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.amount, { color: colors.primary }]}>₹{item.amount}</Text>
                {tab === "pending" && (
                  <Text style={{ color: colors.warning, fontSize: 11, fontWeight: "700" }}>Review →</Text>
                )}
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons name="card-outline" size={42} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontWeight: "700", marginTop: 12 }}>
                No {tab} payments
              </Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        {detail && (
          <View style={styles.modalBg}>
            <View style={[styles.modal, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHead, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Payment Details</Text>
                <Pressable onPress={() => setDetail(null)} testID="close-detail">
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <DetailItem label="Student" value={detail.user_name} />
                <DetailItem label="Email" value={detail.user_email} />
                <DetailItem label="Course" value={detail.course_title} />
                <DetailItem label="Amount" value={`₹${detail.amount}`} highlight />
                <DetailItem label="UPI Ref" value={detail.upi_ref || "—"} />
                <DetailItem label="Date" value={new Date(detail.created_at).toLocaleString()} />
                <DetailItem label="Status" value={detail.status.toUpperCase()} />

                {detail.screenshot && (
                  <View>
                    <Text style={[fstyles.label, { color: colors.textPrimary }]}>Payment Screenshot</Text>
                    <Image source={{ uri: detail.screenshot }} style={styles.screenshot} />
                  </View>
                )}

                {detail.status === "pending" && (
                  <View style={{ gap: 10, marginTop: 12 }}>
                    <Button
                      title="✓ Approve & Grant Access"
                      onPress={() => decide(detail.id, "approved")}
                      variant="primary"
                      size="lg"
                      fullWidth
                      testID="approve-payment"
                    />
                    <Button
                      title="Reject Payment"
                      onPress={() => decide(detail.id, "rejected")}
                      variant="danger"
                      size="lg"
                      fullWidth
                      testID="reject-payment"
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { colors } = useApp();
  return (
    <View style={{ gap: 4 }}>
      <Text style={[fstyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={{
          color: highlight ? colors.primary : colors.textPrimary,
          fontSize: highlight ? 22 : 14,
          fontWeight: highlight ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub: { fontSize: 12, marginTop: 2 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: 14, borderWidth: 1,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontWeight: "700" },
  course: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 11, marginTop: 2 },
  amount: { fontSize: 18, fontWeight: "800" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { height: "92%", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  screenshot: { width: "100%", aspectRatio: 1, borderRadius: 12, marginTop: 8, resizeMode: "contain", backgroundColor: "#f1f5f9" },
});

const fstyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700" },
});
