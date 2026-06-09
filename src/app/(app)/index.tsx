import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Icon } from "@/components/Icon";
import { Button, AvatarStack, CategoryChip, ProgressBar } from "@/components/primitives";
import { ListItem, CatHeader } from "@/components/list";
import { FAB, Snackbar } from "@/components/overlays";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { useHouseholdData, type RealtimeEvent } from "@/hooks/useHouseholdData";
import { useToast } from "@/lib/toast";
import { groupByCategory, deleteItem } from "@/lib/items";
import { startShopping } from "@/lib/shopping";
import { friendlyError } from "@/lib/errors";
import { colors, radii } from "@/theme";

export default function Lista() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeHousehold, households, setActiveHousehold } = useHouseholds();
  const { show } = useToast();

  const membersRef = useRef<{ id: string; name: string | null }[]>([]);

  const handleEvent = useCallback(
    (e: RealtimeEvent) => {
      const m = membersRef.current.find((x) => x.id === e.byUserId);
      const who = m?.name ?? "Alguien";
      if (e.kind === "item_added") show({ avatarName: who, text: `${who} agregó un producto` });
      if (e.kind === "shopping_started") show({ icon: "cart", text: `${who} inició la compra` });
    },
    [show]
  );

  const { items, members, session, onlineIds, loading } = useHouseholdData(
    activeHousehold?.id ?? null,
    user?.id ?? null,
    handleEvent
  );
  membersRef.current = members;

  const [filter, setFilter] = useState("Todos");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onlineMembers = useMemo(
    () => members.filter((m) => onlineIds.includes(m.id)).map((m) => ({ id: m.id, name: m.name, avatar_color: m.avatar_color })),
    [members, onlineIds]
  );
  const stackMembers = onlineMembers.length ? onlineMembers : members.map((m) => ({ id: m.id, name: m.name, avatar_color: m.avatar_color }));

  const visibleItems = items.filter((i) => i.id !== pendingDelete?.id);
  const filtered = filter === "Todos" ? visibleItems : visibleItems.filter((i) => i.category === filter);
  const grouped = groupByCategory(filtered);
  const presentCats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of visibleItems) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
    return Array.from(counts.entries());
  }, [visibleItems]);

  const done = items.filter((i) => i.status === "checked").length;

  const askDelete = useCallback(
    (id: string, name: string) => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
      setPendingDelete({ id, name });
      deleteTimer.current = setTimeout(async () => {
        try {
          await deleteItem(id);
        } catch (e) {
          show({ icon: "bell", text: friendlyError(e) });
        }
        setPendingDelete(null);
      }, 3000);
    },
    [show]
  );
  const undoDelete = useCallback(() => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    setPendingDelete(null);
  }, []);

  async function goShopping() {
    if (!activeHousehold || !user) return;
    try {
      await startShopping(activeHousehold.id, user.id);
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
    }
    router.push("/(app)/compra");
  }

  function switchHousehold() {
    if (households.length < 2) {
      router.push("/(app)/hogar");
      return;
    }
    const idx = households.findIndex((h) => h.id === activeHousehold?.id);
    const next = households[(idx + 1) % households.length];
    setActiveHousehold(next.id);
  }

  const empty = !loading && items.length === 0;

  return (
    <Screen edges={["top"]}>
      {/* header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6, paddingBottom: 16 }}>
        <Pressable onPress={switchHousehold} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text weight="medium" numberOfLines={1} style={{ fontSize: 24, letterSpacing: -0.5 }}>
              {activeHousehold?.name ?? "Mi hogar"}
            </Text>
            <Icon name="chevD" size={18} color={colors.gray400} strokeWidth={2} />
          </View>
          <Text style={{ fontSize: 13, color: colors.gray400, marginTop: 3 }}>
            {empty ? "Tu lista está vacía" : `${items.length} producto${items.length === 1 ? "" : "s"} pendiente${items.length === 1 ? "" : "s"}`}
          </Text>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {stackMembers.length > 0 && (
            <Pressable onPress={() => router.push("/(app)/hogar")}>
              <AvatarStack members={stackMembers} size={32} online={onlineMembers.length > 0} />
            </Pressable>
          )}
          <Pressable
            onPress={goShopping}
            style={{ width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.green50, alignItems: "center", justifyContent: "center" }}>
            <Icon name="cart" size={20} color={colors.green600} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* active session banner */}
      {session && (
        <Pressable
          onPress={() => router.push("/(app)/compra")}
          style={{ backgroundColor: colors.green50, borderRadius: radii.card, padding: 14, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green400 }} />
            <Text weight="medium" style={{ fontSize: 13, color: colors.green600 }}>
              Modo compra activo{session.starter?.name ? ` · ${session.starter.name} está comprando` : ""}
            </Text>
          </View>
          <ProgressBar done={done} total={items.length} />
        </Pressable>
      )}

      {empty ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
          <View style={{ width: 88, height: 88, borderRadius: radii.pill, backgroundColor: colors.gray50, alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
            <Icon name="cart" size={40} color={colors.gray400} strokeWidth={1.6} />
          </View>
          <Text weight="medium" style={{ fontSize: 20, marginBottom: 8 }}>Todo en orden en casa</Text>
          <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22, textAlign: "center", maxWidth: 260 }}>
            Agrega lo que falta y todos en {activeHousehold?.name ?? "tu hogar"} lo verán al instante.
          </Text>
          <View style={{ marginTop: 24 }}>
            <Button variant="soft" size="md" icon="plus" onPress={() => router.push("/(app)/agregar")}>
              Agregar primer producto
            </Button>
          </View>
        </View>
      ) : (
        <>
          {/* category filter */}
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 18, paddingRight: 20 }}
            style={{ marginHorizontal: -20, paddingLeft: 20, flexGrow: 0 }}>
            <CategoryChip label="Todos" count={visibleItems.length} active={filter === "Todos"} onPress={() => setFilter("Todos")} />
            {presentCats.map(([cat, count]) => (
              <CategoryChip key={cat} label={cat} count={count} active={filter === cat} onPress={() => setFilter(cat)} />
            ))}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110, gap: 22 }}>
            {grouped.map(([cat, arr]) => (
              <View key={cat}>
                <CatHeader label={cat} count={arr.length} />
                <View style={{ gap: 8 }}>
                  {arr.map((it) => (
                    <Pressable key={it.id} onLongPress={() => askDelete(it.id, it.name)} delayLongPress={350}>
                      <ListItem
                        name={it.name}
                        qty={it.qty}
                        addedByName={it.added_by_profile?.name}
                        addedByColor={it.added_by_profile?.avatar_color}
                        state={it.status === "checked" ? "checked" : "pending"}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {!empty && <FAB icon="plus" onPress={() => router.push("/(app)/agregar")} />}

      {pendingDelete && (
        <View style={{ position: "absolute", left: 20, right: 20, bottom: 28 }}>
          <Snackbar action="Deshacer" onAction={undoDelete}>Eliminaste “{pendingDelete.name}”</Snackbar>
        </View>
      )}
    </Screen>
  );
}
