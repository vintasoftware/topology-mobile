import { Stack } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect } from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
