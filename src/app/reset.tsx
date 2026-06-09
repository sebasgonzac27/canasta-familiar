import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Field } from "@/components/Field";
import { Button } from "@/components/primitives";
import { ErrorRow } from "./(auth)/register";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors } from "@/theme";

/**
 * Password-recovery redirect target.
 *
 * `sendPasswordReset` emails a link to this route. Supabase (PKCE +
 * `detectSessionInUrl`) exchanges the `?code=...` for a short-lived recovery
 * session on load; once we have a session we show the new-password form and
 * call `updatePassword`.
 */
export default function Reset() {
  const router = useRouter();
  const { session, updatePassword } = useAuth();
  const { show } = useToast();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>();

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const providerError = params.error_description ?? params.error_code ?? params.error ?? exchangeError;

  // On web the Supabase client exchanges the recovery code automatically
  // (`detectSessionInUrl`). On native that's off, so the deep link
  // (canasta://reset?code=...) lands here with a `code` we exchange by hand.
  useEffect(() => {
    if (Platform.OS === "web" || providerError || session) return;
    const code = params.code;
    if (typeof code !== "string") return;
    let active = true;
    supabase.auth.exchangeCodeForSession(code).then(({ error: exErr }) => {
      if (active && exErr) setExchangeError(friendlyError(exErr));
    });
    return () => {
      active = false;
    };
  }, [params.code, providerError, session]);

  useEffect(() => {
    if (providerError || session) return;
    const t = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(t);
  }, [providerError, session]);

  async function onSubmit() {
    setError(null);
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setLoading(true);
    try {
      await updatePassword(password);
      show({ icon: "check", text: "Tu contraseña fue actualizada." });
      router.replace("/");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  // The link is invalid/expired, or the recovery session never arrived.
  if (providerError || timedOut) {
    return (
      <Screen padded={false}>
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 12 }}>
          <Text weight="medium" style={{ fontSize: 22, letterSpacing: -0.5 }}>
            Enlace no válido
          </Text>
          <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22 }}>
            {providerError
              ? String(providerError)
              : "El enlace expiró o ya fue usado. Solicita uno nuevo."}
          </Text>
          <View style={{ marginTop: 12 }}>
            <Button variant="primary" full size="lg" onPress={() => router.replace("/(auth)/recover")}>
              Pedir un nuevo enlace
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  // Waiting for Supabase to exchange the recovery code.
  if (!session) {
    return (
      <Screen padded={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <ActivityIndicator color={colors.green400} />
          <Text style={{ fontSize: 15, color: colors.gray400 }}>Verificando enlace…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }} keyboardShouldPersistTaps="handled">
        <Text weight="medium" style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 8, marginTop: 24 }}>
          Crea una nueva contraseña
        </Text>
        <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22, marginBottom: 28 }}>
          Elige una contraseña para tu cuenta.
        </Text>
        <View style={{ gap: 16 }}>
          <Field
            label="Nueva contraseña" icon="lock" placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword}
            secureTextEntry={!showPw} rightLabel={showPw ? "Ocultar" : "Mostrar"} onPressRight={() => setShowPw((v) => !v)}
            autoFocus onSubmitEditing={onSubmit}
          />
          {error && <ErrorRow text={error} />}
        </View>
        <View style={{ marginTop: 24 }}>
          <Button variant="primary" full size="lg" loading={loading} onPress={onSubmit}>Guardar contraseña</Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
