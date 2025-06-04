import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CARD_SIZE = (Dimensions.get('window').width - 60) / 2; // 20 (padding) + 20 (padding) + 10 (gap*2)

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Progression Hub</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/progress/workout-logs')}>
          <Ionicons name="barbell-outline" size={36} color="#ff6b00" />
          <Text style={styles.label}>Workout Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/progress/strength-progress')}>
          <Ionicons name="trending-up-outline" size={36} color="#67b1ff" />
          <Text style={styles.label}>Strength Progression</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(progress)/measurements')}>
          <Ionicons name="body-outline" size={36} color="#a29bfe" />
          <Text style={styles.label}>Measurements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/progress/weight')}>
          <Ionicons name="scale-outline" size={36} color="#82ec6c" />
          <Text style={styles.label}>Weight</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e1e1e',
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});