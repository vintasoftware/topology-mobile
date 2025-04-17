import {
  Appointment,
  BundleEntry,
  Condition,
  DiagnosticReport,
  Goal,
  MedicationRequest,
  Observation,
  Patient,
  Practitioner,
  Reference,
} from "@medplum/fhirtypes";
import React, { createContext, useContext, useEffect, useState } from "react";

import { SmarterFhirContext } from "./SmarterFhirContext";

interface PatientContextType {
  patient: Patient | null;
  conditions: Condition[];
  practitioners: Practitioner[];
  healthMetrics: Observation[];
  diagnosticReports: DiagnosticReport[];
  goals: Goal[];
  appointments: Appointment[];
  medications: MedicationRequest[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const removeDuplicates = (conditions: Condition[]): Condition[] => {
  const uniqueConditions = new Map<string, Condition>();

  conditions.forEach((condition) => {
    const normalizedName = condition.code?.text?.toLowerCase().trim() || "";
    if (!uniqueConditions.has(normalizedName)) {
      uniqueConditions.set(normalizedName, condition);
    }
  });

  return Array.from(uniqueConditions.values());
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { client } = useContext(SmarterFhirContext);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<Observation[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<
    DiagnosticReport[]
  >([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientData = async () => {
    if (!client) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch patient data
      const patientData = await client.getPatientRead();
      setPatient(patientData);

      const today = new Date().toISOString().split("T")[0];
      const practitionerPromises = (patientData.generalPractitioner ?? [])
        .filter((ref: Reference) => ref.reference?.startsWith("Practitioner/"))
        .map((ref: Reference) => {
          const practitionerId = ref.reference?.split("/")[1];
          return client.requestResource(
            `Practitioner/${practitionerId}`,
          ) as Promise<Practitioner>;
        });
      const practitionerResponses = await Promise.all(practitionerPromises);
      setPractitioners(practitionerResponses);

      // Fetch all related data in parallel
      const [
        conditionsResponse,
        healthMetricsResponse,
        diagnosticReportsResponse,
        goalsResponse,
        appointmentsResponse,
        medicationsResponse,
      ] = await Promise.all([
        client.requestResource("Condition?_sort=-onset-date&_count=10"),
        client.requestResource(
          "Observation?category=vital-signs&_sort=-date&_count=100",
        ),
        client.requestResource("DiagnosticReport?_sort=-date&_count=10"),
        client.requestResource("Goal?_sort=-target-date&_count=10"),
        client.requestResource(
          `Appointment?date=ge${today}&_sort=date&_count=5`,
        ),
        client.requestResource(
          "MedicationRequest?_sort=-date&status=active&_count=20",
        ),
      ]);

      // Update state with fetched data
      setConditions(
        removeDuplicates(
          conditionsResponse.entry?.map(
            (entry: BundleEntry) => entry.resource as Condition,
          ) || [],
        ),
      );
      setHealthMetrics(
        healthMetricsResponse.entry?.map(
          (entry: BundleEntry) => entry.resource as Observation,
        ) || [],
      );
      setDiagnosticReports(
        diagnosticReportsResponse.entry?.map(
          (entry: BundleEntry) => entry.resource as DiagnosticReport,
        ) || [],
      );
      setGoals(
        goalsResponse.entry?.map(
          (entry: BundleEntry) => entry.resource as Goal,
        ) || [],
      );
      setAppointments(
        appointmentsResponse.entry?.map(
          (entry: BundleEntry) => entry.resource as Appointment,
        ) || [],
      );
      setMedications(
        medicationsResponse.entry?.map(
          (entry: BundleEntry) => entry.resource as MedicationRequest,
        ) || [],
      );
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError("Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [client]);

  const value = {
    patient,
    conditions,
    practitioners,
    healthMetrics,
    diagnosticReports,
    goals,
    appointments,
    medications,
    loading,
    error,
    refreshData: fetchPatientData,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
};
