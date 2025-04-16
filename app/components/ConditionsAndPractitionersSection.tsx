import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { usePatient } from "../context/PatientContext";

interface ConditionItem {
  id: string;
  name: string;
  status: string;
  onsetDate: string;
  severity?: string;
  category?: string;
}

interface PractitionerItem {
  id: string;
  name: string;
  reference: string;
  prefix?: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const ConditionCard = ({ condition }: { condition: ConditionItem }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{condition.name}</Text>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              condition.status === "active"
                ? "#e74c3c"
                : condition.status === "resolved"
                  ? "#27ae60"
                  : "#f39c12",
          },
        ]}
      >
        <Text style={styles.statusText}>{condition.status}</Text>
      </View>
    </View>
    <Text style={styles.dateText}>Onset Date: {condition.onsetDate}</Text>
    {condition.severity && (
      <Text style={styles.detailText}>Severity: {condition.severity}</Text>
    )}
    {condition.category && (
      <Text style={styles.detailText}>Category: {condition.category}</Text>
    )}
  </View>
);

const PractitionerCard = ({
  practitioner,
}: {
  practitioner: PractitionerItem;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>
        {practitioner.prefix ? `${practitioner.prefix} ` : ""}
        {practitioner.name}
      </Text>
    </View>
    <Text style={styles.referenceText}>{practitioner.reference}</Text>
    {practitioner.specialty && (
      <Text style={styles.detailText}>Specialty: {practitioner.specialty}</Text>
    )}
    {practitioner.phone && (
      <Text style={styles.detailText}>Phone: {practitioner.phone}</Text>
    )}
    {practitioner.email && (
      <Text style={styles.detailText}>Email: {practitioner.email}</Text>
    )}
  </View>
);

const ConditionsAndPractitionersSection = () => {
  const { conditions, practitioners, loading, error } = usePatient();

  const formattedConditions: ConditionItem[] = conditions
    .filter((condition) => condition?.id && condition?.code?.text)
    .map((condition) => ({
      id: condition.id!,
      name: condition.code!.text!,
      status: condition.clinicalStatus?.coding?.[0]?.code || "unknown",
      onsetDate: condition.onsetDateTime
        ? formatDate(condition.onsetDateTime)
        : "Unknown",
      severity: condition.severity?.coding?.[0]?.display,
      category: condition.category?.[0]?.coding?.[0]?.display,
    }))
    .filter(
      (condition) =>
        condition.name !== "Unknown" &&
        !condition.name.toLowerCase().includes("unknown") &&
        condition.status !== "unknown",
    );

  const formattedPractitioners: PractitionerItem[] = practitioners
    .filter((practitioner) => practitioner?.id && practitioner?.name?.[0]?.text)
    .map((practitioner) => ({
      id: practitioner.id!,
      name: practitioner.name![0].text!,
      reference: `Practitioner/${practitioner.id}`,
      prefix: practitioner.name![0].prefix?.[0] || "Dr.",
      specialty: practitioner.qualification?.[0]?.code?.coding?.[0]?.display,
      phone: practitioner.telecom?.find((t) => t.system === "phone")?.value,
      email: practitioner.telecom?.find((t) => t.system === "email")?.value,
    }))
    .filter(
      (practitioner) =>
        practitioner.name !== "Unknown" &&
        !practitioner.name.toLowerCase().includes("unknown"),
    );

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Conditions & Care Team</Text>
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Conditions & Care Team</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Health Conditions & Care Team</Text>

      <Text style={styles.subsectionTitle}>Active Conditions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {formattedConditions.length > 0 ? (
          formattedConditions.map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))
        ) : (
          <Text style={styles.noDataText}>No conditions available</Text>
        )}
      </ScrollView>

      <Text style={styles.subsectionTitle}>Care Team</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {formattedPractitioners.length > 0 ? (
          formattedPractitioners.map((practitioner) => (
            <PractitionerCard
              key={practitioner.id}
              practitioner={practitioner}
            />
          ))
        ) : (
          <Text style={styles.noDataText}>No practitioners available</Text>
        )}
      </ScrollView>
    </View>
  );
};

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
  subsectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
  },
  scrollView: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#1a1d20",
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    width: 300,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  referenceBadge: {
    backgroundColor: "#2c3e50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  referenceText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  dateText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  detailText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  noDataText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
    width: 300,
  },
});

export default ConditionsAndPractitionersSection;
