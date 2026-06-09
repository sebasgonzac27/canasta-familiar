import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Field } from "@/components/Field";
import { Button, Logo } from "@/components/primitives";
import { ErrorRow } from "./register";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { createHousehold, joinHousehold } from "@/lib/households";
import { friendlyError } from "@/lib/errors";
import { colors, radii } from "@/theme";

export default function Setup() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const { signOut, profile } = useAuth();
  const { refresh, setActiveHousehold } = useHouseholds();

  const [mode, setMode] = useState<"create" | "join">(intent === "join" ? "join" : "create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const h = mode === "create"
        ? await createHousehold(name.trim() || "Mi hogar")
        : await joinHousehold(code.trim());
      await refresh();
      setActiveHousehold(h.id);
      router.replace("/(app)");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16 }} keyboardShouldPersistTaps="handled">
        <Logo size={44} />
        <Text weight="medium" style={{ fontSize: 26, letterSpacing: -0.5, marginTop: 28, marginBottom: 8 }}>
          {profile?.name ? `Hola, ${profile.name.split(" ")[0]}` : "Casi listo"}
        </Text>
        <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22, marginBottom: 24 }}>
          Crea el hogar de tu casa o únete a uno con su código de invitación.
        </Text>

        {/* segmented toggle */}
        <View style={{ flexDirection: "row", backgroundColor: colors.gray50, borderRadius: radii.input, padding: 4, marginBottom: 24 }}>
          {(["create", "join"] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m} onPress={() => { setMode(m); setError(null); }}
                style={{ flex: 1, height: 40, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: active ? colors.white : "transparent" }}>
                <Text weight="medium" style={{ fontSize: 14, color: active ? colors.gray900 : colors.gray400 }}>
                  {m === "create" ? "Crear hogar" : "Unirme con código"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === "create" ? (
          <Field label="Nombre del hogar" icon="home" placeholder="Casa Roble" value={name} onChangeText={setName} autoFocus onSubmitEditing={onSubmit} />
        ) : (
          <Field
            label="Código de invitación" icon="tag" placeholder="R7B2K9" value={code}
            onChangeText={(t) => setCode(t.toUpperCase())} autoCapitalize="characters" autoCorrect={false}
            maxLength={6} autoFocus onSubmitEditing={onSubmit}
            style={{ letterSpacing: 3, fontSize: 18 }}
          />
        )}
        {error && <View style={{ marginTop: 14 }}><ErrorRow text={error} /></View>}

        <View style={{ marginTop: 24 }}>
          <Button variant="primary" full size="lg" loading={loading} onPress={onSubmit}>
            {mode === "create" ? "Crear hogar" : "Unirme al hogar"}
          </Button>
        </View>

        <View style={{ flex: 1 }} />
        <Pressable onPress={signOut} style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text style={{ fontSize: 14, color: colors.gray400 }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
