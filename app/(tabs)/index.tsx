import React, { useContext } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

import ConditionsAndPractitionersSection from "../components/ConditionsAndPractitionersSection";
import DiagnosticsAndGoalsSection from "../components/DiagnosticsAndGoalsSection";
import EpicIntegration from "../components/EpicIntegration";
import GoalsSection from "../components/GoalsSection";
import { HeaderSection } from "../components/HeaderSection";
import HealthMetricsSection from "../components/HealthMetricsSection";
import MedicationsSection from "../components/MedicationsSection";
import UpcomingSection from "../components/UpcomingSection";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
const Divider = () => <View style={styles.divider} />;

export default function Index() {
  const { client } = useContext(SmarterFhirContext);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          {!client && <EpicIntegration />}
          {client && (
            <View style={styles.contentContainer}>
              <HeaderSection />
              <Divider />
              <ConditionsAndPractitionersSection />
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
    backgroundColor: "#3a3a3a",
    marginVertical: 15,
  },
});
