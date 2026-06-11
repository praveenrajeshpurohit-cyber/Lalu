import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import type { Enrollment, Payment } from "@/src/lib/types";
import { Logo } from "@/src/components/Logo";

export default function StudentProfile() {
  const { colors, user, logout, isDark, toggleTheme } = useApp();
  const router = useRouter();
  const [enr, setEnr] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [e, p] = await Promise.all([
        api.get<Enrollment[]>("/enrollments/my"),
        api.get<Payment[]>("/payments/my"),
      ]);
      setEnr(e);
      setPayments(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="student-profile">
      <SafeAreaView edges={["top"]}>
        <View style={styles.head}>
          <Logo size="sm" />
          <Pressable
            onPress={toggleTheme}
            style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            testID="profile-theme-toggle"
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "S"}</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
          {!!user?.phone && (
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.phone}</Text>
          )}
          <View style={[styles.rolePill, { backgroundColor: colors.secondary }]}>
            <Text style={{ color: colors.secondaryFg, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
              {user?.role?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statRow]}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statN, { color: colors.textPrimary }]}>{enr.length}</Text>
            <Text style={[styles.statL, { color: colors.textSecondary }]}>Enrolled</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statN, { color: colors.textPrimary }]}>
              {payments.filter((p) => p.status === "approved").length}
            </Text>
            <Text style={[styles.statL, { color: colors.textSecondary }]}>Payments</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statN, { color: colors.textPrimary }]}>
              {payments.filter((p) => p.status === "pending").length}
            </Text>
            <Text style={[styles.statL, { color: colors.textSecondary }]}>Pending</Text>
          </View>
        </View>

        {/* Payment History */}
        <View>
          <Text style={[styles.sectionT, { color: colors.textPrimary }]}>Payment History</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : payments.length === 0 ? (
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No payments yet</Text>
          ) : (
            payments.map((p) => (
              <View
                key={p.id}
                style={[styles.payRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {p.course_title}
                  </Text>
                  <Text style={[styles.payDate, { color: colors.textSecondary }]}>
                    {new Date(p.created_at).toLocaleDateString()} • ₹{p.amount}
                  </Text>
                </View>
                <View
                  style={[
                    styles.payBadge,
                    {
                      backgroundColor:
                        p.status === "approved"
                          ? colors.success + "22"
                          : p.status === "pending"
                          ? colors.warning + "22"
                          : colors.danger + "22",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        p.status === "approved"
                          ? colors.success
                          : p.status === "pending"
                          ? colors.warning
                          : colors.danger,
                      fontWeight: "800",
                      fontSize: 11,
                      letterSpacing: 0.5,
                    }}
                  >
                    {p.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Settings */}
        <View>
          <Text style={[styles.sectionT, { color: colors.textPrimary }]}>Settings</Text>
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.listItem}>
              <Ionicons name="moon" size={18} color={colors.textPrimary} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Switch value={isDark} onValueChange={toggleTheme} testID="dark-mode-switch" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => router.push("/about")}
              style={styles.listItem}
              testID="profile-about"
            >
              <Ionicons name="information-circle" size={18} color={colors.textPrimary} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>About Comman School</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => router.push("/contact")}
              style={styles.listItem}
              testID="profile-contact"
            >
              <Ionicons name="mail" size={18} color={colors.textPrimary} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>Contact Us</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => router.push("/privacy")}
              style={styles.listItem}
              testID="profile-privacy"
            >
              <Ionicons name="shield-checkmark" size={18} color={colors.textPrimary} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => router.push("/terms")}
              style={styles.listItem}
              testID="profile-terms"
            >
              <Ionicons name="document-text" size={18} color={colors.textPrimary} />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => Linking.openURL("https://wa.me/918401094966")}
              style={styles.listItem}
              testID="profile-whatsapp"
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={[styles.listText, { color: colors.textPrimary }]}>WhatsApp Support</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={doLogout}
          style={[styles.logoutBtn, { borderColor: colors.danger }]}
          testID="logout-btn"
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: "800" }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  profileCard: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: "center", gap: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  name: { fontSize: 20, fontWeight: "800", marginTop: 12 },
  email: { fontSize: 13 },
  rolePill: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statRow: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  statN: { fontSize: 22, fontWeight: "800" },
  statL: { fontSize: 11, marginTop: 4 },
  sectionT: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  payRow: {
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  payTitle: { fontSize: 14, fontWeight: "700" },
  payDate: { fontSize: 12, marginTop: 2 },
  payBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  list: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  listText: { fontSize: 14, flex: 1, fontWeight: "600" },
  divider: { height: 1 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, padding: 14, borderRadius: 999, borderWidth: 1.5,
  },
});
