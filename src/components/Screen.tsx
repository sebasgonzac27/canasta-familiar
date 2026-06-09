import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors } from "@/theme";

/** Page shell: full-bleed background + centered column capped at 480px
 *  (mobile-first, per the brief). Children render inside the column. */
export function Screen({
  children, bg = colors.white, edges = ["top", "bottom"], padded = true, style,
}: {
  children: React.ReactNode; bg?: string; edges?: Edge[]; padded?: boolean; style?: ViewStyle;
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: bg }]}>
      <View style={[styles.column, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center" },
  column: { flex: 1, width: "100%", maxWidth: 480 },
  padded: { paddingHorizontal: 20 },
});
