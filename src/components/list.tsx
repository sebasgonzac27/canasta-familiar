import React from "react";
import { View, Pressable } from "react-native";
import { colors, radii } from "@/theme";
import { Text } from "@/components/Text";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/primitives";

/* ── List item ──────────────────────────────────────────────────────────── */
// states: 'pending' | 'checked' | 'confirmed'
export function ListItem({
  name, qty, addedByName, addedByColor, state = "pending", big = false, onToggle,
}: {
  name: string; qty?: string; addedByName?: string | null; addedByColor?: string;
  state?: "pending" | "checked" | "confirmed"; big?: boolean; onToggle?: () => void;
}) {
  const checked = state === "checked" || state === "confirmed";
  const box = big ? 30 : 26;
  const Container: any = onToggle ? Pressable : View;
  return (
    <Container
      onPress={onToggle}
      style={{
        flexDirection: "row", alignItems: "center", gap: big ? 16 : 13,
        paddingVertical: big ? 16 : 13, paddingHorizontal: big ? 16 : 14,
        backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray100,
        borderRadius: radii.card, opacity: checked ? 0.55 : 1,
      }}>
      <View
        style={{
          width: box, height: box, borderRadius: radii.pill, borderWidth: 2,
          borderColor: checked ? colors.green400 : colors.gray100,
          backgroundColor: checked ? colors.green400 : colors.white,
          alignItems: "center", justifyContent: "center",
        }}>
        {checked && <Icon name="check" size={big ? 18 : 15} color={colors.white} strokeWidth={2.6} />}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text
            weight="medium"
            numberOfLines={1}
            style={{
              fontSize: big ? 19 : 16, flexShrink: 1,
              textDecorationLine: checked ? "line-through" : "none",
            }}>
            {name}
          </Text>
          {!!qty && (
            <Text weight="medium" style={{ fontSize: big ? 15 : 13, color: colors.gray400 }}>{qty}</Text>
          )}
        </View>
        {addedByName && !big && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 }}>
            <Avatar name={addedByName} color={addedByColor} size={16} />
            <Text style={{ fontSize: 12, color: colors.gray400 }}>{addedByName}</Text>
          </View>
        )}
      </View>

      {state === "confirmed" && (
        <View style={{ backgroundColor: colors.green50, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radii.pill }}>
          <Text weight="medium" style={{ fontSize: 12, color: colors.green600 }}>Comprado</Text>
        </View>
      )}
      {big && addedByName && state !== "confirmed" && (
        <Avatar name={addedByName} color={addedByColor} size={26} />
      )}
    </Container>
  );
}

/* ── Category section header ────────────────────────────────────────────── */
export function CatHeader({ label, count }: { label: string; count: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4, paddingHorizontal: 4, marginBottom: 6 }}>
      <Text weight="medium" style={{ fontSize: 13, color: colors.gray400 }}>{label}</Text>
      <View style={{ minWidth: 18, height: 18, borderRadius: radii.pill, backgroundColor: colors.gray50, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" }}>
        <Text weight="medium" style={{ fontSize: 12, color: colors.gray400 }}>{count}</Text>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.gray50 }} />
    </View>
  );
}
