import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useApp } from "@/src/context/AppContext";

type ToastVariant = "success" | "error" | "info";
type ToastItem = { id: string; message: string; variant: ToastVariant };

type ToastCtx = {
  show: (message: string, variant?: ToastVariant) => void;
};
const Ctx = createContext<ToastCtx | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const fade = useRef(new Animated.Value(0)).current;

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setItems((p) => [...p, { id, message, variant }]);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
          setItems((p) => p.filter((i) => i.id !== id));
        });
      }, 2800);
    },
    [fade],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <ToastStack items={items} fade={fade} />
    </Ctx.Provider>
  );
}

function ToastStack({ items, fade }: { items: ToastItem[]; fade: Animated.Value }) {
  const { colors } = useApp();
  if (items.length === 0) return null;
  return (
    <View pointerEvents="none" style={[styles.stack, { pointerEvents: "none" }]} testID="toast-stack">
      {items.map((i) => {
        const bg =
          i.variant === "success" ? colors.success : i.variant === "error" ? colors.danger : colors.primary;
        return (
          <Animated.View
            key={i.id}
            style={[styles.toast, { backgroundColor: bg, opacity: fade }]}
            testID={`toast-${i.variant}`}
          >
            <Text style={styles.text}>{i.message}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast within ToastProvider");
  return v;
}

const styles = StyleSheet.create({
  stack: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
