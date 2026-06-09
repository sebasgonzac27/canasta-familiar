import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useHouseholds } from "@/lib/household-context";
import { colors } from "@/theme";

export default function Boot() {
  const { initializing, session } = useAuth();
  const { loading, activeHousehold } = useHouseholds();

  if (initializing || (session && loading)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
        <ActivityIndicator color={colors.green400} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/onboarding" />;
  if (!activeHousehold) return <Redirect href="/(auth)/setup" />;
  return <Redirect href="/(app)" />;
}
