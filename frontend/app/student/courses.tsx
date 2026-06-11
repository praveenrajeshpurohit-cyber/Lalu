import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import type { Course, Enrollment } from "@/src/lib/types";
import { WhatsAppFAB } from "@/src/components/WhatsAppFAB";

const FALLBACK_CATS = ["All", "Class 9", "Class 10", "Class 11", "Class 12", "Languages"];

export default function CourseList() {
  const { colors } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [cats, setCats] = useState<string[]>(FALLBACK_CATS);

  const load = useCallback(async () => {
    try {
      const [c, e, cs] = await Promise.all([
        api.get<Course[]>("/courses", false),
        api.get<Enrollment[]>("/enrollments/my").catch(() => []),
        api.get<{ categories: string[] }>("/courses/categories", false).catch(() => ({ categories: [] })),
      ]);
      setCourses(c);
      setEnrollments(e || []);
      const merged = ["All", ...new Set([...(cs.categories || []), ...FALLBACK_CATS.slice(1)])];
      setCats(merged);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = cat === "All" || c.category === cat;
      const matchSearch =
        !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [courses, cat, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="course-list-screen">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <Text style={[styles.h1, { color: colors.textPrimary }]}>Explore Courses</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Find the perfect course for your class
          </Text>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search courses..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              testID="search-input"
            />
            {!!search && (
              <Pressable onPress={() => setSearch("")} testID="clear-search">
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Sticky filter chips */}
        <View style={{ height: 56, justifyContent: "center" }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}
          >
            {cats.map((c) => {
              const active = cat === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCat(c)}
                  testID={`chip-${c.replace(/\s+/g, "-").toLowerCase()}`}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? "#fff" : colors.textPrimary }]}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
          renderItem={({ item }) => {
            const isEnrolled = enrollments.some((e) => e.course_id === item.id && e.status === "active");
            return (
              <Pressable
                onPress={() => router.push(`/course/${item.id}`)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                testID={`course-card-${item.id}`}
              >
                <View style={[styles.thumb, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="play-circle" size={40} color={colors.primary} />
                  {isEnrolled && (
                    <View style={[styles.enrolledBadge, { backgroundColor: colors.success }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                      <Text style={styles.enrolledText}>Enrolled</Text>
                    </View>
                  )}
                </View>
                <View style={{ padding: 14, gap: 6 }}>
                  <View style={styles.row}>
                    <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.tagText, { color: colors.secondaryFg }]}>{item.category}</Text>
                    </View>
                    {item.level && (
                      <Text style={[styles.level, { color: colors.textSecondary }]}>{item.level}</Text>
                    )}
                  </View>
                  <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={[styles.row, { justifyContent: "space-between", marginTop: 4 }]}>
                    <View style={styles.priceRow}>
                      {item.is_free ? (
                        <Text style={[styles.price, { color: colors.success }]}>FREE</Text>
                      ) : (
                        <>
                          <Text style={[styles.price, { color: colors.primary }]}>
                            ₹{item.discount_price ?? item.price}
                          </Text>
                          {item.discount_price && (
                            <Text style={[styles.strike, { color: colors.textSecondary }]}>₹{item.price}</Text>
                          )}
                        </>
                      )}
                    </View>
                    {item.duration && (
                      <View style={styles.row}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.duration}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons name="search-outline" size={42} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontWeight: "700", marginTop: 12 }}>No courses found</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Try a different search or category</Text>
            </View>
          }
        />
      )}
      <WhatsAppFAB bottomOffset={76} />
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  sub: { fontSize: 13, marginTop: 4 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chip: {
    height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  chipText: { fontSize: 13, fontWeight: "700" },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  thumb: { aspectRatio: 16 / 9, alignItems: "center", justifyContent: "center", position: "relative" },
  enrolledBadge: {
    position: "absolute", top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 4,
  },
  enrolledText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "700" },
  level: { fontSize: 11, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 13, lineHeight: 18 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  price: { fontSize: 18, fontWeight: "800" },
  strike: { fontSize: 13, textDecorationLine: "line-through" },
  meta: { fontSize: 12 },
});
