// screens/sign-in.tsx
import { useThemeContext } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
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

  // Auto-refresh when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => sub.remove();
  }, []);

  // Redirect as soon as Supabase reports a successful sign-in
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/(tabs)');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // EMAIL/PASSWORD SIGN-IN
  async function handleEmailSignIn() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email sign-in error:', error.message);
      Alert.alert('Sign-in error', error.message);
      setLoading(false);
    }
    // onAuthStateChange will catch the success and navigate
  }

  // OAUTH SIGN-IN (Google or Apple)
  async function handleOAuthSignIn(provider: 'google' | 'apple') {
    setLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri },
      });

      if (error) {
        Alert.alert('OAuth error', error.message);
        setLoading(false);
      }
      // onAuthStateChange will navigate once Supabase sees the session
    } catch (err: any) {
      console.error('Unexpected OAuth error:', err);
      Alert.alert('Unexpected error', err.message);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      {/* Email/password form */}
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
          onPress={handleEmailSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.separator}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Google button with logo */}
      <Pressable
        style={[styles.googleButton, loading && styles.disabled]}
        onPress={() => handleOAuthSignIn('google')}
        disabled={loading}
      >
        <View style={styles.oauthContent}>
          <Text style={styles.oauthText}>
            {loading ? 'Loading…' : 'Sign in with Google'}
          </Text>
          <Image
            source={require('../../assets/icons/google.png')}
            style={styles.oauthIcon}
          />
        </View>
      </Pressable>

      {/* Apple button with logo */}
      <Pressable
        style={[
          styles.appleButton,
          loading && styles.disabled,
        ]}
        onPress={() => handleOAuthSignIn('apple')}
        disabled={loading}
      >
        <View style={styles.oauthContent}>
          <Text style={styles.oauthTextWhite}>
            {loading ? 'Loading…' : 'Sign in with Apple'}
          </Text>
          <Image
            source={require('../../assets/icons/apple.png')}
            style={styles.oauthIcon}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    padding: 16,
  },

  // Email/password form spacing
  verticallySpaced: { marginVertical: 8 },
  mt20: { marginTop: 20 },
  label: { fontWeight: '600', marginBottom: 4, fontSize: 14, color: '#333' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff6b00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 8,
    color: '#666',
    fontWeight: '500',
  },

  // Google button: white background, gray border
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  // Apple button: black background
  appleButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  oauthContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oauthIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  oauthText: { color: '#333', fontWeight: '600', fontSize: 16 },
  oauthTextWhite: { color: '#fff', fontWeight: '600', fontSize: 16 },

  disabled: { opacity: 0.6 },
});