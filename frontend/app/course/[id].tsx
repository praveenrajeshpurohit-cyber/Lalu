import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { useToast } from "@/src/components/Toast";
import type { ContentItem, Course } from "@/src/lib/types";

type Tab = "lessons" | "pdfs" | "assignments";

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, user } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("lessons");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const c = await api.get<Course>(`/courses/${id}`, false);
      setCourse(c);
      if (user) {
        try {
          const r = await api.get<{ enrolled: boolean }>(`/enrollments/check/${id}`);
          setEnrolled(r.enrolled);
          if (r.enrolled) {
            const items = await api.get<ContentItem[]>(`/courses/${id}/content`);
            setContent(items);
          }
        } catch {
          /* not enrolled */
        }
      }
    } catch (e: any) {
      toast.show(e?.detail || "Failed to load course", "error");
    } finally {
      setLoading(false);
    }
  }, [id, user, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !course) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const price = course.discount_price ?? course.price;

  const tabContent = content.filter((c) =>
    tab === "lessons" ? c.type === "video" : tab === "pdfs" ? c.type === "pdf" : c.type === "assignment",
  );

  const handleEnroll = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (course.is_free) {
      api
        .post("/payments", { course_id: course.id })
        .then(() => {
          toast.show("Enrolled successfully!", "success");
          load();
        })
        .catch((e: any) => toast.show(e?.detail || "Failed", "error"));
      return;
    }
    router.push(`/payment/${course.id}`);
  };

  const openContent = async (item: ContentItem) => {
    const url = item.url || (item.data?.startsWith("http") ? item.data : null);
    if (url) {
      try {
        await Linking.openURL(url);
      } catch {
        toast.show("Cannot open this content", "error");
      }
    } else if (item.data) {
      toast.show("Content available — open via download link", "info");
    } else {
      toast.show("No content URL", "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="course-detail-screen">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.background }}>
        <View style={styles.head}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {course.title}
          </Text>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={[styles.hero, { backgroundColor: colors.secondary }]}>
          <Ionicons name="play-circle" size={68} color={colors.primary} />
          <View style={[styles.heroTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroTagText}>{course.category}</Text>
          </View>
        </View>

        <View style={{ padding: 16, gap: 10 }}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{course.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color={colors.textSecondary} />
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{course.instructor}</Text>
            </View>
            {course.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{course.duration}</Text>
              </View>
            )}
            {course.level && (
              <View style={styles.metaItem}>
                <Ionicons name="trending-up" size={14} color={colors.textSecondary} />
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{course.level}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.desc, { color: colors.textSecondary }]}>{course.description}</Text>

          {/* Tabs */}
          <View style={[styles.tabs, { borderColor: colors.border }]}>
            {(["lessons", "pdfs", "assignments"] as Tab[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[
                  styles.tab,
                  tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                ]}
                testID={`tab-${t}`}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === t ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {t === "lessons" ? "Lessons" : t === "pdfs" ? "PDFs / Notes" : "Assignments"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab content */}
          <View style={{ marginTop: 14, gap: 10 }}>
            {!enrolled ? (
              <View style={[styles.lockedBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="lock-closed" size={24} color={colors.textSecondary} />
                <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>Content locked</Text>
                <Text style={[styles.lockedSub, { color: colors.textSecondary }]}>
                  Enroll in this course to access all lessons, notes, and assignments.
                </Text>
              </View>
            ) : tabContent.length === 0 ? (
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                No {tab} added yet for this course.
              </Text>
            ) : (
              tabContent.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => openContent(c)}
                  style={[styles.contentRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  testID={`content-${c.id}`}
                >
                  <View style={[styles.contentIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons
                      name={
                        c.type === "video"
                          ? "play"
                          : c.type === "pdf"
                          ? "document-text"
                          : "clipboard"
                      }
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contentTitle, { color: colors.textPrimary }]}>{c.title}</Text>
                    {!!c.description && (
                      <Text style={[styles.contentDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {c.description}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky enroll bar */}
      <View
        style={[
          styles.stickyBar,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          {enrolled ? (
            <Text style={[styles.enrolledText, { color: colors.success }]}>✓ Enrolled • Access granted</Text>
          ) : (
            <View>
              {course.is_free ? (
                <Text style={[styles.bigPrice, { color: colors.success }]}>FREE</Text>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.bigPrice, { color: colors.primary }]}>₹{price}</Text>
                  {course.discount_price && (
                    <Text style={[styles.bigStrike, { color: colors.textSecondary }]}>₹{course.price}</Text>
                  )}
                </View>
              )}
              <Text style={[styles.priceMeta, { color: colors.textSecondary }]}>
                {course.validity_days}-day access
              </Text>
            </View>
          )}
        </View>
        <Button
          title={enrolled ? "Continue Learning" : course.is_free ? "Enroll Free" : "Enroll Now"}
          onPress={handleEnroll}
          variant={enrolled ? "outline" : "primary"}
          testID="enroll-btn"
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headTitle: { flex: 1, fontSize: 15, fontWeight: "700" },
  hero: { aspectRatio: 16 / 9, alignItems: "center", justifyContent: "center", position: "relative" },
  heroTag: { position: "absolute", top: 14, left: 14, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  heroTagText: { color: "#fff", fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  metaRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12, fontWeight: "600" },
  desc: { fontSize: 14, lineHeight: 21, marginTop: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, marginTop: 12 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "700" },
  lockedBox: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 6 },
  lockedTitle: { fontSize: 15, fontWeight: "700" },
  lockedSub: { fontSize: 13, textAlign: "center", marginTop: 2 },
  contentRow: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 12,
    borderRadius: 12, borderWidth: 1,
  },
  contentIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  contentTitle: { fontSize: 14, fontWeight: "700" },
  contentDesc: { fontSize: 12, marginTop: 2 },
  stickyBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  bigPrice: { fontSize: 22, fontWeight: "800" },
  bigStrike: { fontSize: 14, textDecorationLine: "line-through" },
  priceMeta: { fontSize: 11, marginTop: 2 },
  enrolledText: { fontWeight: "800", fontSize: 14 },
});
