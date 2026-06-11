import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { useToast } from "@/src/components/Toast";
import type { ContentItem, Course } from "@/src/lib/types";

type FormState = {
  id?: string;
  title: string;
  description: string;
  category: string;
  price: string;
  discount_price: string;
  validity_days: string;
  duration: string;
  level: string;
  is_free: boolean;
  is_enrollable: boolean;
};

const empty: FormState = {
  title: "", description: "", category: "Class 10",
  price: "0", discount_price: "", validity_days: "365",
  duration: "", level: "Beginner", is_free: false, is_enrollable: true,
};

export default function AdminCourses() {
  const { colors } = useApp();
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showContent, setShowContent] = useState<Course | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const load = useCallback(async () => {
    try {
      const c = await api.get<Course[]>("/courses", false);
      setCourses(c);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (c: Course) => {
    setForm({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: String(c.price),
      discount_price: c.discount_price ? String(c.discount_price) : "",
      validity_days: String(c.validity_days),
      duration: c.duration || "",
      level: c.level || "Beginner",
      is_free: c.is_free,
      is_enrollable: c.is_enrollable,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.show("Title required", "error");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price) || 0,
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      validity_days: Number(form.validity_days) || 365,
      duration: form.duration || null,
      level: form.level || null,
      is_free: form.is_free,
      is_enrollable: form.is_enrollable,
    };
    try {
      if (form.id) {
        await api.put(`/courses/${form.id}`, payload);
        toast.show("Course updated", "success");
      } else {
        await api.post("/courses", payload);
        toast.show("Course created", "success");
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  const del = async (id: string) => {
    try {
      await api.del(`/courses/${id}`);
      toast.show("Course deleted", "success");
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="admin-courses">
      <SafeAreaView edges={["top"]}>
        <View style={styles.head}>
          <View>
            <Text style={[styles.h1, { color: colors.textPrimary }]}>Courses</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{courses.length} courses</Text>
          </View>
          <Button title="+ New" size="sm" testID="new-course-btn" onPress={openCreate} />
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <View style={[styles.cat, { backgroundColor: colors.secondary }]}>
                    <Text style={{ color: colors.secondaryFg, fontSize: 11, fontWeight: "700" }}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={[styles.cTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
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
                    {!item.is_enrollable && (
                      <View style={[styles.disabledPill, { backgroundColor: colors.danger + "22" }]}>
                        <Text style={{ color: colors.danger, fontSize: 10, fontWeight: "800" }}>DISABLED</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => setShowContent(item)} style={styles.actionBtn} testID={`content-${item.id}`}>
                  <Ionicons name="folder" size={14} color={colors.primary} />
                  <Text style={[styles.actionTxt, { color: colors.primary }]}>Content</Text>
                </Pressable>
                <Pressable onPress={() => openEdit(item)} style={styles.actionBtn} testID={`edit-${item.id}`}>
                  <Ionicons name="create" size={14} color={colors.textPrimary} />
                  <Text style={[styles.actionTxt, { color: colors.textPrimary }]}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => del(item.id)} style={styles.actionBtn} testID={`delete-${item.id}`}>
                  <Ionicons name="trash" size={14} color={colors.danger} />
                  <Text style={[styles.actionTxt, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" onRequestClose={() => setShowForm(false)} transparent>
        <View style={[styles.modalBg]}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHead, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {form.id ? "Edit Course" : "New Course"}
              </Text>
              <Pressable onPress={() => setShowForm(false)} testID="close-form">
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              <InputField label="Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} testID="form-title" />
              <InputField
                label="Description"
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                multiline
                testID="form-description"
              />
              <InputField label="Category" value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} testID="form-category" />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Price (₹)"
                    value={form.price}
                    onChangeText={(t) => setForm({ ...form, price: t })}
                    keyboardType="numeric"
                    testID="form-price"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Discount Price (₹)"
                    value={form.discount_price}
                    onChangeText={(t) => setForm({ ...form, discount_price: t })}
                    keyboardType="numeric"
                    testID="form-discount"
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Validity (days)"
                    value={form.validity_days}
                    onChangeText={(t) => setForm({ ...form, validity_days: t })}
                    keyboardType="numeric"
                    testID="form-validity"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Duration"
                    value={form.duration}
                    onChangeText={(t) => setForm({ ...form, duration: t })}
                    testID="form-duration"
                  />
                </View>
              </View>
              <InputField label="Level" value={form.level} onChangeText={(t) => setForm({ ...form, level: t })} testID="form-level" />
              <View style={[styles.switchRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Free Course</Text>
                <Switch
                  value={form.is_free}
                  onValueChange={(v) => setForm({ ...form, is_free: v })}
                  testID="form-is-free"
                />
              </View>
              <View style={[styles.switchRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Enrollment Enabled</Text>
                <Switch
                  value={form.is_enrollable}
                  onValueChange={(v) => setForm({ ...form, is_enrollable: v })}
                  testID="form-is-enrollable"
                />
              </View>
              <Button title={form.id ? "Update" : "Create"} onPress={save} size="lg" fullWidth testID="save-course" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Content Modal */}
      {showContent && (
        <ContentModal course={showContent} onClose={() => setShowContent(null)} />
      )}
    </View>
  );
}

function InputField({ label, ...rest }: any) {
  const { colors } = useApp();
  return (
    <View>
      <Text style={[fstyles.label, { color: colors.textPrimary }]}>{label}</Text>
      <TextInput
        style={[
          fstyles.input,
          { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surface },
          rest.multiline && { minHeight: 80, textAlignVertical: "top", paddingTop: 12 },
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
    </View>
  );
}

function ContentModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const { colors } = useApp();
  const toast = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [type, setType] = useState<"video" | "pdf" | "assignment">("video");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.get<ContentItem[]>(`/courses/${course.id}/content`);
      setItems(data);
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    } finally {
      setLoading(false);
    }
  }, [course.id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!title.trim() || !url.trim()) {
      toast.show("Title and URL required", "error");
      return;
    }
    try {
      await api.post(`/courses/${course.id}/content`, {
        course_id: course.id,
        title,
        url,
        description: desc,
        type,
        order: items.length,
      });
      setTitle("");
      setUrl("");
      setDesc("");
      toast.show("Content added", "success");
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  const del = async (id: string) => {
    try {
      await api.del(`/content/${id}`);
      load();
    } catch (e: any) {
      toast.show(e?.detail || "Failed", "error");
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.modalBg}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHead, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {course.title}
            </Text>
            <Pressable onPress={onClose} testID="close-content">
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
              ADD NEW CONTENT
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["video", "pdf", "assignment"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    styles.typePill,
                    {
                      borderColor: type === t ? colors.primary : colors.border,
                      backgroundColor: type === t ? colors.primary : colors.surface,
                    },
                  ]}
                >
                  <Text style={{ color: type === t ? "#fff" : colors.textPrimary, fontWeight: "700", fontSize: 12 }}>
                    {t.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <InputField label="Title" value={title} onChangeText={setTitle} testID="content-title" />
            <InputField
              label={type === "video" ? "Video URL (YouTube/Drive)" : type === "pdf" ? "PDF URL (Drive link)" : "Assignment URL"}
              value={url}
              onChangeText={setUrl}
              testID="content-url"
              autoCapitalize="none"
            />
            <InputField label="Description (optional)" value={desc} onChangeText={setDesc} multiline />
            <Button title="Add Content" onPress={add} fullWidth testID="add-content-btn" />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
              EXISTING CONTENT ({items.length})
            </Text>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : items.length === 0 ? (
              <Text style={{ color: colors.textSecondary }}>No content added yet.</Text>
            ) : (
              items.map((it) => (
                <View key={it.id} style={[styles.contentRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Ionicons
                    name={it.type === "video" ? "play" : it.type === "pdf" ? "document-text" : "clipboard"}
                    size={18}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contentT, { color: colors.textPrimary }]} numberOfLines={1}>{it.title}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{it.type.toUpperCase()}</Text>
                  </View>
                  <Pressable onPress={() => del(it.id)} testID={`del-content-${it.id}`}>
                    <Ionicons name="trash" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", padding: 16, justifyContent: "space-between", alignItems: "center" },
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub: { fontSize: 12, marginTop: 2 },
  card: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  cat: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  cTitle: { fontSize: 15, fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  price: { fontSize: 18, fontWeight: "800" },
  strike: { fontSize: 13, textDecorationLine: "line-through" },
  disabledPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6 },
  actionTxt: { fontSize: 12, fontWeight: "700" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { height: "92%", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  modalHead: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  switchRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  typePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  divider: { height: 1, marginVertical: 4 },
  contentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  contentT: { fontSize: 13, fontWeight: "700" },
});

const fstyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
});
