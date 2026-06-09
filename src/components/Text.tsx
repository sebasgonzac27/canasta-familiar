import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { colors, font } from "@/theme";

type Weight = "regular" | "medium" | "semibold";

export function Text({
  weight = "regular",
  style,
  ...props
}: TextProps & { weight?: Weight }) {
  const family = weight === "semibold" ? font.semibold : weight === "medium" ? font.medium : font.regular;
  return <RNText {...props} style={[styles.base, { fontFamily: family }, style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.gray900, fontSize: 16 },
});
