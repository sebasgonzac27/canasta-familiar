import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "@/components/overlays";
import type { IconName } from "@/components/Icon";

type ToastData = {
  id: number;
  text: string;
  avatarName?: string | null;
  avatarColor?: string;
  icon?: IconName;
};

type ToastContextValue = {
  show: (t: Omit<ToastData, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const insets = useSafeAreaInsets();

  const show = useCallback((t: Omit<ToastData, "id">) => {
    const id = ++counter;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
        <View style={styles.column}>
          {toasts.map((t) => (
            <View key={t.id} style={{ marginBottom: 8 }}>
              <Toast avatarName={t.avatarName} avatarColor={t.avatarColor} icon={t.icon} onHide={() => remove(t.id)}>
                {t.text}
              </Toast>
            </View>
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  host: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 100 },
  column: { width: "100%", maxWidth: 480, paddingHorizontal: 20 },
});
