// app/(onboarding)/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  Text,
  View,
} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AppleHealthKit } = require('react-native').NativeModules;

type PermState = 'idle' | 'requesting' | 'granted' | 'denied';

export default function OnboardingIndex() {
  const router = useRouter();
  const [permState, setPermState] = useState<PermState>('idle');

  const canRequestHealth = Platform.OS === 'ios' && !!AppleHealthKit;

  const hkOptions = useMemo(() => {
    if (!canRequestHealth) return null;
    const HK = AppleHealthKit;
    const P = HK.Constants?.Permissions ?? {};
    return {
      permissions: {
        read: [
          P.StepCount,
          P.DistanceWalkingRunning,
          P.ActiveEnergyBurned,
          // add more later if needed:
          // P.HeartRate, P.Workout, ...
        ],
      },
    };
  }, [canRequestHealth]);

  const requestPermissions = useCallback(() => {
    if (!canRequestHealth || !hkOptions) {
      // Android or no HealthKit -> treat as granted so flow continues
      setPermState('granted');
      return;
    }
    setPermState('requesting');
    AppleHealthKit.initHealthKit(hkOptions, (err: any) => {
      if (err) {
        setPermState('denied');
        Alert.alert('Health permission', 'Could not connect to Apple Health.');
        return;
      }
      setPermState('granted');
      // Optional: you can do a quick test read here if you want
    });
  }, [canRequestHealth, hkOptions]);

  const handleNext = useCallback(async () => {
    // You can mark onboarding step done *after* a full flow; for now we just store a flag
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/sign-up'); // go to sign-up
  }, [router]);

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 12 }}>Welcome 👋</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', opacity: 0.8, marginBottom: 28 }}>
        We use Apple Health to read your steps and activity so you can see your day, week, and month at a glance.
        We never write or share your data.
      </Text>

      {/* Connect Apple Health */}
      <View style={{ width: '100%', maxWidth: 420, marginBottom: 16 }}>
        {permState === 'requesting' ? (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Connecting to Apple Health…</Text>
          </View>
        ) : (
          <Button
            title={
              Platform.OS === 'android'
                ? 'Continue (Health not required on Android)'
                : permState === 'granted'
                ? 'Connected to Apple Health ✅'
                : 'Connect Apple Health'
            }
            onPress={requestPermissions}
            disabled={permState === 'granted'}
          />
        )}
      </View>

      {/* Next button */}
      <View style={{ width: '100%', maxWidth: 420 }}>
        <Button
          title="Next"
          onPress={handleNext}
          // If you want to force permission first on iOS, uncomment:
          // disabled={Platform.OS === 'ios' && permState !== 'granted'}
        />
        <Text style={{ fontSize: 12, textAlign: 'center', opacity: 0.6, marginTop: 8 }}>
          You can change permissions anytime in Settings.
        </Text>
      </View>
    </View>
  );
}