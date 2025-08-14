import React, { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
import {
    getStepCount,
    initHealthKit,
    isAvailable,
    requestPermissions
} from 'react-native-health';

export default function HealthTestScreen() {
  const [stepCount, setStepCount] = useState<number>(0);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Health permissions we want to read
  const permissions = {
    permissions: {
      read: [
        'StepCount',
        'DistanceWalkingRunning',
        'Calories',
        'HeartRate',
      ],
      write: []
    }
  };

  // Initialize HealthKit and request permissions
  const initializeHealth = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Error', 'HealthKit is only available on iOS');
      return;
    }

    try {
      setLoading(true);

      // Check if HealthKit is available
      const available = await isAvailable();
      if (!available) {
        Alert.alert('Error', 'HealthKit is not available on this device');
        return;
      }

      // Initialize HealthKit
      await initHealthKit(permissions);

      // Request permissions
      await requestPermissions(permissions);

      setHasPermissions(true);
      Alert.alert('Success', 'HealthKit permissions granted!');

      // Fetch today's steps
      await fetchTodaysSteps();

    } catch (error: unknown) {
      console.error('HealthKit initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to initialize HealthKit: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's step count
  const fetchTodaysSteps = async () => {
    if (!hasPermissions) {
      Alert.alert('Error', 'Please grant HealthKit permissions first');
      return;
    }

    try {
      setLoading(true);

      // Get today's date range
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Query step count for today
      const options = {
        startDate: startOfToday.toISOString(),
        endDate: now.toISOString(),
      };

      const steps = await getStepCount(options);
      setStepCount(steps.value || 0);

    } catch (error: unknown) {
      console.error('Steps fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to fetch steps: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthKit Step Counter</Text>
      
      <View style={styles.stepDisplay}>
        <Text style={styles.stepCount}>
          {stepCount.toLocaleString()}
        </Text>
        <Text style={styles.stepLabel}>Steps Today</Text>
      </View>

      <View style={styles.buttonContainer}>
        {!hasPermissions ? (
          <Button
            title={loading ? "Initializing..." : "Setup HealthKit"}
            onPress={initializeHealth}
            disabled={loading}
          />
        ) : (
          <Button
            title={loading ? "Loading..." : "Refresh Steps"}
            onPress={fetchTodaysSteps}
            disabled={loading}
          />
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Status: {hasPermissions ? '✅ Connected' : '❌ Not connected'}
        </Text>
        <Text style={styles.infoText}>
          Platform: {Platform.OS}
        </Text>
        {Platform.OS !== 'ios' && (
          <Text style={styles.warningText}>
            ⚠️ HealthKit only works on iOS devices
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  stepDisplay: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  stepLabel: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 30,
    width: '80%',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
});