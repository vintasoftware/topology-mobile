import { EMR, LAUNCH } from "@TopologyHealth/smarterfhir";
import { Button, Linking, StyleSheet, Text, View } from "react-native";
import updateLocationPolyfill from "../locationPolyfill";
import { BaseClient } from "@TopologyHealth/smarterfhir";
import { Patient } from "@medplum/fhirtypes";
import ClientFactoryNative from "../clientHandler";
import SmartLaunchHandlerNative from "../smartHandler";
import * as WebBrowser from "expo-web-browser";
import { useContext, useEffect } from "react";
import { useRef } from "react";
import { SmarterFhirContext } from "../index";

WebBrowser.maybeCompleteAuthSession();

updateLocationPolyfill("exp://192.168.1.23:8081");

export default function EpicIntegration() {
  const codeVerifier = useRef<string>("");
  const { setClient } = useContext(SmarterFhirContext);

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

        // @ts-ignore
        setClient(client);

        // const data = await client.getPatientRead();
        // console.log("Patient Data:", data);
        // setPatient(data);
      } catch (error) {
        console.error("Error handling URL change:", error);
      }
    };

    // Adding the event listener for the URL change (when user is redirected back)
    Linking.addEventListener("url", handleUrl);
  }, []);

  const handleLogin = async () => {
    try {
      const emrClientID = "4f98e3bb-88dd-47c5-a1a8-cc2dd29c2b8c";
      const emrType: EMR = EMR.EPIC;
      const smartLaunchHandler = new SmartLaunchHandlerNative(
        emrClientID,
        true,
      );
      await smartLaunchHandler.authorizeEMR(
        LAUNCH.STANDALONE,
        emrType,
        "exp://192.168.1.23:8081",
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