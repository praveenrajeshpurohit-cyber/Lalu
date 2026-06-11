import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import type { LiveClass } from "@/src/lib/types";
import { useToast } from "@/src/components/Toast";

export default function StudentLive() {
  const { colors } = useApp();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LiveClass[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await api.get<LiveClass[]>("/live");
      setItems(data);
    } catch (e: any) {
      toast.show(e?.detail || "Failed to load live classes", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openLive = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      toast.show("Cannot open the live URL", "error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="student-live">
      <SafeAreaView edges={["top"]}>
        <View style={{ padding: 16 }}>
          <Text style={[styles.h1, { color: colors.textPrimary }]}>Live Classes</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Join scheduled & ongoing classes
          </Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const when = new Date(item.scheduled_at);
            const isPast = when.getTime() < Date.now() - item.duration_min * 60 * 1000;
            const isLiveNow =
              when.getTime() <= Date.now() && Date.now() < when.getTime() + item.duration_min * 60 * 1000;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: isLiveNow ? colors.danger + "22" : colors.secondary }]}>
                    <Ionicons
                      name={isLiveNow ? "radio" : "videocam"}
                      size={20}
                      color={isLiveNow ? colors.danger : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {isLiveNow && (
                      <View style={[styles.livePill, { backgroundColor: colors.danger }]}>
                        <Text style={styles.livePillText}>LIVE NOW</Text>
                      </View>
                    )}
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {!!item.description && (
                      <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <View style={[styles.row, { marginTop: 8, gap: 12 }]}>
                      <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.meta, { color: colors.textSecondary }]}>
                          {when.toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.meta, { color: colors.textSecondary }]}>
                          {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Pressable
                  disabled={isPast}
                  onPress={() => openLive(item.join_url)}
                  style={[
                    styles.btn,
                    {
                      backgroundColor: isPast ? colors.surface : isLiveNow ? colors.danger : colors.primary,
                      opacity: isPast ? 0.6 : 1,
                    },
                  ]}
                  testID={`join-live-${item.id}`}
                >
                  <Ionicons name={isPast ? "checkmark-done" : "enter"} size={16} color={isPast ? colors.textPrimary : "#fff"} />
                  <Text style={[styles.btnText, { color: isPast ? colors.textPrimary : "#fff" }]}>
                    {isPast ? "Ended" : isLiveNow ? "Join Now" : "Join Class"}
                  </Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons name="videocam-outline" size={42} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontWeight: "700", marginTop: 12 }}>
                No live classes scheduled
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4, textAlign: "center" }}>
                Live classes from your enrolled courses will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  sub: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 12 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "700" },
  desc: { fontSize: 13, marginTop: 4, lineHeight: 17 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 999,
  },
  btnText: { fontWeight: "700", fontSize: 14 },
  livePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start", marginBottom: 6 },
  livePillText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
});
