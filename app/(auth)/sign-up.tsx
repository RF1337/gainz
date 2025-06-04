// screens/sign-up.tsx
import { useThemeContext } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase'; // Adjust the import path as necessary
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const { scheme } = useThemeContext();
  const isDark = scheme === 'dark';

  const colors = {
    background: isDark ? '#121212' : '#fff',
    label: isDark ? '#ddd' : '#333',
    inputBorder: isDark ? '#777' : '#ccc',
    inputBackground: isDark ? '#121212' : '#fafafa',
  };

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Manage session auto-refresh when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  async function handleSignUp() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Sign-up error', error.message);
      } else if (!data.session) {
        Alert.alert(
          'Verify your email',
          'Please check your inbox for a verification link to complete sign up.'
        );
      } else {
        // successful sign-up with session
        Alert.alert('Welcome!', 'Your account has been created and you are signed in.');
      }
    } catch (err: any) {
      Alert.alert('Unexpected error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.verticallySpaced]}>
        <Text style={[styles.label, { color: colors.label }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: colors.label }]}>Password</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing up…' : 'Sign up'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.verticallySpaced}>
        <Pressable onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.signInText}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 100, padding: 16 },
  verticallySpaced: { marginVertical: 8 },
  mt20: { marginTop: 20 },
  label: { fontWeight: '600', marginBottom: 4, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#ff6b00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkText: { color: '#666', marginTop: 12, textAlign: 'center' },
  signInText: { color: '#007aff' }, // blue for "Sign In"
});