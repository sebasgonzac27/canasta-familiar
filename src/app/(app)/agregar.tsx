import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Animated, ScrollView, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/Text";
import { Field } from "@/components/Field";
import { Button, CategoryChip } from "@/components/primitives";
import { Icon } from "@/components/Icon";
import { Stepper } from "@/components/overlays";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { addItem, fetchFrequentNames } from "@/lib/items";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors, radii, CATEGORIES, FREQUENTS } from "@/theme";

export default function Agregar() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeHousehold } = useHouseholds();
  const { show } = useToast();
  const inputRef = useRef<TextInput>(null);

  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [useQty, setUseQty] = useState(false);
  const [category, setCategory] = useState("Otros");
  const [frequents, setFrequents] = useState<string[]>(FREQUENTS);
  const [saving, setSaving] = useState(false);

  const y = useRef(new Animated.Value(600)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }).start();
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    if (activeHousehold) fetchFrequentNames(activeHousehold.id).then((n) => n.length && setFrequents(n)).catch(() => {});
    return () => clearTimeout(t);
  }, [y, activeHousehold]);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return [];
    const pool = Array.from(new Set([...frequents, ...FREQUENTS]));
    return pool.filter((s) => s.toLowerCase().startsWith(q) && s.toLowerCase() !== q).slice(0, 4);
  }, [name, frequents]);

  function close() {
    Animated.timing(y, { toValue: 600, duration: 200, useNativeDriver: true }).start(() => router.back());
  }

  async function save(itemName?: string) {
    const finalName = (itemName ?? name).trim();
    if (!finalName || !activeHousehold || !user) return;
    setSaving(true);
    try {
      await addItem({
        householdId: activeHousehold.id,
        userId: user.id,
        name: finalName,
        qty: useQty ? String(qty) : "",
        category,
      });
      show({ icon: "check", text: `Agregaste “${finalName}”` });
      close();
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(44,44,42,0.4)" }}>
      <Pressable style={{ flex: 1 }} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View
          style={{
            transform: [{ translateY: y }], backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
            paddingHorizontal: 20, paddingTop: 10, maxHeight: "92%", alignSelf: "center", width: "100%", maxWidth: 480,
          }}>
          <View style={{ alignItems: "center", paddingTop: 4, paddingBottom: 12 }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.gray100 }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <Text weight="medium" style={{ fontSize: 22, letterSpacing: -0.3 }}>Agregar producto</Text>
            <Pressable onPress={close} style={{ width: 32, height: 32, borderRadius: radii.pill, backgroundColor: colors.gray50, alignItems: "center", justifyContent: "center" }}>
              <Icon name="x" size={18} color={colors.gray400} strokeWidth={2.2} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Field ref={inputRef} label="Producto" icon="search" placeholder="¿Qué falta en casa?" value={name} onChangeText={setName} onSubmitEditing={() => save()} returnKeyType="done" />

            {suggestions.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <Text weight="medium" style={{ fontSize: 13, color: colors.gray400, marginBottom: 10 }}>Sugerencias</Text>
                {suggestions.map((s, i) => (
                  <Pressable key={s} onPress={() => save(s)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 8, borderRadius: radii.input, backgroundColor: i === 0 ? colors.green50 : "transparent" }}>
                    <Icon name="plus" size={20} color={i === 0 ? colors.green600 : colors.gray400} strokeWidth={2} />
                    <Text style={{ fontSize: 16 }}>
                      <Text weight="medium">{name.trim()}</Text>
                      <Text style={{ color: colors.gray400 }}>{s.slice(name.trim().length)}</Text>
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <>
                <View style={{ flexDirection: "row", gap: 12, marginTop: 18, marginBottom: 18 }}>
                  <View>
                    <Text weight="medium" style={{ fontSize: 13, marginBottom: 7 }}>Cantidad</Text>
                    <Stepper value={qty} onChange={(v) => { setQty(v); setUseQty(true); }} />
                  </View>
                </View>

                <Text weight="medium" style={{ fontSize: 13, color: colors.gray400, marginBottom: 10 }}>Categoría</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }} style={{ marginBottom: 18 }}>
                  {CATEGORIES.map((c) => (
                    <CategoryChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
                  ))}
                </ScrollView>

                <Text weight="medium" style={{ fontSize: 13, color: colors.gray400, marginBottom: 10 }}>Frecuentes</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {frequents.map((f) => (
                    <Pressable key={f} onPress={() => setName(f)} style={{ height: 36, paddingHorizontal: 14, borderRadius: radii.input, borderWidth: 1, borderColor: colors.gray100, flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Icon name="plus" size={15} color={colors.gray400} strokeWidth={2.2} />
                      <Text style={{ fontSize: 14 }}>{f}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <View style={{ paddingTop: 16, paddingBottom: Platform.OS === "ios" ? 28 : 18 }}>
              <Button variant="primary" full size="lg" disabled={!name.trim()} loading={saving} onPress={() => save()}>
                {name.trim() ? `Agregar “${name.trim()}”` : "Agregar a la lista"}
              </Button>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
