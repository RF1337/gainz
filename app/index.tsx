import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<'/onboarding' | '/(auth)' | '/(tabs)' | null>(null);

  useEffect(() => {
    async function determineRoute() {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (seen !== 'true') {
        setInitialRoute('/onboarding');
        return;
      }

      // User has seen onboarding. Check Supabase session:
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setInitialRoute('/(tabs)');
      } else {
        setInitialRoute('/(auth)');
      }
    }

    determineRoute();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={initialRoute} />;
}