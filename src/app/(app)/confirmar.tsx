import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/Text";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/primitives";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { confirmShopping } from "@/lib/shopping";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors, radii, shadow } from "@/theme";

export default function Confirmar() {
  const router = useRouter();
  const { session: sessionParam } = useLocalSearchParams<{ session?: string }>();
  const { user } = useAuth();
  const { activeHousehold } = useHouseholds();
  const { items, session } = useHouseholdData(activeHousehold?.id ?? null, user?.id ?? null);
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  const bought = items.filter((i) => i.status === "checked");
  const remaining = items.filter((i) => i.status !== "checked");
  const sessionId = sessionParam || session?.id || "";

  async function confirm() {
    if (!sessionId) {
      show({ icon: "bell", text: "No hay una compra activa." });
      return;
    }
    setSaving(true);
    try {
      await confirmShopping(sessionId);
      show({ icon: "check", text: `Compra confirmada · ${bought.length} producto${bought.length === 1 ? "" : "s"}` });
      router.dismissAll?.();
      router.replace("/(app)");
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(44,44,42,0.45)", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={() => router.back()} />
      <View style={[{ backgroundColor: colors.white, borderRadius: 20, width: "100%", maxWidth: 440, padding: 24 }, shadow(24, "rgba(44,44,42,0.3)")]}>
        <View style={{ alignItems: "center", marginBottom: 18 }}>
          <View style={{ width: 56, height: 56, borderRadius: radii.pill, backgroundColor: colors.green50, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Icon name="cart" size={28} color={colors.green600} strokeWidth={1.8} />
          </View>
          <Text weight="medium" style={{ fontSize: 22, letterSpacing: -0.3, marginBottom: 4 }}>Confirmar compra</Text>
          <Text style={{ fontSize: 14, color: colors.gray400 }}>Revisa antes de cerrar la compra.</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
          <View style={{ flex: 1, backgroundColor: colors.green50, borderRadius: radii.input, padding: 14 }}>
            <Text weight="medium" style={{ fontSize: 24, color: colors.green600 }}>{bought.length}</Text>
            <Text style={{ fontSize: 13, color: colors.green600 }}>Comprados</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.gray50, borderRadius: radii.input, padding: 14 }}>
            <Text weight="medium" style={{ fontSize: 24 }}>{remaining.length}</Text>
            <Text style={{ fontSize: 13, color: colors.gray400 }}>Pendientes</Text>
          </View>
        </View>

        {remaining.length > 0 && (
          <View style={{ backgroundColor: colors.gray50, borderRadius: radii.input, paddingHorizontal: 14, marginBottom: 20, maxHeight: 180 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {remaining.map((it, i) => (
                <View key={it.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderBottomWidth: i < remaining.length - 1 ? 1 : 0, borderBottomColor: colors.gray100 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.amber400 }} />
                  <Text style={{ fontSize: 15, flex: 1 }}>{it.name}</Text>
                  <Text style={{ fontSize: 13, color: colors.gray400 }}>queda para la próxima</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Button variant="primary" full size="lg" loading={saving} onPress={confirm}>Confirmar y limpiar lista</Button>
          <Button variant="ghost" full size="md" onPress={() => router.back()}>Seguir comprando</Button>
        </View>
      </View>
    </View>
  );
}
