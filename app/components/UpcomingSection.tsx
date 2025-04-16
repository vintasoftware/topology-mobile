import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { usePatient } from "../context/PatientContext";

interface AppointmentItem {
  title: string;
  date: string;
  location: string;
  type: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const UpcomingSection = () => {
  const { appointments, loading, error } = usePatient();

  const formattedAppointments: AppointmentItem[] = appointments
    .filter((appointment) => appointment?.id)
    .map((appointment) => ({
      title: appointment.description || "Appointment",
      date: appointment.start ? formatDate(appointment.start) : "No date set",
      location:
        appointment.participant?.find((p) =>
          p.actor?.reference?.includes("Location"),
        )?.actor?.display || "Location not specified",
      type: appointment.serviceType?.[0]?.text || "General",
    }));

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (formattedAppointments.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upcoming</Text>
      {formattedAppointments.map((appointment, index) => (
        <View key={index} style={styles.appointmentItem}>
          <View style={styles.appointmentIcon}>
            <Ionicons name="calendar-outline" size={24} color="#fff" />
          </View>
          <View style={styles.appointmentDetails}>
            <Text style={styles.appointmentTitle}>{appointment.title}</Text>
            <Text style={styles.appointmentDate}>{appointment.date}</Text>
            <Text style={styles.appointmentLocation}>
              {appointment.location}
            </Text>
            <Text style={styles.appointmentType}>{appointment.type}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default UpcomingSection;

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
  appointmentItem: {
    flexDirection: "row",
    backgroundColor: "#1a1d20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  appointmentIcon: {
    marginRight: 15,
    justifyContent: "center",
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  appointmentDate: {
    color: "#ffd33d",
    fontSize: 14,
    marginBottom: 2,
  },
  appointmentLocation: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.6,
  },
  appointmentType: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.6,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  noAppointmentsText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
});
