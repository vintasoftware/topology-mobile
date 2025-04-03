import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Patient } from "@medplum/fhirtypes";

interface HeaderSectionProps {
  patient: Patient;
}

export const HeaderSection = ({ patient }: HeaderSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerText}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{patient.name?.[0]?.text || "Unknown"}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
});