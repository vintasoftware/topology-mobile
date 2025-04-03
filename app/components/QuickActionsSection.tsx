import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";

const QuickAccessItem = ({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.quickAccessItem} onPress={onPress}>
    <Ionicons name={icon as any} size={24} color="#ffd33d" />
    <Text style={styles.quickAccessText}>{title}</Text>
  </TouchableOpacity>
);

export const QuickActionsSection = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickAccessGrid}>
        <QuickAccessItem icon="medical" title="My Records" onPress={() => {}} />
        <QuickAccessItem icon="calendar" title="Appointments" onPress={() => {}} />
        <QuickAccessItem icon="document-text" title="Test Results" onPress={() => {}} />
        <QuickAccessItem icon="chatbubble" title="Message Doctor" onPress={() => {}} />
      </View>
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
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '48%',
    backgroundColor: '#1a1d20',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  quickAccessText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
});