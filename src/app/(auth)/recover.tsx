import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Field } from "@/components/Field";
import { Button } from "@/components/primitives";
import { BackBtn, ErrorRow } from "./register";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { friendlyError } from "@/lib/errors";
import { colors } from "@/theme";

export default function Recover() {
  const router = useRouter();
  const { sendPasswordReset } = useAuth();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email.includes("@")) return setError("Revisa tu correo, parece incompleto.");
    setLoading(true);
    try {
      await sendPasswordReset(email);
      show({ icon: "mail", text: "Te enviamos un enlace para crear una nueva contraseña." });
      router.replace("/(auth)/login");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }} keyboardShouldPersistTaps="handled">
        <BackBtn onPress={() => router.back()} />
        <Text weight="medium" style={{ fontSize: 26, letterSpacing: -0.5, marginBottom: 8 }}>Recuperar contraseña</Text>
        <Text style={{ fontSize: 15, color: colors.gray400, lineHeight: 22, marginBottom: 28 }}>
          Te enviaremos un enlace para crear una nueva.
        </Text>
        <View style={{ gap: 16 }}>
          <Field
            label="Correo" icon="mail" placeholder="tu@correo.com" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email" autoFocus onSubmitEditing={onSubmit}
          />
          {error && <ErrorRow text={error} />}
        </View>
        <View style={{ marginTop: 24 }}>
          <Button variant="primary" full size="lg" loading={loading} onPress={onSubmit}>Enviar enlace</Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
