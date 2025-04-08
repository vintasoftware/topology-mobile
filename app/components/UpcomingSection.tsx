import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from "react";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
import { Appointment, Bundle } from "@medplum/fhirtypes";

interface AppointmentItem {
  title: string;
  date: string;
  location: string;
  type: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
};

const UpcomingSection = () => {
  const { client } = useContext(SmarterFhirContext);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!client) return;

      try {
        // Get current date in FHIR format
        const today = new Date().toISOString().split('T')[0];

        // Search for appointments using requestResource
        const response = await client.requestResource(
          `Appointment?date=ge${today}&_sort=date&_count=5`
        ) as Bundle;

        if (response.entry) {
          const upcomingAppointments = response.entry
            .map(entry => entry.resource as Appointment)
            .map(appointment => ({
              title: appointment.description || "Appointment",
              date: appointment.start ? formatDate(appointment.start) : "No date set",
              location: appointment.participant?.find(p => p.actor?.reference?.includes("Location"))?.actor?.display || "Location not specified",
              type: appointment.serviceType?.[0]?.text || "General"
            }));

          setAppointments(upcomingAppointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [client]);

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  if (appointments.length === 0) {
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
      {appointments.map((appointment, index) => (
        <View key={index} style={styles.upcomingItem}>
          <View style={styles.upcomingIcon}>
            <Ionicons
              name={appointment.type.toLowerCase().includes("check") ? "medical" : "calendar"}
              size={24}
              color="#ffd33d"
            />
          </View>
          <View style={styles.upcomingContent}>
            <Text style={styles.upcomingTitle}>{appointment.title}</Text>
            <Text style={styles.upcomingDate}>{appointment.date}</Text>
            <Text style={styles.upcomingLocation}>{appointment.location}</Text>
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  upcomingItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1d20',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  upcomingIcon: {
    marginRight: 15,
    justifyContent: 'center',
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  upcomingDate: {
    color: '#ffd33d',
    fontSize: 14,
    marginBottom: 2,
  },
  upcomingLocation: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  noAppointmentsText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
});
