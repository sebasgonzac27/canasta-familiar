import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/Text";
import { useAuth } from "@/lib/auth";
import { colors } from "@/theme";

/**
 * OAuth redirect target (e.g. Google sign-in on web).
 *
 * The Supabase client is configured with `detectSessionInUrl: true` + PKCE, so
 * it exchanges the `?code=...` in the URL for a session automatically on load.
 * This screen shows a spinner while that happens and then bounces to the boot
 * route, which decides where the user should land.
 */
export default function AuthCallback() {
  const { session } = useAuth();
  const params = useLocalSearchParams<{
    error?: string;
    error_code?: string;
    error_description?: string;
  }>();
  const [timedOut, setTimedOut] = useState(false);

  const providerError = params.error_description ?? params.error_code ?? params.error;

  useEffect(() => {
    if (providerError) return;
    const t = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(t);
  }, [providerError]);

  // Session established → let the boot route route the user.
  if (session) return <Redirect href="/" />;

  // The provider redirected back with an error, or the exchange never resolved.
  if (providerError || timedOut) {
    return (
      <View style={styles.center}>
        <Text weight="medium" style={{ fontSize: 18, marginBottom: 8 }}>
          No pudimos iniciar sesión
        </Text>
        <Text style={{ fontSize: 15, color: colors.gray400, textAlign: "center", lineHeight: 22 }}>
          {providerError
            ? String(providerError)
            : "El inicio de sesión tardó demasiado. Intenta de nuevo."}
        </Text>
        <Redirect href="/(auth)/login" />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.green400} />
      <Text style={{ fontSize: 15, color: colors.gray400 }}>Completando inicio de sesión…</Text>
    </View>
  );
}

const styles = {
  center: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.white,
    gap: 12,
    padding: 24,
  },
};
