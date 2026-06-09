import React, { useState } from "react";
import { View, Pressable, ScrollView, Share, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Icon } from "@/components/Icon";
import { Button, Avatar } from "@/components/primitives";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { leaveHousehold } from "@/lib/households";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors, radii, font } from "@/theme";

export default function Hogar() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeHousehold, refresh, setActiveHousehold, households } = useHouseholds();
  const { members, session, onlineIds } = useHouseholdData(activeHousehold?.id ?? null, user?.id ?? null);
  const { show } = useToast();
  const [leaving, setLeaving] = useState(false);

  const code = activeHousehold?.invite_code ?? "------";

  async function copyCode() {
    await Clipboard.setStringAsync(code);
    show({ icon: "copy", text: "Código copiado al portapapeles" });
  }
  async function shareCode() {
    try {
      await Share.share({
        message: `Únete a "${activeHousehold?.name}" en Canasta con el código ${code}.`,
      });
    } catch {}
  }

  function confirmLeave() {
    const doLeave = async () => {
      if (!activeHousehold || !user) return;
      setLeaving(true);
      try {
        await leaveHousehold(activeHousehold.id, user.id);
        const remaining = households.filter((h) => h.id !== activeHousehold.id);
        if (remaining[0]) setActiveHousehold(remaining[0].id);
        await refresh();
        router.replace("/");
      } catch (e) {
        show({ icon: "bell", text: friendlyError(e) });
        setLeaving(false);
      }
    };
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      if (confirm(`¿Salir de "${activeHousehold?.name}"?`)) doLeave();
    } else {
      Alert.alert("Salir del hogar", `¿Seguro que quieres salir de "${activeHousehold?.name}"?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: doLeave },
      ]);
    }
  }

  function roleFor(id: string): { label: string; highlight?: boolean } | null {
    if (id === user?.id) return { label: "Tú" };
    if (session?.started_by === id) return { label: "Comprando ahora", highlight: true };
    if (onlineIds.includes(id)) return { label: "En línea", highlight: true };
    return null;
  }

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4, paddingBottom: 22 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 14 }} hitSlop={8}>
          <Icon name="chevL" size={22} strokeWidth={2} />
          <Text weight="medium" style={{ fontSize: 18 }}>Hogar</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(app)/perfil")} hitSlop={8}>
          <Avatar name={user?.user_metadata?.name} size={32} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* household card */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <View style={{ width: 56, height: 56, borderRadius: radii.card, backgroundColor: colors.green50, alignItems: "center", justifyContent: "center" }}>
            <Icon name="home" size={28} color={colors.green600} strokeWidth={1.8} />
          </View>
          <View>
            <Text weight="medium" style={{ fontSize: 22, letterSpacing: -0.3 }}>{activeHousehold?.name}</Text>
            <Text style={{ fontSize: 13, color: colors.gray400, marginTop: 2 }}>{members.length} miembro{members.length === 1 ? "" : "s"}</Text>
          </View>
        </View>

        {/* invite code */}
        <Text weight="medium" style={{ fontSize: 13, color: colors.gray400, marginBottom: 10 }}>Código de invitación</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
          <Pressable onPress={copyCode} style={{ flex: 1, height: 52, borderRadius: radii.input, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.gray100, backgroundColor: colors.gray50, alignItems: "center", justifyContent: "center" }}>
            <Text weight="medium" style={{ fontFamily: font.mono as string, fontSize: 22, letterSpacing: 4 }}>{code}</Text>
          </Pressable>
          <Pressable onPress={shareCode} style={{ width: 52, height: 52, borderRadius: radii.input, backgroundColor: colors.green400, alignItems: "center", justifyContent: "center" }}>
            <Icon name="share" size={22} color={colors.white} strokeWidth={2} />
          </Pressable>
        </View>
        <Text style={{ fontSize: 13, color: colors.gray400, marginBottom: 26 }}>Toca el código para copiarlo o compártelo.</Text>

        {/* members */}
        <Text weight="medium" style={{ fontSize: 13, color: colors.gray400, marginBottom: 10 }}>Miembros</Text>
        <View>
          {members.map((m, i) => {
            const role = roleFor(m.id);
            return (
              <View key={m.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: i < members.length - 1 ? 1 : 0, borderBottomColor: colors.gray50 }}>
                <Avatar name={m.name} color={m.avatar_color} size={40} online={onlineIds.includes(m.id)} />
                <View style={{ flex: 1 }}>
                  <Text weight="medium" style={{ fontSize: 16 }}>{m.name || "Miembro"}</Text>
                  {role && <Text style={{ fontSize: 13, color: role.highlight ? colors.green600 : colors.gray400 }}>{role.label}</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ paddingTop: 14, paddingBottom: 8 }}>
        <Button variant="danger" full size="md" icon="leave" loading={leaving} onPress={confirmLeave}>Salir del hogar</Button>
      </View>
    </Screen>
  );
}
