import { BaseClient, EMR, LAUNCH } from "@TopologyHealth/smarterfhir";
import { Button, Linking, StyleSheet, Text, View } from "react-native";
import updateLocationPolyfill from "../locationPolyfill";
import ClientFactoryNative from "../clientHandler";
import SmartLaunchHandlerNative from "../smartHandler";
import * as WebBrowser from "expo-web-browser";
import { useContext, useEffect } from "react";
import { useRef } from "react";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
WebBrowser.maybeCompleteAuthSession();

updateLocationPolyfill(process.env.EXPO_PUBLIC_REDIRECT_URL!);

export default function EpicIntegration() {
  const codeVerifier = useRef<string>("");
  const { client, setClient } = useContext(SmarterFhirContext);

  useEffect(() => {
    // Event listener for when the URL changes (after redirect)
    const handleUrl = async ({ url }: { url: string }) => {
      try {
        // 1. Update the polyfill with the new URL
        updateLocationPolyfill(url);

        const clientFactory = new ClientFactoryNative();
        const client = await clientFactory.createEMRClient(
          LAUNCH.STANDALONE,
          codeVerifier.current,
        );

        setClient(client as unknown as BaseClient);
      } catch (error) {
        console.error("Error handling URL change:", error);
      }
    };

    // Adding the event listener for the URL change (when user is redirected back)
    const subscription = Linking.addEventListener("url", handleUrl);

    // Cleanup function to remove the event listener
    return () => {
      subscription.remove();
    };
  }, [setClient]);

  useEffect(() => {
    if (client === null) {
      updateLocationPolyfill(process.env.EXPO_PUBLIC_REDIRECT_URL!);
      codeVerifier.current = "";

    }
  }, [client]);

  const handleLogin = async () => {
    try {
      const emrClientID = process.env.EXPO_PUBLIC_EMR_CLIENT_ID!;
      const emrType: EMR = EMR.EPIC;
      const smartLaunchHandler = new SmartLaunchHandlerNative(
        emrClientID,
        true,
      );
      await smartLaunchHandler.authorizeEMR(
        LAUNCH.STANDALONE,
        emrType,
        process.env.EXPO_PUBLIC_REDIRECT_URL!,
      );
      codeVerifier.current = smartLaunchHandler.codeVerifier || "";
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth2 Authentication</Text>
      <Button title="Login with Epic" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    textAlign: "center",
  },
});
