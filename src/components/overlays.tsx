import React, { useEffect, useRef } from "react";
import { View, Pressable, Animated, Modal as RNModal, StyleSheet, ViewStyle } from "react-native";
import { colors, radii, shadow } from "@/theme";
import { Text } from "@/components/Text";
import { Icon, IconName } from "@/components/Icon";
import { Avatar } from "@/components/primitives";

/* ── FAB ────────────────────────────────────────────────────────────────── */
export function FAB({ icon = "plus", label, onPress }: { icon?: IconName; label?: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: "absolute", right: 20, bottom: 28, height: 56, minWidth: 56,
          paddingHorizontal: label ? 22 : 0, borderRadius: radii.pill,
          backgroundColor: pressed ? colors.green600 : colors.green400,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 20,
        },
        shadow(12, "rgba(59,109,17,0.4)"),
      ]}>
      <Icon name={icon} size={26} color={colors.white} strokeWidth={2.2} />
      {label && <Text weight="medium" style={{ color: colors.white, fontSize: 16 }}>{label}</Text>}
    </Pressable>
  );
}

/* ── Toast (top notification) ───────────────────────────────────────────── */
export function Toast({
  avatarName, avatarColor, icon, children, onHide,
}: { avatarName?: string | null; avatarColor?: string; icon?: IconName; children: React.ReactNode; onHide?: () => void }) {
  const y = useRef(new Animated.Value(-80)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const t = setTimeout(() => {
      Animated.timing(y, { toValue: -100, duration: 220, useNativeDriver: true }).start(() => onHide?.());
    }, 2600);
    return () => clearTimeout(t);
  }, [y, onHide]);
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <View style={[styles.toast, shadow(14)]}>
        {avatarName ? (
          <Avatar name={avatarName} color={avatarColor} size={30} online />
        ) : (
          <View style={{ width: 30, height: 30, borderRadius: radii.pill, backgroundColor: colors.green50, alignItems: "center", justifyContent: "center" }}>
            <Icon name={icon || "bell"} size={17} color={colors.green600} strokeWidth={2} />
          </View>
        )}
        <Text style={{ fontSize: 14, flex: 1, lineHeight: 18 }}>{children}</Text>
      </View>
    </Animated.View>
  );
}

/* ── Snackbar (undo) ────────────────────────────────────────────────────── */
export function Snackbar({ children, action = "Deshacer", onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <View style={[styles.snackbar, shadow(14, "rgba(44,44,42,0.28)")]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, flex: 1 }}>
        <Icon name="undo" size={17} color="rgba(255,255,255,0.7)" strokeWidth={2} />
        <Text style={{ fontSize: 14, color: colors.white }}>{children}</Text>
      </View>
      <Pressable onPress={onAction} hitSlop={8} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text weight="medium" style={{ fontSize: 14, color: "#A8D26A" }}>{action}</Text>
      </Pressable>
    </View>
  );
}

/* ── Quantity stepper ───────────────────────────────────────────────────── */
export function Stepper({ value, onChange, unit = "" }: { value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 50, borderRadius: radii.input, borderWidth: 1, borderColor: colors.gray100, overflow: "hidden", alignSelf: "flex-start" }}>
      <Pressable onPress={() => onChange(Math.max(1, value - 1))} style={{ width: 46, height: "100%", alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.gray100 }}>
        <Icon name="minus" size={18} color={colors.gray400} strokeWidth={2.2} />
      </Pressable>
      <View style={{ minWidth: 56, alignItems: "center" }}>
        <Text weight="medium" style={{ fontSize: 16 }}>{value}{unit ? ` ${unit}` : ""}</Text>
      </View>
      <Pressable onPress={() => onChange(value + 1)} style={{ width: 46, height: "100%", alignItems: "center", justifyContent: "center", borderLeftWidth: 1, borderLeftColor: colors.gray100 }}>
        <Icon name="plus" size={18} color={colors.green600} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

/* ── Centered modal card ────────────────────────────────────────────────── */
export function ModalCard({ visible, onClose, children }: { visible: boolean; onClose?: () => void; children: React.ReactNode }) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={[styles.modalCard, shadow(24, "rgba(44,44,42,0.3)")]} onPress={(e) => e.stopPropagation?.()}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11, paddingHorizontal: 14,
    backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.gray100,
  },
  snackbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
    paddingVertical: 13, paddingLeft: 16, paddingRight: 12, backgroundColor: colors.gray900, borderRadius: radii.card,
  },
  scrim: { flex: 1, backgroundColor: "rgba(44,44,42,0.45)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: colors.white, borderRadius: 20, width: "100%", maxWidth: 440, padding: 24 },
});
