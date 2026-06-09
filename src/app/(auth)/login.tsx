import React, { useState } from "react";
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Field } from "@/components/Field";
import { Button } from "@/components/primitives";
import { BackBtn, ErrorRow, Divider, GoogleButton } from "./register";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors } from "@/theme";

export default function Login() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const { show } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email.includes("@")) return setError("Revisa tu correo, parece incompleto.");
    if (!password) return setError("Ingresa tu contraseña.");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      await signInWithGoogle();
    } catch (e) {
      show({ icon: "bell", text: friendlyError(e) });
    }
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }} keyboardShouldPersistTaps="handled">
          <BackBtn onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/onboarding"))} />
          <Text weight="medium" style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 8 }}>Bienvenido de vuelta</Text>
          <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22, marginBottom: 28 }}>
            Inicia sesión para ver la lista de tu hogar.
          </Text>

          <View style={{ gap: 16 }}>
            <Field
              label="Correo" icon="mail" placeholder="tu@correo.com" value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address" autoComplete="email"
            />
            <Field
              label="Contraseña" icon="lock" placeholder="Tu contraseña" value={password} onChangeText={setPassword}
              secureTextEntry={!showPw} rightLabel={showPw ? "Ocultar" : "Mostrar"} onPressRight={() => setShowPw((v) => !v)}
              onSubmitEditing={onSubmit}
            />
            {error && <ErrorRow text={error} />}
          </View>

          <Pressable onPress={() => router.push("/(auth)/recover")} style={{ alignSelf: "flex-end", marginTop: 12 }}>
            <Text weight="medium" style={{ fontSize: 14, color: colors.green600 }}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <View style={{ marginTop: 24, gap: 14 }}>
            <Button variant="primary" full size="lg" loading={loading} onPress={onSubmit}>Iniciar sesión</Button>
            <Divider />
            <GoogleButton onPress={onGoogle} />
          </View>

          <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.replace("/(auth)/register")} style={{ alignItems: "center", paddingVertical: 20 }}>
            <Text style={{ fontSize: 14, color: colors.gray400 }}>
              ¿No tienes cuenta? <Text weight="medium" style={{ color: colors.green600 }}>Regístrate</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
