import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Icon, IconName } from "@/components/Icon";
import { Button, Avatar } from "@/components/primitives";
import { Field } from "@/components/Field";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors, radii } from "@/theme";

export default function Perfil() {
  const router = useRouter();
  const { profile, signOut, updateProfile, updatePassword } = useAuth();
  const { activeHousehold } = useHouseholds();
  const { show } = useToast();

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [newPw, setNewPw] = useState("");
  const [showPwField, setShowPwField] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      if (name.trim() && name.trim() !== profile?.name) await updateProfile({ name: name.trim() });
      if (newPw) {
        if (newPw.length < 6) throw new Error("password should be at least 6 characters");
        await updatePassword(newPw);
      }
      show({ icon: "check", text: "Perfil actualizado" });
      setNewPw("");
      setShowPwField(false);
      setEdit(false);
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
    } finally {
      setSaving(false);
    }
  }

  const rows: { icon: IconName; label: string; val: string }[] = [
    { icon: "user", label: "Nombre", val: profile?.name || "—" },
    { icon: "mail", label: "Correo", val: profile?.email || "—" },
    { icon: "lock", label: "Contraseña", val: "Cambiar contraseña" },
    { icon: "home", label: "Hogar", val: activeHousehold?.name || "—" },
  ];

  return (
    <Screen edges={["top", "bottom"]} bg={edit ? colors.white : colors.gray50}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4, paddingBottom: 8 }}>
        <Pressable onPress={() => (edit ? setEdit(false) : router.back())} style={{ flexDirection: "row", alignItems: "center", gap: 14 }} hitSlop={8}>
          <Icon name="chevL" size={22} strokeWidth={2} />
          <Text weight="medium" style={{ fontSize: 18 }}>{edit ? "Editar perfil" : "Mi perfil"}</Text>
        </Pressable>
        <Pressable onPress={() => (edit ? save() : setEdit(true))} hitSlop={8} disabled={saving}>
          <Text weight="medium" style={{ fontSize: 15, color: colors.green600 }}>{edit ? "Guardar" : "Editar"}</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* avatar */}
        <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 26 }}>
          <View>
            <Avatar name={profile?.name} color={profile?.avatar_color} size={92} fontSize={38} />
            {edit && (
              <View style={{ position: "absolute", right: -2, bottom: -2, width: 34, height: 34, borderRadius: radii.pill, backgroundColor: colors.green400, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center" }}>
                <Icon name="camera" size={17} color={colors.white} strokeWidth={2} />
              </View>
            )}
          </View>
          {!edit && <Text weight="medium" style={{ fontSize: 22, marginTop: 16 }}>{profile?.name || "Mi perfil"}</Text>}
          {!edit && <Text style={{ fontSize: 14, color: colors.gray400, marginTop: 4 }}>{profile?.email}</Text>}
        </View>

        {edit ? (
          <View style={{ gap: 16 }}>
            <Field label="Nombre" icon="user" value={name} onChangeText={setName} autoCapitalize="words" />
            <Field label="Correo" icon="mail" value={profile?.email ?? ""} editable={false} style={{ color: colors.gray400 }} />
            {showPwField ? (
              <Field label="Nueva contraseña" icon="lock" value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="Mínimo 6 caracteres" autoFocus />
            ) : (
              <Pressable onPress={() => setShowPwField(true)}>
                <Field label="Contraseña" icon="lock" value="••••••••" editable={false} rightLabel="Cambiar" onPressRight={() => setShowPwField(true)} pointerEvents="none" />
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ backgroundColor: colors.white, borderRadius: radii.card, borderWidth: 1, borderColor: colors.gray100, overflow: "hidden" }}>
            {rows.map((row, i) => (
              <Pressable
                key={row.label}
                onPress={() => { setEdit(true); if (row.label === "Contraseña") setShowPwField(true); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: colors.gray50 }}>
                <Icon name={row.icon} size={20} color={colors.gray400} strokeWidth={1.8} />
                <Text style={{ flex: 1, fontSize: 13, color: colors.gray400 }}>{row.label}</Text>
                <Text weight="medium" style={{ fontSize: 15 }}>{row.val}</Text>
                <Icon name="chevR" size={18} color={colors.gray100} strokeWidth={2} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ flex: 1 }} />
      </ScrollView>

      {!edit && (
        <View style={{ paddingTop: 14, paddingBottom: 8 }}>
          <Button variant="danger" full size="md" icon="logout" onPress={signOut}>Cerrar sesión</Button>
        </View>
      )}
    </Screen>
  );
}
