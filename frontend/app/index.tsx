import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/src/context/AppContext";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/Button";
import { Logo } from "@/src/components/Logo";
import { WhatsAppFAB } from "@/src/components/WhatsAppFAB";
import type { Course, FAQ, Settings, Testimonial } from "@/src/lib/types";

const HERO_IMG =
  "https://images.pexels.com/photos/4260481/pexels-photo-4260481.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const TEACHER_IMG =
  "https://images.pexels.com/photos/5212675/pexels-photo-5212675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const CATEGORIES = [
  { name: "Class 9", icon: "book", color: "#3B82F6" },
  { name: "Class 10", icon: "school", color: "#10B981" },
  { name: "Class 11", icon: "library", color: "#F59E0B" },
  { name: "Class 12", icon: "ribbon", color: "#EF4444" },
  { name: "Languages", icon: "globe", color: "#8B5CF6" },
  { name: "All", icon: "grid", color: "#0EA5E9" },
];

export default function Landing() {
  const { colors, user, bootstrapped, toggleTheme, isDark } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [courses, setCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, t, f, s] = await Promise.all([
        api.get<Course[]>("/courses", false),
        api.get<Testimonial[]>("/testimonials", false),
        api.get<FAQ[]>("/faqs", false),
        api.get<Settings>("/settings", false),
      ]);
      setCourses(c);
      setTestimonials(t);
      setFaqs(f);
      setSettings(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // If user is logged in, redirect away from landing
  useEffect(() => {
    if (!bootstrapped) return;
    if (user?.role === "admin") router.replace("/admin/dashboard");
    else if (user?.role === "student") router.replace("/student/home");
  }, [bootstrapped, user, router]);

  if (!bootstrapped || loading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="landing-screen">
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.background }}>
        <View style={styles.topBar}>
          <Logo size="md" />
          <View style={styles.topActions}>
            <Pressable
              onPress={toggleTheme}
              testID="theme-toggle"
              style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.textPrimary} />
            </Pressable>
            <Button title="Login" variant="outline" size="sm" testID="nav-login" onPress={() => router.push("/login")} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        testID="landing-scroll"
      >
        {/* HERO */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[colors.primary, isDark ? "#0F172A" : "#0052CC"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.heroBadge}>
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                <Text style={styles.heroBadgeText}>Gujarat Board • English Medium</Text>
              </View>
              <Text style={styles.heroTitle}>{settings?.hero_title || "Learn Anytime,\nAnywhere"}</Text>
              <Text style={styles.heroSubtitle}>{settings?.hero_subtitle}</Text>
              <View style={styles.heroCtaRow}>
                <Button
                  title="Join Live Classes"
                  variant="accent"
                  size="lg"
                  testID="hero-cta-join-live"
                  onPress={() => router.push("/register")}
                  icon={<Ionicons name="videocam" size={18} color="#422800" />}
                />
                <Button
                  title="Explore Courses"
                  variant="ghost"
                  size="lg"
                  testID="hero-cta-courses"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                  onPress={() => router.push("/register")}
                />
              </View>
              <View style={styles.heroStats}>
                <Stat n="500+" label="Students" />
                <View style={styles.statDivider} />
                <Stat n="10+" label="Courses" />
                <View style={styles.statDivider} />
                <Stat n="4.9" label="Rating" />
              </View>
            </View>
            {isTablet && (
              <View style={styles.heroImageWrap}>
                <Image source={{ uri: HERO_IMG }} style={styles.heroImage} />
              </View>
            )}
          </LinearGradient>
        </View>

        {/* CATEGORIES */}
        <View style={styles.section}>
          <SectionTitle title="Browse Categories" subtitle="Find your class & subject" />
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.name}
                onPress={() => router.push("/register")}
                style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                testID={`category-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <View style={[styles.catIcon, { backgroundColor: c.color + "22" }]}>
                  <Ionicons name={c.icon as any} size={22} color={c.color} />
                </View>
                <Text style={[styles.catName, { color: colors.textPrimary }]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* FEATURED COURSES */}
        <View style={styles.section}>
          <SectionTitle title="Featured Courses" subtitle="Hand-picked by Praveen Sir" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {courses.slice(0, 5).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push("/register")}
                style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                testID={`landing-course-${c.id}`}
              >
                <View style={[styles.thumb, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="play-circle" size={42} color={colors.primary} />
                </View>
                <View style={styles.coursePad}>
                  <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.tagText, { color: colors.secondaryFg }]}>{c.category}</Text>
                  </View>
                  <Text numberOfLines={2} style={[styles.courseTitle, { color: colors.textPrimary }]}>
                    {c.title}
                  </Text>
                  <View style={styles.priceRow}>
                    {c.is_free ? (
                      <Text style={[styles.price, { color: colors.success }]}>FREE</Text>
                    ) : (
                      <>
                        <Text style={[styles.price, { color: colors.primary }]}>
                          ₹{c.discount_price ?? c.price}
                        </Text>
                        {c.discount_price && (
                          <Text style={[styles.strike, { color: colors.textSecondary }]}>₹{c.price}</Text>
                        )}
                      </>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* TEACHER */}
        <View style={styles.section}>
          <View style={[styles.teacherCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={{ uri: settings?.teacher_image || TEACHER_IMG }} style={styles.teacherImg} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.tinyOverline, { color: colors.secondaryFg }]}>YOUR INSTRUCTOR</Text>
              <Text style={[styles.teacherName, { color: colors.textPrimary }]}>Praveen Pareek</Text>
              <Text style={[styles.teacherQual, { color: colors.textSecondary }]}>
                {settings?.teacher_qualifications}
              </Text>
              <Text style={[styles.teacherBio, { color: colors.textSecondary }]} numberOfLines={4}>
                {settings?.teacher_bio}
              </Text>
            </View>
          </View>
        </View>

        {/* TESTIMONIALS */}
        <View style={styles.section}>
          <SectionTitle title="What Students Say" subtitle="Real results from real learners" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {testimonials.map((t) => (
              <View
                key={t.id}
                style={[styles.testiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                testID={`testimonial-${t.id}`}
              >
                <View style={styles.stars}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color={colors.accent} />
                  ))}
                </View>
                <Text style={[styles.quote, { color: colors.textPrimary }]}>"{t.quote}"</Text>
                <View style={styles.testiFooter}>
                  <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                    <Text style={{ color: colors.secondaryFg, fontWeight: "700" }}>{t.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.testiName, { color: colors.textPrimary }]}>{t.name}</Text>
                    <Text style={[styles.testiRole, { color: colors.textSecondary }]}>{t.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <SectionTitle title="Frequently Asked Questions" subtitle="Got questions? We've got answers." />
          <View style={{ paddingHorizontal: 16, gap: 8 }}>
            {faqs.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                style={[styles.faq, { backgroundColor: colors.surface, borderColor: colors.border }]}
                testID={`faq-${f.id}`}
              >
                <View style={styles.faqHead}>
                  <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{f.question}</Text>
                  <Ionicons
                    name={openFaq === f.id ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {openFaq === f.id && (
                  <Text style={[styles.faqA, { color: colors.textSecondary }]}>{f.answer}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* CONTACT */}
        <View style={styles.section}>
          <View style={[styles.contactCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.contactTitle}>Need help?</Text>
            <Text style={styles.contactSub}>Reach out anytime — we usually reply within an hour.</Text>
            <View style={styles.contactGrid}>
              <ContactItem icon="call" label={settings?.support_phone || "8401094966"} />
              <ContactItem icon="mail" label={settings?.support_email || "Praveenrajeshpurohit@gmail.com"} small />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <Button
                title="Get Started Free"
                variant="accent"
                testID="contact-cta-register"
                onPress={() => router.push("/register")}
              />
              <Button
                title="About Us"
                variant="ghost"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                onPress={() => router.push("/about")}
                testID="nav-about"
              />
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Logo size="sm" />
          <View style={styles.footerLinks}>
            <FooterLink label="About" onPress={() => router.push("/about")} testID="footer-about" />
            <FooterLink label="Contact" onPress={() => router.push("/contact")} testID="footer-contact" />
            <FooterLink label="Privacy" onPress={() => router.push("/privacy")} testID="footer-privacy" />
            <FooterLink label="Terms" onPress={() => router.push("/terms")} testID="footer-terms" />
          </View>
          <Text style={[styles.copy, { color: colors.textSecondary }]}>
            © 2026 Comman School. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      <WhatsAppFAB />
    </View>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useApp();
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {!!subtitle && <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
}

function ContactItem({ icon, label, small }: { icon: any; label: string; small?: boolean }) {
  return (
    <View style={styles.contactItem}>
      <Ionicons name={icon} size={16} color="#fff" />
      <Text style={[styles.contactText, small && { fontSize: 12 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function FooterLink({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  const { colors } = useApp();
  return (
    <Pressable onPress={onPress} testID={testID}>
      <Text style={[styles.flink, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  heroWrap: { paddingHorizontal: 16, marginTop: 8 },
  heroGradient: {
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    gap: 16,
    minHeight: 360,
  },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  heroTitle: { color: "#fff", fontSize: 38, fontWeight: "800", marginTop: 16, lineHeight: 42, letterSpacing: -1 },
  heroSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 12, lineHeight: 22 },
  heroCtaRow: { flexDirection: "row", gap: 10, marginTop: 22, flexWrap: "wrap" },
  heroStats: {
    flexDirection: "row", marginTop: 28, paddingTop: 18,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)",
  },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginHorizontal: 8 },
  statN: { color: "#fff", fontSize: 22, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  heroImageWrap: { flex: 1, borderRadius: 16, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  section: { marginTop: 36 },
  sectionTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  sectionSub: { fontSize: 14, marginTop: 4 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  catCard: {
    width: "47%", borderRadius: 16, padding: 16, borderWidth: 1, gap: 10,
  },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  catName: { fontSize: 15, fontWeight: "700" },
  courseCard: { width: 240, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  thumb: { aspectRatio: 16 / 9, alignItems: "center", justifyContent: "center" },
  coursePad: { padding: 12, gap: 6 },
  tag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "700" },
  courseTitle: { fontSize: 15, fontWeight: "700", lineHeight: 19 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  price: { fontSize: 16, fontWeight: "800" },
  strike: { fontSize: 13, textDecorationLine: "line-through" },
  teacherCard: {
    marginHorizontal: 16, borderRadius: 20, padding: 16, flexDirection: "row", gap: 14, borderWidth: 1,
  },
  teacherImg: { width: 96, height: 120, borderRadius: 14, backgroundColor: "#cbd5e1" },
  tinyOverline: { fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  teacherName: { fontSize: 20, fontWeight: "800" },
  teacherQual: { fontSize: 12, fontWeight: "600" },
  teacherBio: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  testiCard: { width: 280, padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  stars: { flexDirection: "row", gap: 2 },
  quote: { fontSize: 14, lineHeight: 20, fontStyle: "italic" },
  testiFooter: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  testiName: { fontSize: 13, fontWeight: "700" },
  testiRole: { fontSize: 11 },
  faq: { padding: 14, borderRadius: 14, borderWidth: 1 },
  faqHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  faqQ: { fontSize: 14, fontWeight: "700", flex: 1 },
  faqA: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  contactCard: { marginHorizontal: 16, borderRadius: 24, padding: 24 },
  contactTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  contactSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6, lineHeight: 20 },
  contactGrid: { marginTop: 16, gap: 10 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  contactText: { color: "#fff", fontSize: 13, fontWeight: "600", flex: 1 },
  footer: { padding: 24, borderTopWidth: 1, marginTop: 36, gap: 14, alignItems: "center" },
  footerLinks: { flexDirection: "row", gap: 16, flexWrap: "wrap", justifyContent: "center" },
  flink: { fontSize: 13, fontWeight: "600" },
  copy: { fontSize: 11, marginTop: 6 },
});
