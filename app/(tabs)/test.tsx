import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

const { AppleHealthKit } = require('react-native').NativeModules;

export default function HealthKitTest() {
  const [stepCount, setStepCount] = useState<number>(0);
  const [bmi, setBmi] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // HealthKit permissions
  const permissions = {
    permissions: {
      read: [
        'Steps',
        'StepCount', 
        'BodyMassIndex',
        'Height',
        'Weight'
      ],
      write: []
    }
  };

  // Initialize HealthKit with permissions
  const initializeHealthKit = () => {
    if (!AppleHealthKit) {
      Alert.alert('Error', 'HealthKit not available');
      return;
    }

    setLoading(true);

    // Check availability first
    AppleHealthKit.isAvailable((error: any, available: boolean) => {
      if (error || !available) {
        Alert.alert('Error', 'HealthKit not available on this device');
        setLoading(false);
        return;
      }

      // Initialize with permissions
      AppleHealthKit.initHealthKit(permissions, (error: any) => {
        if (error) {
          console.log('HealthKit init error:', error);
          Alert.alert('Error', 'Failed to get HealthKit permissions');
          setLoading(false);
          return;
        }

        setIsInitialized(true);
        Alert.alert('Success', 'HealthKit initialized!');
        setLoading(false);

        // Now we can safely fetch data
        fetchHealthData();
      });
    });
  };

  // Fetch health data (only after permissions granted)
  const fetchHealthData = () => {
    if (!isInitialized || !AppleHealthKit) {
      Alert.alert('Error', 'HealthKit not initialized');
      return;
    }

    setLoading(true);

    // Get today's steps
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const stepOptions = {
      startDate: startOfDay.toISOString(),
      endDate: today.toISOString(),
    };

    AppleHealthKit.getStepCount(stepOptions, (error: any, results: any) => {
      if (error) {
        console.log('Step count error:', error);
      } else {
        console.log('Steps:', results);
        setStepCount(results?.value || 0);
      }
    });

    // Get latest BMI
    AppleHealthKit.getLatestBmi({}, (error: any, results: any) => {
      if (error) {
        console.log('BMI error:', error);
        setBmi(null);
      } else {
        console.log('BMI:', results);
        setBmi(results?.value || null);
      }
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthKit Test</Text>

      {!isInitialized ? (
        <View style={styles.initSection}>
          <Text style={styles.description}>
            HealthKit needs permissions to access your health data
          </Text>
          <Button
            title={loading ? "Initializing..." : "Setup HealthKit"}
            onPress={initializeHealthKit}
            disabled={loading}
          />
        </View>
      ) : (
        <View style={styles.dataSection}>
          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Steps Today</Text>
            <Text style={styles.dataValue}>
              {stepCount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.dataCard}>
            <Text style={styles.dataLabel}>Latest BMI</Text>
            <Text style={styles.dataValue}>
              {bmi ? bmi.toFixed(1) : 'No data'}
            </Text>
          </View>

          <Button
            title={loading ? "Loading..." : "Refresh Data"}
            onPress={fetchHealthData}
            disabled={loading}
          />
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isInitialized ? '✅ Connected' : '❌ Not connected'}
        </Text>
        <Text style={styles.statusText}>
          Module: {AppleHealthKit ? '✅ Available' : '❌ Missing'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  initSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  dataSection: {
    gap: 20,
    marginBottom: 40,
  },
  dataCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
});