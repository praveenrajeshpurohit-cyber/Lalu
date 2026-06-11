import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import type { User } from "@/src/lib/types";

export default function AdminStudents() {
  const { colors } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const u = await api.get<User[]>("/admin/users");
      setUsers(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter(
    (u) =>
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="admin-students">
      <SafeAreaView edges={["top"]}>
        <View style={{ padding: 16 }}>
          <Text style={[styles.h1, { color: colors.textPrimary }]}>Students</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {users.length} total users
          </Text>
          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or email..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              testID="search-students"
            />
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: item.role === "admin" ? colors.accent : colors.secondary }]}>
                <Text style={{ color: item.role === "admin" ? "#422800" : colors.secondaryFg, fontWeight: "800" }}>
                  {item.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.email}
                </Text>
                {!!item.phone && (
                  <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.phone}
                  </Text>
                )}
              </View>
              <View style={[styles.role, { backgroundColor: item.role === "admin" ? colors.accent + "22" : colors.secondary }]}>
                <Text style={{ color: item.role === "admin" ? colors.accent : colors.secondaryFg, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }}>
                  {item.role.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: "center", padding: 24 }}>
              No students yet
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  sub: { fontSize: 12, marginTop: 2 },
  search: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  row: {
    flexDirection: "row", gap: 12, alignItems: "center",
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontWeight: "700" },
  email: { fontSize: 12, marginTop: 2 },
  role: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
