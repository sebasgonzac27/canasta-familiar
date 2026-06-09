import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { colors } from "@/theme";

export default function AppLayout() {
  const { initializing, session } = useAuth();
  const { loading, activeHousehold } = useHouseholds();

  if (initializing || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
        <ActivityIndicator color={colors.green400} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/onboarding" />;
  if (!activeHousehold) return <Redirect href="/(auth)/setup" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="compra" />
      <Stack.Screen name="hogar" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="agregar" options={{ presentation: "transparentModal", animation: "fade" }} />
      <Stack.Screen name="confirmar" options={{ presentation: "transparentModal", animation: "fade" }} />
    </Stack>
  );
}
