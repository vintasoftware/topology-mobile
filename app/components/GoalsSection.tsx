import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SmarterFhirContext } from "../index";
import { Goal, Bundle } from "@medplum/fhirtypes";
import { Ionicons } from '@expo/vector-icons';

interface GoalItem {
  id: string;
  description: string;
  status: string;
  startDate: string;
  progress: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const GoalCard = ({ goal, isMain = false }: { goal: GoalItem; isMain?: boolean }) => (
  <View style={[styles.card, isMain && styles.mainCard]}>
    <View style={styles.cardHeader}>
      <Text style={[styles.cardTitle, isMain && styles.mainCardTitle]}>{goal.description}</Text>
      <View style={[styles.statusBadge, {
        backgroundColor: goal.status === 'achieved' ? '#27ae60' :
                        goal.status === 'active' ? '#3498db' : '#f39c12'
      }]}>
        <Text style={styles.statusText}>{goal.status}</Text>
      </View>
    </View>
    <Text style={styles.dateText}>Start Date: {goal.startDate}</Text>
    <Text style={styles.progressText}>Progress: {goal.progress}</Text>
  </View>
);

export const GoalsSection = () => {
  const { client } = useContext(SmarterFhirContext);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!client) return;

      try {
        const goalsResponse = await client.requestResource(
          'Goal?_sort=-target-date&_count=10'
        ) as Bundle;

        if (goalsResponse.entry) {
          const goals = goalsResponse.entry
            .map(entry => entry.resource as Goal)
            .filter(goal => goal?.id && goal?.description?.text)
            .map(goal => ({
              id: goal.id!,
              description: goal.description!.text!,
              status: goal.lifecycleStatus || 'unknown',
              startDate: goal.startDate ? formatDate(goal.startDate) : 'No start date',
              progress: goal.achievementStatus?.text || 'In progress'
            }))
            .filter(goal => goal.description !== 'Unknown Goal')
            .sort((a, b) => {
              // Sort by start date, with no date at the end
              if (a.startDate === 'No start date') return 1;
              if (b.startDate === 'No start date') return -1;
              return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            });

          setGoals(goals);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
        setError("Unable to fetch goals at this time");
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [client]);

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

  const mainGoal = goals[0];
  const otherGoals = goals.slice(1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Active Treatment Plans</Text>

      {mainGoal && <GoalCard goal={mainGoal} isMain />}

      {otherGoals.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Show Less' : `Show ${otherGoals.length} More Goals`}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {isExpanded && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              {otherGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </ScrollView>
          )}
        </>
      )}

      {goals.length === 0 && (
        <Text style={styles.noDataText}>No goals available</Text>
      )}
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
  mainCard: {
    backgroundColor: '#2c3e50',
    width: '100%',
    marginRight: 0,
    marginBottom: 15,
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
  mainCardTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  progressText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#1a1d20',
    borderRadius: 8,
    marginBottom: 10,
  },
  expandButtonText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
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
  },
});