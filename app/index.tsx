// @ts-ignore
import React, { useEffect, useState, useContext, createContext } from "react";
import { BaseClient } from "@TopologyHealth/smarterfhir";
import { Patient } from "@medplum/fhirtypes";
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import EpicIntegration from "./components/EpicIntegration";
import { HeaderSection } from "./components/HeaderSection";
import { QuickActionsSection } from "./components/QuickActionsSection";
import { UpcomingSection } from "./components/UpcomingSection";
import { HealthMetricsSection } from "./components/HealthMetricsSection";
import { DiagnosticsAndGoalsSection } from "./components/DiagnosticsAndGoalsSection";
import { MedicationsSection } from "./components/MedicationsSection";
import { GoalsSection } from "./components/GoalsSection";
import { ConditionsAndPractitionersSection } from "./components/ConditionsAndPractitionersSection";

export const SmarterFhirContext = createContext<{
  client: BaseClient | null;
  setClient: (client: BaseClient) => void;
}>({
  client: null,
  setClient: () => {},
});

const Divider = () => (
  <View style={styles.divider} />
);

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View>
            {!client && <EpicIntegration />}
            {patient && (
              <View style={styles.contentContainer}>
                <HeaderSection patient={patient} />
                <Divider />
                <ConditionsAndPractitionersSection patient={patient} />
                <Divider />
                <GoalsSection />
                <Divider />
                <DiagnosticsAndGoalsSection />
                <Divider />
                <UpcomingSection />
                <Divider />
                <HealthMetricsSection />
                <Divider />
                <MedicationsSection />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SmarterFhirContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginVertical: 15,
  },
});
