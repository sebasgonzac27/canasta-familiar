/* Canasta design tokens — mirrors the design brief (light theme only). */
import { Platform, ViewStyle } from "react-native";

export const colors = {
  green400: "#639922", // primary / action
  green600: "#3B6D11", // primary hover / confirmed
  green50: "#EAF3DE", // soft fill
  white: "#FFFFFF", // general background
  gray50: "#F1EFE8", // secondary surface
  gray100: "#D3D1C7", // default border
  gray900: "#2C2C2A", // primary text
  gray400: "#888780", // secondary text
  red400: "#E24B4A", // error
  amber400: "#BA7517", // alert
};

export const radii = { input: 8, card: 12, pill: 999 };

export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "ui-monospace, Menlo, monospace" }),
};

export const type = {
  title: 24,
  body: 16,
  label: 13,
};

/** Member identity colors (hex equivalents of the brief's oklch palette).
 *  Assigned to a profile at signup; falls back to the brand green. */
export const MEMBER_COLORS = ["#B5562F", "#3E7CA6", "#8A5BA6", "#3E9C7A", "#B98A2E"];

/** Fixed category set used for grouping + the filter chips. */
export const CATEGORIES = ["Frutas y verduras", "Lácteos", "Despensa", "Aseo", "Bebidas", "Otros"];

/** Quick suggestions shown in the add sheet. */
export const FREQUENTS = ["Leche", "Pan", "Huevos", "Café", "Tomates", "Pollo", "Arroz", "Bananas"];

/** Cross-platform shadow helper (box-shadow → native shadow + elevation). */
export function shadow(elevation: number, color = "rgba(44,44,42,0.18)"): ViewStyle {
  if (Platform.OS === "android") return { elevation } as ViewStyle;
  return {
    shadowColor: color.startsWith("rgba") ? color : color,
    shadowOffset: { width: 0, height: Math.round(elevation * 0.6) },
    shadowOpacity: 1,
    shadowRadius: elevation,
  };
}

export function initialFor(name?: string | null) {
  return (name || "?").trim().charAt(0).toUpperCase() || "?";
}
