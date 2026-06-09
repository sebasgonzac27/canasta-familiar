import React, { useState, forwardRef } from "react";
import { View, TextInput, TextInputProps, Pressable } from "react-native";
import { colors, radii, font } from "@/theme";
import { Text } from "@/components/Text";
import { Icon, IconName } from "@/components/Icon";

type Props = TextInputProps & {
  label?: string;
  icon?: IconName;
  error?: string | null;
  hint?: string;
  rightSlot?: React.ReactNode;
  onPressRight?: () => void;
  rightLabel?: string;
};

export const Field = forwardRef<TextInput, Props>(function Field(
  { label, icon, error, hint, rightSlot, rightLabel, onPressRight, style, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const border = error ? colors.red400 : focused ? colors.green400 : colors.gray100;
  return (
    <View style={{ width: "100%" }}>
      {label && (
        <Text weight="medium" style={{ fontSize: 13, marginBottom: 7 }}>{label}</Text>
      )}
      <View
        style={[
          {
            flexDirection: "row", alignItems: "center", height: 50, borderRadius: radii.input,
            backgroundColor: colors.white, borderWidth: 1, borderColor: border, paddingHorizontal: 14,
          },
          focused && { borderColor: colors.green400, backgroundColor: "#FBFCF8" },
        ]}>
        {icon && <Icon name={icon} size={19} color={colors.gray400} strokeWidth={1.8} />}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.gray400}
          selectionColor={colors.green400}
          style={[
            { flex: 1, fontSize: 16, color: colors.gray900, fontFamily: font.regular, marginLeft: icon ? 10 : 0, paddingVertical: 0 },
            // RN web focus outline removal
            { outlineStyle: "none" } as any,
            style,
          ]}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...rest}
        />
        {rightLabel != null && (
          <Pressable onPress={onPressRight} hitSlop={8}>
            <Text weight="medium" style={{ fontSize: 13, color: colors.green600 }}>{rightLabel}</Text>
          </Pressable>
        )}
        {rightSlot}
      </View>
      {error ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.red400, alignItems: "center", justifyContent: "center" }}>
            <Text weight="semibold" style={{ color: colors.white, fontSize: 10, lineHeight: 13 }}>!</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.red400 }}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={{ fontSize: 13, color: colors.gray400, marginTop: 7 }}>{hint}</Text>
      ) : null}
    </View>
  );
});
