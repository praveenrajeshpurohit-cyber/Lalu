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
import { WhatsAppFAB } from "@/src/components/WhatsAppFAB";
import type { Course, Enrollment, LiveClass, Notification } from "@/src/lib/types";

export default function StudentHome() {
  const { colors, user } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [live, setLive] = useState<LiveClass[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    try {
      const [e, c, l, n] = await Promise.all([
        api.get<Enrollment[]>("/enrollments/my"),
        api.get<Course[]>("/courses", false),
        api.get<LiveClass[]>("/live"),
        api.get<Notification[]>("/notifications"),
      ]);
      setEnrollments(e);
      setCourses(c);
      setLive(l);
      setNotifs(n);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const enrolledCourses = courses.filter((c) =>
    enrollments.some((e) => e.course_id === c.id && e.status === "active"),
  );
  const nextLive = live[0];

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="student-home">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.background }}>
        <View style={styles.topBar}>
          <Logo size="sm" />
          <Pressable
            onPress={() => router.push("/student/profile")}
            style={[styles.avatar, { backgroundColor: colors.secondary }]}
            testID="profile-avatar"
          >
            <Text style={{ color: colors.secondaryFg, fontWeight: "800" }}>
              {user?.name?.[0]?.toUpperCase() || "S"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View style={{ padding: 16 }}>
          <Text style={[styles.greet, { color: colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name} 👋</Text>
        </View>

        {/* Next Live Class */}
        {nextLive && (
          <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
            <LinearGradient
              colors={[colors.primary, "#0052CC"]}
              style={styles.liveCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.liveBadge}>
                  <View style={[styles.pulse]} />
                  <Text style={styles.liveBadgeText}>UPCOMING LIVE</Text>
                </View>
                <Text style={styles.liveTitle} numberOfLines={2}>{nextLive.title}</Text>
                <Text style={styles.liveTime}>
                  {new Date(nextLive.scheduled_at).toLocaleString()}
                </Text>
                <Pressable
                  onPress={() => router.push("/student/live")}
                  style={styles.liveBtn}
                  testID="next-live-join"
                >
                  <Ionicons name="videocam" size={16} color="#0A2540" />
                  <Text style={styles.liveBtnText}>Join Class</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Enrolled" value={enrolledCourses.length} icon="book" color={colors.primary} />
          <StatBox label="Live Classes" value={live.length} icon="videocam" color={colors.success} />
          <StatBox label="Notifications" value={notifs.length} icon="notifications" color={colors.accent} />
        </View>

        {/* My Courses */}
        <View style={{ marginTop: 24 }}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Courses</Text>
            <Pressable onPress={() => router.push("/student/courses")} testID="see-all-courses">
              <Text style={{ color: colors.primary, fontWeight: "700" }}>See All</Text>
            </Pressable>
          </View>
          {enrolledCourses.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="library-outline" size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No courses yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Browse our catalog and enroll in your first course.
              </Text>
              <Pressable
                onPress={() => router.push("/student/courses")}
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                testID="browse-courses"
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Browse Courses</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {enrolledCourses.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/course/${c.id}`)}
                  style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  testID={`enrolled-${c.id}`}
                >
                  <View style={[styles.thumb, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="play-circle" size={42} color={colors.primary} />
                  </View>
                  <View style={{ padding: 12 }}>
                    <Text numberOfLines={2} style={[styles.cTitle, { color: colors.textPrimary }]}>{c.title}</Text>
                    <Text style={[styles.cMeta, { color: colors.textSecondary }]}>{c.category}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Latest notifications */}
        {notifs.length > 0 && (
          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
              Announcements
            </Text>
            {notifs.slice(0, 3).map((n) => (
              <View key={n.id} style={[styles.notifCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="megaphone" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{n.title}</Text>
                  <Text style={[styles.notifMsg, { color: colors.textSecondary }]} numberOfLines={2}>
                    {n.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <WhatsAppFAB bottomOffset={76} />
    </View>
  );
}

function StatBox({ label, value, icon, color }: any) {
  const { colors } = useApp();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  greet: { fontSize: 14 },
  name: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  liveCard: {
    borderRadius: 20, padding: 18, flexDirection: "row", gap: 14, alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)",
  },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFB800" },
  liveBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  liveTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 12, lineHeight: 22 },
  liveTime: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  liveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FFB800", paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 999, marginTop: 14, alignSelf: "flex-start",
  },
  liveBtnText: { color: "#0A2540", fontWeight: "800", fontSize: 13 },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginTop: 16 },
  statBox: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600" },
  sectionHead: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  empty: { marginHorizontal: 16, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginTop: 8 },
  emptySub: { fontSize: 13, textAlign: "center" },
  emptyBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginTop: 8 },
  courseCard: { width: 220, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  thumb: { aspectRatio: 16 / 9, alignItems: "center", justifyContent: "center" },
  cTitle: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  cMeta: { fontSize: 11, marginTop: 4 },
  notifCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8, alignItems: "flex-start" },
  notifTitle: { fontSize: 13, fontWeight: "700" },
  notifMsg: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
