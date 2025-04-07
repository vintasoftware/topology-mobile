import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Condition, Bundle, Practitioner, Patient } from "@medplum/fhirtypes";
import { SmarterFhirContext } from "../context/SmarterFhirContext";

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
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const ConditionCard = ({ condition }: { condition: ConditionItem }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{condition.name}</Text>
      <View style={[styles.statusBadge, {
        backgroundColor: condition.status === 'active' ? '#e74c3c' :
                        condition.status === 'resolved' ? '#27ae60' : '#f39c12'
      }]}>
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

const PractitionerCard = ({ practitioner }: { practitioner: PractitionerItem }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>
        {practitioner.prefix ? `${practitioner.prefix} ` : ''}{practitioner.name}
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

const removeDuplicates = (conditions: ConditionItem[]): ConditionItem[] => {
  const uniqueConditions = new Map<string, ConditionItem>();

  conditions.forEach(condition => {
    const normalizedName = condition.name.toLowerCase().trim();
    if (!uniqueConditions.has(normalizedName)) {
      uniqueConditions.set(normalizedName, condition);
    }
  });

  return Array.from(uniqueConditions.values());
};

const ConditionsAndPractitionersSection = ({ patient }: { patient: Patient }) => {
  const { client } = useContext(SmarterFhirContext);
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [practitioners, setPractitioners] = useState<PractitionerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!client) return;

      try {
        // Fetch Conditions
        const conditionsResponse = await client.requestResource(
          'Condition?_sort=-onset-date&_count=10'
        ) as Bundle;

        if (conditionsResponse.entry) {
          const conditions = conditionsResponse.entry
            .map(entry => entry.resource as Condition)
            .filter(condition => condition?.id && condition?.code?.text)
            .map(condition => ({
              id: condition.id!,
              name: condition.code!.text!,
              status: condition.clinicalStatus?.coding?.[0]?.code || 'unknown',
              onsetDate: condition.onsetDateTime ? formatDate(condition.onsetDateTime) : 'Unknown',
              severity: condition.severity?.coding?.[0]?.display,
              category: condition.category?.[0]?.coding?.[0]?.display
            }))
            .filter(condition =>
              condition.name !== 'Unknown' &&
              !condition.name.toLowerCase().includes('unknown') &&
              condition.status !== 'unknown'
            );

          // Remove duplicates and set the filtered conditions
          setConditions(removeDuplicates(conditions));
        }

        // Get practitioners from patient's generalPractitioner references
        if (patient.generalPractitioner) {
          const practitionerPromises = patient.generalPractitioner
            .filter(ref => ref.reference?.startsWith('Practitioner/'))
            .map(ref => {
              const practitionerId = ref.reference?.split('/')[1];
              return client.requestResource(`Practitioner/${practitionerId}`) as Promise<Practitioner>;
            });

          const practitionerResponses = await Promise.all(practitionerPromises);

          const practitioners = practitionerResponses
            .filter(practitioner => practitioner?.id && practitioner?.name?.[0]?.text)
            .map(practitioner => ({
              id: practitioner.id!,
              name: practitioner.name![0].text!,
              reference: `Practitioner/${practitioner.id}`,
              prefix: practitioner.name![0].prefix?.[0] || "Dr.",
              specialty: practitioner.qualification?.[0]?.code?.coding?.[0]?.display,
              phone: practitioner.telecom?.find(t => t.system === 'phone')?.value,
              email: practitioner.telecom?.find(t => t.system === 'email')?.value
            }))
            .filter(practitioner =>
              practitioner.name !== 'Unknown' &&
              !practitioner.name.toLowerCase().includes('unknown')
            );

          setPractitioners(practitioners);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Unable to fetch data at this time");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client, patient]);

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {conditions.length > 0 ? (
          conditions.map(condition => (
            <ConditionCard key={condition.id} condition={condition} />
          ))
        ) : (
          <Text style={styles.noDataText}>No conditions available</Text>
        )}
      </ScrollView>

      <Text style={styles.subsectionTitle}>Care Team</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {practitioners.length > 0 ? (
          practitioners.map(practitioner => (
            <PractitionerCard key={practitioner.id} practitioner={practitioner} />
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subsectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  scrollView: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1a1d20',
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    width: 300,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  referenceBadge: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  referenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  noDataText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    width: 300,
  },
});

export default ConditionsAndPractitionersSection;
