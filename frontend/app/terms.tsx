import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/src/context/AppContext";
import { Header } from "./about";

export default function Terms() {
  const { colors } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="terms-screen">
      <SafeAreaView edges={["top"]}>
        <Header title="Terms & Conditions" />
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 14 }}>
        <Text style={[styles.h1, { color: colors.textPrimary }]}>Terms & Conditions</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>Last updated: Feb 2026</Text>

        <Sec title="1. Acceptance">
          By creating an account on Comman School, you agree to these Terms & Conditions.
        </Sec>
        <Sec title="2. Course access">
          Course access is granted only after successful payment verification by admin. Validity is as specified on each course (monthly/yearly/lifetime).
        </Sec>
        <Sec title="3. Payment & Refund">
          Payments are processed via UPI and manually verified. Refunds are not provided once course access is granted, unless required by law. Contact support for special cases.
        </Sec>
        <Sec title="4. Content usage">
          All videos, notes, and assignments are for personal learning only. Re-distribution, recording, or sharing course content is strictly prohibited.
        </Sec>
        <Sec title="5. Conduct">
          Users must maintain respectful behaviour in discussions and support channels. Misuse may lead to account suspension.
        </Sec>
        <Sec title="6. Limitation of liability">
          Comman School is not liable for any indirect losses arising from use of the platform. Service is provided as-is.
        </Sec>
        <Sec title="7. Updates">
          We may update these terms. Continued use after changes constitutes acceptance.
        </Sec>
        <Sec title="8. Contact">
          For questions, contact Praveenrajeshpurohit@gmail.com or +91 8401094966.
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
