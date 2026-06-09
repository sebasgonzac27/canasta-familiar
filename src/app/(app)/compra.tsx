import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/Text";
import { Icon } from "@/components/Icon";
import { Button, AvatarStack, ProgressBar } from "@/components/primitives";
import { ListItem } from "@/components/list";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import { setItemStatus } from "@/lib/items";
import { startShopping, endSession } from "@/lib/shopping";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import type { ItemWithAuthor } from "@/types/db";
import { colors } from "@/theme";

export default function ModoCompra() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeHousehold } = useHouseholds();
  const { show } = useToast();
  const { items, members, session, onlineIds } = useHouseholdData(activeHousehold?.id ?? null, user?.id ?? null);

  // local mirror for instant check/uncheck feedback
  const [local, setLocal] = useState<ItemWithAuthor[]>([]);
  useEffect(() => setLocal(items), [items]);

  const [canceling, setCanceling] = useState(false);

  // ensure a session exists when entering shopping mode
  useEffect(() => {
    if (activeHousehold && user && !session) {
      startShopping(activeHousehold.id, user.id).catch(() => {});
    }
  }, [activeHousehold, user, session]);

  const online = members.filter((m) => onlineIds.includes(m.id)).map((m) => ({ id: m.id, name: m.name, avatar_color: m.avatar_color }));
  const stack = online.length ? online : members.map((m) => ({ id: m.id, name: m.name, avatar_color: m.avatar_color }));

  const pending = local.filter((i) => i.status !== "checked");
  const done = local.filter((i) => i.status === "checked");
  const allDone = local.length > 0 && pending.length === 0;

  async function toggle(it: ItemWithAuthor) {
    const next = it.status === "checked" ? "pending" : "checked";
    setLocal((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: next } : p)));
    try {
      await setItemStatus(it.id, next, user?.id ?? null);
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
      setLocal((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: it.status } : p)));
    }
  }

  // close the shopping session for everyone and go back to the list
  async function cancel() {
    if (canceling) return;
    setCanceling(true);
    try {
      if (session) await endSession(session.id);
      router.back();
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
      setCanceling(false);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.white, alignItems: "center" }}>
      <View style={{ flex: 1, width: "100%", maxWidth: 480 }}>
        {/* header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.gray50 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 10 }} hitSlop={8}>
              <Icon name="chevL" size={22} strokeWidth={2} />
              <Text weight="medium" style={{ fontSize: 18 }}>Comprando</Text>
            </Pressable>
            {stack.length > 0 && <AvatarStack members={stack} size={30} online={online.length > 0} />}
          </View>
          <ProgressBar done={done.length} total={local.length} />
        </View>

        {/* list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 10 }}>
          {pending.map((it) => (
            <ListItem key={it.id} name={it.name} qty={it.qty} addedByName={it.added_by_profile?.name} addedByColor={it.added_by_profile?.avatar_color} big state="pending" onToggle={() => toggle(it)} />
          ))}

          {done.length > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, marginTop: pending.length ? 6 : 0 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.gray50 }} />
              <Text style={{ fontSize: 13, color: colors.gray400 }}>En el carrito · {done.length}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.gray50 }} />
            </View>
          )}
          {done.map((it) => (
            <ListItem key={it.id} name={it.name} qty={it.qty} addedByName={it.added_by_profile?.name} addedByColor={it.added_by_profile?.avatar_color} big state="checked" onToggle={() => toggle(it)} />
          ))}

          {allDone && (
            <Text style={{ textAlign: "center", paddingTop: 8, color: colors.gray400, fontSize: 14 }}>
              ¡Listo! Tachaste todos los productos.
            </Text>
          )}
          {local.length === 0 && (
            <Text style={{ textAlign: "center", paddingTop: 40, color: colors.gray400, fontSize: 15 }}>
              No hay productos en la lista.
            </Text>
          )}
        </ScrollView>

        {/* confirm bar */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: colors.gray50, gap: 8 }}>
          {done.length > 0 ? (
            <>
              <Button
                variant="primary" full size="lg" icon="check"
                onPress={() => router.push(`/(app)/confirmar?session=${session?.id ?? ""}`)}>
                Confirmar compra · {done.length}
              </Button>
              <Button variant="ghost" full size="md" icon="x" loading={canceling} onPress={cancel}>
                Cancelar compra
              </Button>
            </>
          ) : (
            <Button variant="soft" full size="lg" icon="x" loading={canceling} onPress={cancel}>
              Salir del modo compra
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
