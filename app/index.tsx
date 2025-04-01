// @ts-ignore
import React, { useEffect, useRef, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import updateLocationPolyfill from "@/app/locationPolyfill";
import { BaseClient, EMR, LAUNCH } from "@TopologyHealth/smarterfhir";
import { Patient } from "@medplum/fhirtypes";
import ClientFactoryNative from "@/app/clientHandler";
import {
  Button,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SmartLaunchHandlerNative from "@/app/smartHandler";

WebBrowser.maybeCompleteAuthSession();

updateLocationPolyfill("exp://192.168.1.8:8081");

export default function OAuthScreen() {
  const codeVerifier = useRef<string>("");
  const [client, setClient] = useState<BaseClient | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

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

        const data = await client.getPatientRead();
        console.log("Patient Data:", data);
        setPatient(data);
      } catch (error) {
        console.error("Error handling URL change:", error);
      }
    };

    // Adding the event listener for the URL change (when user is redirected back)
    Linking.addEventListener("url", handleUrl);
  }, []);

  const handleLogin = async () => {
    try {
      const emrClientID = "d77cd190-3ac5-4914-9fc1-c39c701fc0bc";
      const emrType: EMR = EMR.EPIC;
      const smartLaunchHandler = new SmartLaunchHandlerNative(
        emrClientID,
        true,
      );
      await smartLaunchHandler.authorizeEMR(
        LAUNCH.STANDALONE,
        emrType,
        "exp://192.168.1.8:8081",
      );
      codeVerifier.current = smartLaunchHandler.codeVerifier || "";
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>OAuth2 Authentication</Text>
        <Button title="Login with Epic" onPress={handleLogin} />
        {/* Display patient info if available */}
        {patient && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18 }}>Patient Info:</Text>
            <Text>ID: {patient.id}</Text>
            <Text>Name: {patient.name?.[0]?.text || "Unknown"}</Text>
            <Text>Gender: {patient.gender}</Text>
            <Text>Birth Date: {patient.birthDate}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tokenText: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
});
