import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "@/src/context/AppContext";
import { Logo } from "@/src/components/Logo";

const HERO =
  "https://images.pexels.com/photos/4260481/pexels-photo-4260481.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function About() {
  const { colors } = useApp();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="about-screen">
      <SafeAreaView edges={["top"]}>
        <Header title="About Us" />
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 20 }}>
        <View style={{ alignItems: "center" }}>
          <Logo size="lg" showTagline />
        </View>
        <Image source={{ uri: HERO }} style={styles.heroImg} />
        <View>
          <Text style={[styles.h2, { color: colors.textPrimary }]}>Our Mission</Text>
          <Text style={[styles.p, { color: colors.textSecondary }]}>
            Comman School is built to make quality education accessible to every Gujarat Board English Medium student. We believe that geography or schedule should never limit a child's learning. With live classes, recorded lectures, downloadable notes and personalised guidance, we bring the classroom home.
          </Text>
        </View>
        <View>
          <Text style={[styles.h2, { color: colors.textPrimary }]}>About Praveen Sir</Text>
          <Text style={[styles.p, { color: colors.textSecondary }]}>
            With over a decade of teaching experience, Praveen Pareek has guided 500+ students through their board exams. His teaching style emphasises clarity, intuition, and exam-ready confidence. From foundations of Class 9 to specialised Science & Commerce streams in Class 12 — every student gets the same attention.
          </Text>
        </View>
        <View style={[styles.feature, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.h2, { color: colors.textPrimary }]}>Why Comman School?</Text>
          <Bullet text="Live + recorded classes for every topic" />
          <Bullet text="Detailed PDF notes & past-year question banks" />
          <Bullet text="Weekly assignments and chapter tests" />
          <Bullet text="Manual UPI verification — no card needed" />
          <Bullet text="WhatsApp doubt support 7 days a week" />
          <Bullet text="Course completion certificates" />
        </View>

        <Pressable
          onPress={() => router.push("/contact")}
          style={[styles.cta, { backgroundColor: colors.primary }]}
          testID="about-contact-cta"
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Talk to Us →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function Header({ title }: { title: string }) {
  const { colors } = useApp();
  const router = useRouter();
  return (
    <View style={hdr.head}>
      <Pressable onPress={() => router.back()} testID="back-btn" style={hdr.back}>
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
      </Pressable>
      <Text style={[hdr.title, { color: colors.textPrimary }]}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  const { colors } = useApp();
  return (
    <View style={styles.bullet}>
      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
      <Text style={[styles.bulletText, { color: colors.textPrimary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImg: { width: "100%", aspectRatio: 16 / 9, borderRadius: 16 },
  h2: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  p: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  feature: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 6 },
  bullet: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  bulletText: { fontSize: 14, flex: 1 },
  cta: { padding: 18, borderRadius: 999, alignItems: "center" },
});

const hdr = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", padding: 12 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 16, fontWeight: "800", textAlign: "center" },
});
