import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { SmarterFhirContext } from "../context/SmarterFhirContext";
import { DiagnosticReport, Goal, Bundle } from "@medplum/fhirtypes";

interface DiagnosticReportItem {
  id: string;
  title: string;
  status: string;
  date: string;
  conclusion: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const DiagnosticReportCard = ({ report }: { report: DiagnosticReportItem }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{report.title}</Text>
      <View style={[styles.statusBadge, { backgroundColor: report.status === 'final' ? '#27ae60' : '#f39c12' }]}>
        <Text style={styles.statusText}>{report.status}</Text>
      </View>
    </View>
    <Text style={styles.dateText}>Date: {report.date}</Text>
    <Text style={styles.conclusionText}>{report.conclusion}</Text>
  </View>
);


const DiagnosticsAndGoalsSection = () => {
  const { client } = useContext(SmarterFhirContext);
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!client) return;

      try {
        // Fetch Diagnostic Reports
        const reportsResponse = await client.requestResource(
          'DiagnosticReport?_sort=-date&_count=10'
        ) as Bundle;

        if (reportsResponse.entry) {
          const reports = reportsResponse.entry
            .map(entry => entry.resource as DiagnosticReport)
            .filter(report => report?.id && report?.code?.text) // Filter out invalid reports
            .map(report => ({
              id: report.id!,
              title: report.code!.text!,
              status: report.status || 'unknown',
              date: formatDate(report.effectiveDateTime || report.meta?.lastUpdated || ''),
              conclusion: report.conclusion || 'No conclusion available'
            }))
            .filter(report => report.title !== 'Unknown Diagnostic Report'); // Filter out unknown titles

          setDiagnosticReports(reports);
        }
      } catch (error) {
        console.error("Error fetching diagnostics and goals:", error);
        setError("Unable to fetch diagnostics and goals at this time");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client]);

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostics & Goals</Text>
        <Text style={styles.loadingText}>Loading diagnostics and goals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostics & Goals</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Diagnostic Reports</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {diagnosticReports.length > 0 ? (
          diagnosticReports.map(report => (
            <DiagnosticReportCard key={report.id} report={report} />
          ))
        ) : (
          <Text style={styles.noDataText}>No diagnostic reports available</Text>
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
    width: 280,
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
  dateText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  conclusionText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
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
    width: 280,
  },
});

export default DiagnosticsAndGoalsSection;