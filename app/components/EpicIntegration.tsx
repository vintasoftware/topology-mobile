import { BaseClient, EMR, LAUNCH } from "@TopologyHealth/smarterfhir";
import * as WebBrowser from "expo-web-browser";
import { useContext, useEffect, useRef } from "react";
import { Button, Linking, StyleSheet, Text, View } from "react-native";

import ClientFactoryNative from "../clientHandler";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
import updateLocationPolyfill from "../locationPolyfill";
import SmartLaunchHandlerNative from "../smartHandler";
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
      <View style={styles.content}>
        <Text style={styles.title}>Health Chat Assistant</Text>

        <Text style={styles.description}>
          Connect with your Epic health records to get personalized health
          insights and chat with your AI health assistant.
        </Text>

        <Button title="Login with Epic" onPress={handleLogin} />

        <Text style={styles.privacyText}>
          Your health data remains private and secure. We only access the
          information you explicitly authorize.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  privacyText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 16,
  },
});
