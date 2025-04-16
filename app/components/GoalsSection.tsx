import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { usePatient } from "../context/PatientContext";

interface GoalItem {
  id: string;
  description: string;
  status: string;
  startDate: string;
  progress: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const GoalsSection = () => {
  const { goals, loading, error } = usePatient();
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedGoals: GoalItem[] = goals
    .filter((goal) => goal?.id && goal?.description?.text)
    .map((goal) => ({
      id: goal.id!,
      description: goal.description!.text!,
      status: goal.lifecycleStatus || "unknown",
      startDate: goal.startDate ? formatDate(goal.startDate) : "No start date",
      progress: goal.achievementStatus?.text || "In progress",
    }))
    .filter((goal) => goal.description !== "Unknown Goal")
    .sort((a, b) => {
      // Sort by start date, with no date at the end
      if (a.startDate === "No start date") return 1;
      if (b.startDate === "No start date") return -1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        {formattedGoals.length > 3 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.expandButton}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {formattedGoals.length > 0 ? (
        formattedGoals.slice(0, isExpanded ? undefined : 3).map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            <View style={styles.goalDetails}>
              <Text style={styles.goalStatus}>{goal.status}</Text>
              <Text style={styles.goalDate}>Started: {goal.startDate}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${goal.progress === "Achieved" ? 100 : 50}%`,
                    backgroundColor:
                      goal.progress === "Achieved"
                        ? "#27ae60"
                        : goal.progress === "In progress"
                          ? "#f39c12"
                          : "#e74c3c",
                  },
                ]}
              />
              <Text style={styles.progressText}>{goal.progress}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No health goals available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: "#1a1d20",
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  expandButton: {
    color: "#ffd33d",
    fontSize: 14,
  },
  goalItem: {
    backgroundColor: "#1a1d20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  goalDescription: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  goalDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalStatus: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  goalDate: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
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
  noDataText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1a1d20",
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    width: 280,
  },
  mainCard: {
    backgroundColor: "#2c3e50",
    width: "100%",
    marginRight: 0,
    marginBottom: 15,
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
  mainCardTitle: {
    fontSize: 18,
    fontWeight: "700",
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
  dateText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
});

export default GoalsSection;
