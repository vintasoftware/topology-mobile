import { StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
import { Observation, Bundle } from "@medplum/fhirtypes";

interface HealthMetric {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning';
  code: string;
  lastUpdated: string;
}

const HealthMetricItem = ({ label, value, unit, status, lastUpdated }: {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning';
  lastUpdated: string;
}) => (
  <View style={styles.healthMetricItem}>
    <Text style={styles.healthMetricLabel}>{label}</Text>
    <View style={styles.healthMetricValueContainer}>
      <Text style={styles.healthMetricValue}>{value}</Text>
      <Text style={styles.healthMetricUnit}>{unit}</Text>
    </View>
    <View style={[styles.statusIndicator, { backgroundColor: status === 'normal' ? '#27ae60' : '#e74c3c' }]} />
    <Text style={styles.lastUpdatedText}>Last updated: {lastUpdated}</Text>
  </View>
);

const getMetricStatus = (observation: Observation): 'normal' | 'warning' => {
  if (!observation.interpretation?.[0]?.coding?.[0]?.code) return 'normal';
  return observation.interpretation[0].coding[0].code === 'N' ? 'normal' : 'warning';
};

const getMetricValue = (observation: Observation): string => {
  if (observation.valueQuantity) {
    return observation.valueQuantity.value?.toString() || 'N/A';
  }
  if (observation.component) {
    // For blood pressure, combine systolic and diastolic
    const systolic = observation.component.find(c => c.code?.coding?.[0]?.code === '8480-6');
    const diastolic = observation.component.find(c => c.code?.coding?.[0]?.code === '8462-4');
    if (systolic?.valueQuantity?.value && diastolic?.valueQuantity?.value) {
      return `${systolic.valueQuantity.value}/${diastolic.valueQuantity.value}`;
    }
  }
  return 'N/A';
};

const getMetricUnit = (observation: Observation): string => {
  if (observation.valueQuantity) {
    return observation.valueQuantity.unit || '';
  }
  if (observation.component) {
    const firstComponent = observation.component[0];
    return firstComponent?.valueQuantity?.unit || '';
  }
  return '';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const HealthMetricsSection = () => {
  const { client } = useContext(SmarterFhirContext);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!client) return;

      try {
        // Fetch all vital signs observations
        const response = await client.requestResource(
          `Observation?category=vital-signs&_sort=-date&_count=100`
        ) as Bundle;

        if (response.entry) {
          // Group observations by code to get the most recent for each type
          const observationsByCode = response.entry
            .map(entry => entry.resource as Observation)
            .reduce((acc, observation) => {
              const code = observation.code?.coding?.[0]?.code;
              if (!code) return acc;

              if (!acc[code] || new Date(observation.effectiveDateTime || '') > new Date(acc[code].effectiveDateTime || '')) {
                acc[code] = observation;
              }
              return acc;
            }, {} as Record<string, Observation>);

          const healthMetrics = Object.values(observationsByCode)
            .map(observation => ({
              label: observation.code?.text || observation.category?.[0]?.coding?.[0]?.display || 'Unknown Metric',
              value: getMetricValue(observation),
              unit: getMetricUnit(observation),
              status: getMetricStatus(observation),
              code: observation.code?.coding?.[0]?.code || '',
              lastUpdated: formatDate(observation.effectiveDateTime || observation.meta?.lastUpdated || '')
            }))
            .filter(metric => metric.value !== 'N/A') // Only show metrics with valid values
            .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

          setMetrics(healthMetrics);
        }
      } catch (error) {
        console.error("Error fetching health metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthMetrics();
  }, [client]);

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Health Metrics</Text>
        <Text style={styles.loadingText}>Loading health metrics...</Text>
      </View>
    );
  }

  if (metrics.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Health Metrics</Text>
        <Text style={styles.noMetricsText}>No health metrics available</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Health Metrics</Text>
      <View style={styles.healthMetricsGrid}>
        {metrics.map((metric, index) => (
          <HealthMetricItem
            key={index}
            label={metric.label}
            value={metric.value}
            unit={metric.unit}
            status={metric.status}
            lastUpdated={metric.lastUpdated}
          />
        ))}
      </View>
    </View>
  );
};

export default HealthMetricsSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  healthMetricItem: {
    width: '48%',
    backgroundColor: '#1a1d20',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    position: 'relative',
  },
  healthMetricLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  healthMetricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  healthMetricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  healthMetricUnit: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
    marginLeft: 4,
  },
  statusIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  noMetricsText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  lastUpdatedText: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.6,
    marginTop: 5,
  },
});