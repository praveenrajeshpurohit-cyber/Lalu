import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Logo } from "@/src/components/Logo";
import type { Stats } from "@/src/lib/types";

export default function AdminDashboard() {
  const { colors, user, logout, isDark, toggleTheme } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await api.get<Stats>("/admin/stats");
      setStats(s);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="admin-dashboard">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.background }}>
        <View style={styles.top}>
          <Logo size="sm" />
          <View style={styles.topActions}>
            <Pressable
              onPress={toggleTheme}
              style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              testID="admin-theme-toggle"
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={16} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={async () => { await logout(); router.replace("/"); }}
              style={[styles.iconBtn, { borderColor: colors.danger, backgroundColor: colors.surface }]}
              testID="admin-logout"
            >
              <Ionicons name="log-out-outline" size={16} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <LinearGradient
          colors={[colors.primary, "#0052CC"]}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.adminName}>{user?.name} 👋</Text>
          <Text style={styles.adminSub}>Here's what's happening at Comman School today.</Text>
        </LinearGradient>

        {loading || !stats ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard label="Students" value={stats.students} icon="people" color={colors.primary} />
              <StatCard label="Courses" value={stats.courses} icon="book" color={colors.success} />
              <StatCard label="Active Enrolls" value={stats.enrollments} icon="checkmark-circle" color={colors.accent} />
              <StatCard
                label="Pending Pay"
                value={stats.pending_payments}
                icon="alert-circle"
                color={colors.warning}
                highlight={stats.pending_payments > 0}
              />
            </View>

            <View style={[styles.revenueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>TOTAL REVENUE</Text>
              <Text style={[styles.revenue, { color: colors.textPrimary }]}>
                ₹{stats.total_revenue.toLocaleString("en-IN")}
              </Text>
              <Text style={[styles.revenueMeta, { color: colors.textSecondary }]}>
                from all approved payments
              </Text>
            </View>

            {/* Quick Actions */}
            <View>
              <Text style={[styles.sectionT, { color: colors.textPrimary }]}>Quick Actions</Text>
              <View style={styles.actions}>
                <ActionTile
                  icon="add-circle"
                  label="New Course"
                  color={colors.primary}
                  onPress={() => router.push("/admin/courses")}
                  testID="action-new-course"
                />
                <ActionTile
                  icon="card"
                  label="Pending Payments"
                  color={colors.warning}
                  onPress={() => router.push("/admin/payments")}
                  testID="action-pending-payments"
                  badge={stats.pending_payments}
                />
                <ActionTile
                  icon="people"
                  label="Students"
                  color={colors.success}
                  onPress={() => router.push("/admin/students")}
                  testID="action-students"
                />
                <ActionTile
                  icon="settings"
                  label="Settings"
                  color={colors.textPrimary}
                  onPress={() => router.push("/admin/settings")}
                  testID="action-settings"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, color, highlight }: any) {
  const { colors } = useApp();
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: highlight ? color + "15" : colors.surface,
          borderColor: highlight ? color : colors.border,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ActionTile({ icon, label, color, onPress, testID, badge }: any) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={testID}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={20} color={color} />
        {badge > 0 && (
          <View style={[styles.badge, { backgroundColor: "#EF4444" }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  topActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  heroCard: { padding: 24, borderRadius: 20 },
  welcome: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  adminName: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 4 },
  adminSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", padding: 14, borderRadius: 16, borderWidth: 1, gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 28, fontWeight: "800", marginTop: 4 },
  statLabel: { fontSize: 11, fontWeight: "600" },
  revenueCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  smallLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  revenue: { fontSize: 36, fontWeight: "800", marginTop: 8 },
  revenueMeta: { fontSize: 12, marginTop: 4 },
  sectionT: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionTile: { width: "48%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  actionIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", position: "relative",
  },
  actionLabel: { fontSize: 14, fontWeight: "700" },
  badge: {
    position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
