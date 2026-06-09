import React from "react";
import { View, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Button, Logo } from "@/components/primitives";
import { colors } from "@/theme";

export default function Onboarding() {
  const router = useRouter();
  return (
    <Screen style={{ paddingHorizontal: 28 }}>
      <View style={{ paddingTop: 24 }}>
        <Logo size={48} />
      </View>

      {/* hero illustration */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
        <Image
          source={require("../../../assets/images/onboarding-hero.png")}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Una familia haciendo el mercado junta"
          style={{
            width: "100%", aspectRatio: 1, maxHeight: 320, borderRadius: 20,
            backgroundColor: colors.gray50, borderWidth: 1, borderColor: colors.gray100,
          }}
        />
      </View>

      <View style={{ paddingBottom: 8 }}>
        <Text weight="medium" style={{ fontSize: 28, letterSpacing: -0.6, lineHeight: 34, marginBottom: 12 }}>
          La lista del mercado,{"\n"}de toda la casa.
        </Text>
        <Text style={{ fontSize: 16, color: colors.gray400, lineHeight: 24, marginBottom: 28 }}>
          Agreguen lo que falta y tachen mientras compran. Todos al día, en tiempo real.
        </Text>
        <View style={{ gap: 12 }}>
          <Button variant="primary" full size="lg" onPress={() => router.push("/(auth)/register?intent=create")}>
            Crear un hogar
          </Button>
          <Button variant="secondary" full size="lg" onPress={() => router.push("/(auth)/register?intent=join")}>
            Unirme con un código
          </Button>
        </View>
        <Pressable onPress={() => router.push("/(auth)/login")} style={{ marginTop: 22, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: colors.gray400 }}>
            ¿Ya tienes cuenta? <Text weight="medium" style={{ color: colors.green600 }}>Inicia sesión</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
