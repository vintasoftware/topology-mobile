import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { usePatient } from "../context/PatientContext";
import { SmarterFhirContext } from "../context/SmarterFhirContext";

export const HeaderSection = () => {
  const { logout } = useContext(SmarterFhirContext);
  const { patient } = usePatient();

  return (
    <View style={styles.container}>
      <View style={styles.headerText}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>
          {patient?.name?.[0]?.text || "Unknown"}
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderSection;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    marginBottom: 20,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#3a3a3a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
  },
});
