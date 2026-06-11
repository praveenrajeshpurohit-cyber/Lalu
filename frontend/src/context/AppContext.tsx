import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import { storage } from "@/src/utils/storage";
import { api, clearToken, saveToken } from "@/src/lib/api";
import { darkColors, lightColors, type ThemeColors, type ThemeName } from "@/src/lib/theme";
import type { User } from "@/src/lib/types";

type AppCtx = {
  user: User | null;
  bootstrapped: boolean;
  themeName: ThemeName;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AppCtx | undefined>(undefined);

const THEME_KEY = "cs_theme";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>(systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(THEME_KEY, "");
      if (saved === "dark" || saved === "light") {
        setThemeName(saved);
      }
      try {
        const me = await api.get<User>("/auth/me");
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeName(t);
    storage.setItem(THEME_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(themeName === "dark" ? "light" : "dark");
  }, [themeName, setTheme]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: User }>(
      "/auth/login",
      { email, password },
      false,
    );
    await saveToken(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, phone?: string) => {
    const res = await api.post<{ access_token: string; user: User }>(
      "/auth/register",
      { email, password, name, phone },
      false,
    );
    await saveToken(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const isDark = themeName === "dark";
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo<AppCtx>(
    () => ({ user, bootstrapped, themeName, colors, isDark, setTheme, toggleTheme, login, register, logout, refresh }),
    [user, bootstrapped, themeName, colors, isDark, setTheme, toggleTheme, login, register, logout, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
