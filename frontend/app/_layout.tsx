import React from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { AppProvider, useApp } from "@/src/context/AppContext";
import { ToastProvider } from "@/src/components/Toast";

SplashScreen.preventAutoHideAsync();

function StackWithTheme() {
  const { isDark } = useApp();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ToastProvider>
          <StackWithTheme />
        </ToastProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
