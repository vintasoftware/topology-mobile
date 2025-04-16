import { Observation } from "@medplum/fhirtypes";
import { StyleSheet, Text, View } from "react-native";

import { usePatient } from "../context/PatientContext";

interface HealthMetric {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning";
  code: string;
  lastUpdated: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getMetricStatus = (observation: Observation): "normal" | "warning" => {
  if (!observation.interpretation?.[0]?.coding?.[0]?.code) return "normal";
  return observation.interpretation[0].coding[0].code === "N"
    ? "normal"
    : "warning";
};

const getMetricValue = (observation: Observation): string => {
  if (observation.valueQuantity) {
    return observation.valueQuantity.value?.toString() || "N/A";
  }
  if (observation.component) {
    // For blood pressure, combine systolic and diastolic
    const systolic = observation.component.find(
      (c) => c.code?.coding?.[0]?.code === "8480-6",
    );
    const diastolic = observation.component.find(
      (c) => c.code?.coding?.[0]?.code === "8462-4",
    );
    if (systolic?.valueQuantity?.value && diastolic?.valueQuantity?.value) {
      return `${systolic.valueQuantity.value}/${diastolic.valueQuantity.value}`;
    }
  }
  return "N/A";
};

const getMetricUnit = (observation: Observation): string => {
  if (observation.valueQuantity) {
    return observation.valueQuantity.unit || "";
  }
  if (observation.component) {
    const firstComponent = observation.component[0];
    return firstComponent?.valueQuantity?.unit || "";
  }
  return "";
};

const HealthMetricsSection = () => {
  const { healthMetrics, loading, error } = usePatient();

  // Group observations by code to get the most recent for each type
  const observationsByCode = healthMetrics.reduce(
    (acc, observation) => {
      const code = observation.code?.coding?.[0]?.code;
      if (!code) return acc;

      if (
        !acc[code] ||
        new Date(observation.effectiveDateTime || "") >
          new Date(acc[code].effectiveDateTime || "")
      ) {
        acc[code] = observation;
      }
      return acc;
    },
    {} as Record<string, Observation>,
  );

  const healthMetricsList: HealthMetric[] = Object.values(observationsByCode)
    .map((observation) => ({
      label:
        observation.code?.text ||
        observation.category?.[0]?.coding?.[0]?.display ||
        "Unknown Metric",
      value: getMetricValue(observation),
      unit: getMetricUnit(observation),
      status: getMetricStatus(observation),
      code: observation.code?.coding?.[0]?.code || "",
      lastUpdated: formatDate(
        observation.effectiveDateTime || observation.meta?.lastUpdated || "",
      ),
    }))
    .filter((metric) => metric.value !== "N/A") // Only show metrics with valid values
    .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <Text style={styles.loadingText}>Loading health metrics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Health Metrics</Text>
      {healthMetricsList.length > 0 ? (
        healthMetricsList.map((metric) => (
          <View key={metric.code} style={styles.metricContainer}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>
              {metric.value} {metric.unit}
            </Text>
            <Text style={styles.metricDate}>
              Last updated: {metric.lastUpdated}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No health metrics available</Text>
      )}
    </View>
  );
};

export default HealthMetricsSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  healthMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  healthMetricItem: {
    width: "48%",
    backgroundColor: "#1a1d20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    position: "relative",
  },
  healthMetricLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  healthMetricValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  healthMetricValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  healthMetricUnit: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.6,
    marginLeft: 4,
  },
  statusIndicator: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  noMetricsText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  lastUpdatedText: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.6,
    marginTop: 5,
  },
  metricContainer: {
    backgroundColor: "#1a1d20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  metricLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  metricValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  metricDate: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.6,
    marginTop: 5,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  noDataText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
});
