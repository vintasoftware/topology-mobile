// @ts-ignore
import React, { useEffect, useState, useContext, createContext } from "react";
import { BaseClient} from "@TopologyHealth/smarterfhir";
import { Patient } from "@medplum/fhirtypes";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EpicIntegration from "./components/EpicIntegration";

export const SmarterFhirContext = createContext<{
  client: BaseClient | null;
  setClient: (client: BaseClient) => void;
}>({
  client: null,
  setClient: () => {},
});

export default function OAuthScreen() {
  const [client, setClient] = useState<BaseClient | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (client) {
        const data = await client.getPatientRead();
        console.log("Patient Data:", data);
        setPatient(data);
      }
    };
    void fetchPatient();
  }, [client]);

  return (
    <SmarterFhirContext.Provider value={{ client, setClient }}>
      <SafeAreaView style={styles.container}>
        <View>
          {!client && <EpicIntegration />}
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
    </SmarterFhirContext.Provider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#25292e",
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
