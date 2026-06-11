import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/src/context/AppContext";
import { Header } from "./about";

export default function Privacy() {
  const { colors } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="privacy-screen">
      <SafeAreaView edges={["top"]}>
        <Header title="Privacy Policy" />
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 14 }}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>Privacy Policy</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>Last updated: Feb 2026</Text>

        <Sec title="1. Information we collect">
          We collect personal information you provide during registration (name, email, phone). We also collect course progress, enrollment history, and payment screenshots for verification.
        </Sec>
        <Sec title="2. How we use your information">
          We use the information solely to provide LMS services — course access, support, progress tracking, and payment confirmation. We do not sell your data to third parties.
        </Sec>
        <Sec title="3. Data storage">
          Your data is stored on secure servers. Payment screenshots are used for manual verification only and may be deleted after approval.
        </Sec>
        <Sec title="4. Cookies & analytics">
          We use minimal cookies/local storage to maintain your login session. No third-party analytics trackers are used by default.
        </Sec>
        <Sec title="5. Your rights">
          You may request deletion or export of your account data at any time via WhatsApp or email.
        </Sec>
        <Sec title="6. Contact">
          For privacy concerns, email Praveenrajeshpurohit@gmail.com or message +91 8401094966 on WhatsApp.
        </Sec>
      </ScrollView>
    </View>
  );
}

function Sec({ title, children }: any) {
  const { colors } = useApp();
  return (
    <View style={{ gap: 6, marginTop: 8 }}>
      <Text style={[styles.h2, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.p, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  h2: { fontSize: 15, fontWeight: "800" },
  p: { fontSize: 14, lineHeight: 22 },
  meta: { fontSize: 12 },
});
