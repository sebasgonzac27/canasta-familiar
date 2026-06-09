import React, { useEffect, useRef } from "react";
import {
  View, Pressable, Animated, StyleSheet, ViewStyle, StyleProp, ActivityIndicator,
} from "react-native";
import { colors, radii, shadow, initialFor } from "@/theme";
import { Text } from "@/components/Text";
import { Icon, IconName } from "@/components/Icon";

/* ── Avatar ─────────────────────────────────────────────────────────────── */
export function Avatar({
  name, color = colors.green400, size = 32, online = false, ring = colors.white, fontSize,
}: {
  name?: string | null; color?: string; size?: number; online?: boolean; ring?: string; fontSize?: number;
}) {
  const dot = Math.max(9, Math.round(size * 0.31));
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: size, height: size, borderRadius: radii.pill, backgroundColor: color,
          alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: ring,
        }}>
        <Text weight="medium" style={{ color: colors.white, fontSize: fontSize ?? Math.round(size * 0.42) }}>
          {initialFor(name)}
        </Text>
      </View>
      {online && (
        <View
          style={{
            position: "absolute", right: -1, bottom: -1, width: dot, height: dot, borderRadius: radii.pill,
            backgroundColor: colors.green400, borderWidth: 2, borderColor: ring,
          }}
        />
      )}
    </View>
  );
}

export type MiniMember = { id?: string; name?: string | null; avatar_color?: string };

export function AvatarStack({
  members, size = 30, online = false, max = 4,
}: { members: MiniMember[]; size?: number; online?: boolean; max?: number }) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {shown.map((m, i) => (
        <View key={m.id ?? i} style={{ marginLeft: i === 0 ? 0 : -9, zIndex: shown.length - i }}>
          <Avatar name={m.name} color={m.avatar_color} size={size} online={online} />
        </View>
      ))}
      {extra > 0 && (
        <View
          style={{
            marginLeft: -9, width: size, height: size, borderRadius: radii.pill, backgroundColor: colors.gray50,
            alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.white,
          }}>
          <Text weight="medium" style={{ color: colors.gray400, fontSize: 12 }}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

/* ── Category chip (filter) ─────────────────────────────────────────────── */
export function CategoryChip({
  label, active = false, count, onPress,
}: { label: string; active?: boolean; count?: number; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 36, paddingHorizontal: 14, borderRadius: radii.input, borderWidth: 1,
        borderColor: active ? colors.green400 : colors.gray100,
        backgroundColor: active ? colors.green50 : colors.white,
        flexDirection: "row", alignItems: "center", gap: 6,
      }}>
      <Text weight="medium" style={{ fontSize: 13, color: active ? colors.green600 : colors.gray900 }}>{label}</Text>
      {count != null && (
        <Text weight="medium" style={{ fontSize: 12, color: active ? colors.green600 : colors.gray400 }}>{count}</Text>
      )}
    </Pressable>
  );
}

/* ── Progress bar (animated fill) ───────────────────────────────────────── */
export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const w = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: pct, duration: 350, useNativeDriver: false }).start();
  }, [pct, w]);
  const widthInterp = w.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="medium" style={{ fontSize: 13 }}>{done} de {total} comprados</Text>
        <Text weight="medium" style={{ fontSize: 13, color: colors.green600 }}>{pct}%</Text>
      </View>
      <View style={{ height: 8, borderRadius: radii.pill, backgroundColor: colors.gray50, overflow: "hidden" }}>
        <Animated.View style={{ height: "100%", width: widthInterp, borderRadius: radii.pill, backgroundColor: colors.green400 }} />
      </View>
    </View>
  );
}

/* ── Button ─────────────────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "danger";
export function Button({
  children, variant = "primary", size = "lg", full = false, disabled = false, loading = false,
  icon, onPress, style,
}: {
  children: React.ReactNode; variant?: ButtonVariant; size?: "lg" | "md" | "sm"; full?: boolean;
  disabled?: boolean; loading?: boolean; icon?: IconName; onPress?: () => void; style?: StyleProp<ViewStyle>;
}) {
  const h = size === "lg" ? 52 : size === "md" ? 44 : 36;
  const isDisabled = disabled || loading;

  const palette = (pressed: boolean): { bg: string; fg: string; border: string; sh?: ViewStyle } => {
    switch (variant) {
      case "primary":
        return {
          bg: isDisabled ? colors.gray100 : pressed ? colors.green600 : colors.green400,
          fg: isDisabled ? colors.gray400 : colors.white, border: "transparent",
          sh: isDisabled ? undefined : shadow(2, "rgba(59,109,17,0.35)"),
        };
      case "secondary":
        return { bg: pressed ? colors.gray50 : colors.white, fg: colors.gray900, border: colors.gray100 };
      case "soft":
        return { bg: pressed ? "#E0EECF" : colors.green50, fg: colors.green600, border: "transparent" };
      case "ghost":
        return { bg: pressed ? colors.gray50 : "transparent", fg: colors.gray900, border: "transparent" };
      case "danger":
        return { bg: "transparent", fg: colors.red400, border: pressed ? colors.red400 : colors.gray100 };
    }
  };

  return (
    <Pressable onPress={isDisabled ? undefined : onPress} disabled={isDisabled} style={({ pressed }) => {
      const p = palette(pressed);
      return [
        {
          height: h, paddingHorizontal: size === "sm" ? 14 : 20, borderRadius: radii.input, borderWidth: 1,
          borderColor: p.border, backgroundColor: p.bg, flexDirection: "row", alignItems: "center",
          justifyContent: "center", gap: 8, width: full ? "100%" : undefined, opacity: isDisabled && variant !== "primary" ? 0.6 : 1,
        },
        p.sh,
        style,
      ];
    }}>
      {({ pressed }) => {
        const p = palette(pressed);
        return loading ? (
          <ActivityIndicator color={p.fg} />
        ) : (
          <>
            {icon && <Icon name={icon} size={size === "sm" ? 18 : 20} color={p.fg} strokeWidth={2} />}
            <Text weight="medium" style={{ color: p.fg, fontSize: size === "sm" ? 14 : 16 }}>{children}</Text>
          </>
        );
      }}
    </Pressable>
  );
}

/* ── Brand mark ─────────────────────────────────────────────────────────── */
export function Logo({ size = 56, label = true }: { size?: number; label?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={[
          {
            width: size, height: size, borderRadius: size * 0.32, backgroundColor: colors.green400,
            alignItems: "center", justifyContent: "center",
          },
          shadow(6, "rgba(99,153,34,0.3)"),
        ]}>
        <Icon name="cart" size={size * 0.52} color={colors.white} strokeWidth={1.8} />
      </View>
      {label && <Text weight="medium" style={{ fontSize: size * 0.46, letterSpacing: -0.6 }}>Canasta</Text>}
    </View>
  );
}
