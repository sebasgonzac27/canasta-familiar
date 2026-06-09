import React, { useState } from "react";
import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Field } from "@/components/Field";
import { Button } from "@/components/primitives";
import { Icon } from "@/components/Icon";
import { GoogleG } from "@/components/GoogleG";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors, radii } from "@/theme";

export default function Register() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const { signUp, signInWithGoogle } = useAuth();
  const { show } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!name.trim()) return setError("Dinos cómo te llamas.");
    if (!email.includes("@")) return setError("Revisa tu correo, parece incompleto.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(name, email, password);
      if (needsConfirmation) {
        show({ icon: "mail", text: "Te enviamos un correo para confirmar tu cuenta." });
        router.replace("/(auth)/login");
      } else {
        router.replace(`/(auth)/setup${intent ? `?intent=${intent}` : ""}`);
      }
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
          <BackBtn onPress={() => router.back()} />
          <Text weight="medium" style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 8 }}>Crea tu cuenta</Text>
          <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22, marginBottom: 28 }}>
            Empieza a organizar las compras en casa.
          </Text>

          <View style={{ gap: 16 }}>
            <Field label="Nombre" icon="user" placeholder="¿Cómo te llamas?" value={name} onChangeText={setName} autoCapitalize="words" />
            <Field
              label="Correo" icon="mail" placeholder="tu@correo.com" value={email} onChangeText={setEmail}
              autoCapitalize="none" keyboardType="email-address" autoComplete="email"
              error={error && (error.includes("correo") ? error : null)}
            />
            <Field
              label="Contraseña" icon="lock" placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword}
              secureTextEntry={!showPw} rightLabel={showPw ? "Ocultar" : "Mostrar"} onPressRight={() => setShowPw((v) => !v)}
              hint="Usa al menos 6 caracteres." onSubmitEditing={onSubmit}
            />
            {error && !error.includes("correo") && <ErrorRow text={error} />}
          </View>

          <View style={{ marginTop: 24, gap: 14 }}>
            <Button variant="primary" full size="lg" loading={loading} onPress={onSubmit}>Crear cuenta</Button>
            <Divider />
            <GoogleButton onPress={onGoogle} />
          </View>

          <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.replace("/(auth)/login")} style={{ alignItems: "center", paddingVertical: 20 }}>
            <Text style={{ fontSize: 14, color: colors.gray400 }}>
              ¿Ya tienes cuenta? <Text weight="medium" style={{ color: colors.green600 }}>Inicia sesión</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export function BackBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ width: 40, height: 40, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.gray100, alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
      <Icon name="chevL" size={20} strokeWidth={2} />
    </Pressable>
  );
}

export function ErrorRow({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.red400, alignItems: "center", justifyContent: "center" }}>
        <Text weight="semibold" style={{ color: colors.white, fontSize: 10, lineHeight: 13 }}>!</Text>
      </View>
      <Text style={{ fontSize: 13, color: colors.red400 }}>{text}</Text>
    </View>
  );
}

export function Divider() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.gray100 }} />
      <Text style={{ fontSize: 13, color: colors.gray400 }}>o</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.gray100 }} />
    </View>
  );
}

export function GoogleButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ height: 52, borderRadius: radii.input, borderWidth: 1, borderColor: colors.gray100, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <GoogleG />
      <Text weight="medium" style={{ fontSize: 16 }}>Continuar con Google</Text>
    </Pressable>
  );
}
