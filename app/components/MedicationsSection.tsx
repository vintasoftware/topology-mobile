import { ScrollView, StyleSheet, Text, View } from "react-native";

import { usePatient } from "../context/PatientContext";

interface MedicationItem {
  id: string;
  name: string;
  status: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescriber?: string;
  category?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const MedicationCard = ({ medication }: { medication: MedicationItem }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{medication.name}</Text>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              medication.status === "active"
                ? "#27ae60"
                : medication.status === "completed"
                  ? "#3498db"
                  : "#f39c12",
          },
        ]}
      >
        <Text style={styles.statusText}>{medication.status}</Text>
      </View>
    </View>
    <View style={styles.detailsContainer}>
      <Text style={styles.detailText}>Dosage: {medication.dosage}</Text>
      <Text style={styles.detailText}>Frequency: {medication.frequency}</Text>
      <Text style={styles.detailText}>Start Date: {medication.startDate}</Text>
      {medication.endDate && (
        <Text style={styles.detailText}>End Date: {medication.endDate}</Text>
      )}
      {medication.prescriber && (
        <Text style={styles.detailText}>
          Prescriber: {medication.prescriber}
        </Text>
      )}
      {medication.category && (
        <Text style={styles.detailText}>Category: {medication.category}</Text>
      )}
    </View>
  </View>
);

const MedicationsSection = () => {
  const { medications, loading, error } = usePatient();

  const formattedMedications: MedicationItem[] = medications
    .filter((medication) => medication?.id)
    .map((medication) => ({
      id: medication.id!,
      name:
        medication.medicationReference?.display ||
        medication.medicationCodeableConcept?.text ||
        "Unknown Medication",
      status: medication.status || "unknown",
      dosage: medication.dosageInstruction?.[0]?.text || "No dosage specified",
      frequency:
        medication.dosageInstruction?.[0]?.timing?.code?.text || "As needed",
      startDate: formatDate(medication.authoredOn || ""),
      endDate: medication.dispenseRequest?.validityPeriod?.end
        ? formatDate(medication.dispenseRequest.validityPeriod.end)
        : undefined,
      prescriber: medication.requester?.display,
      category: "Prescription",
    }))
    .filter(
      (medication) =>
        medication.name !== "Unknown Medication" &&
        !medication.name.toLowerCase().includes("unknown") &&
        medication.status !== "unknown" &&
        medication.dosage !== "No dosage specified",
    );

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <Text style={styles.loadingText}>Loading medications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medications</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medications</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {formattedMedications.length > 0 ? (
          formattedMedications.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))
        ) : (
          <Text style={styles.noDataText}>No medications available</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default MedicationsSection;

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
  detailsContainer: {
    marginTop: 8,
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
