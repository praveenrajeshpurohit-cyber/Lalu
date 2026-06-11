// Comman School theme tokens (light + dark)
export type ThemeName = "light" | "dark";

export type ThemeColors = {
  primary: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  accent: string;
  accentFg: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  whatsapp: string;
  card: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  primary: "#0A2540",
  primaryFg: "#FFFFFF",
  secondary: "#E6F0FF",
  secondaryFg: "#0052CC",
  accent: "#FFB800",
  accentFg: "#422800",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  whatsapp: "#25D366",
  card: "#FFFFFF",
  overlay: "rgba(10, 37, 64, 0.55)",
};

export const darkColors: ThemeColors = {
  primary: "#3B82F6",
  primaryFg: "#FFFFFF",
  secondary: "#1E293B",
  secondaryFg: "#93C5FD",
  accent: "#FFC53D",
  accentFg: "#422800",
  background: "#020617",
  surface: "#0F172A",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#1E293B",
  success: "#22C55E",
  danger: "#F87171",
  warning: "#FBBF24",
  whatsapp: "#25D366",
  card: "#0F172A",
  overlay: "rgba(0, 0, 0, 0.7)",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const shadow = {
  card: {
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  pop: {
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
};
