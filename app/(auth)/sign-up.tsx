// screens/sign-up.tsx
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
  const { ui } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Inline validering ---
  const emailError = useMemo(() => {
    if (!emailTouched) return '';
    if (!email) return 'Email er påkrævet';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return ok ? '' : 'Ugyldigt email-format';
  }, [email, emailTouched]);

  const passwordError = useMemo(() => {
    if (!passwordTouched) return '';
    if (!password) return 'Adgangskode er påkrævet';
    const longEnough = password.length >= 8;
    const hasDigit = /\d/.test(password);
    if (!longEnough) return 'Mindst 8 tegn';
    if (!hasDigit) return 'Skal indeholde mindst ét tal';
    return '';
  }, [password, passwordTouched]);

  const formValid = !!email && !!password && !emailError && !passwordError;

  // Supabase session auto-refresh
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  async function handleSignUp() {
    // markér felter som "touched" for at trigge fejlvisning
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!formValid) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign-up error', error.message);
        return;
      }

      if (!data.session) {
        Alert.alert('Verify your email', 'Tjek din mail for bekræftelseslink.');
        // Navigér hvor du vil efter sign-up uden session:
        // router.replace('/(onboarding)');
        return;
      }

      Alert.alert('Velkommen!', 'Konto oprettet og du er logget ind.');
      // router.replace('/(onboarding)');
    } catch (err: any) {
      Alert.alert('Uventet fejl', err?.message ?? 'Prøv igen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: ui.bg }]}>
      {/* Email */}
      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: ui.text }]}>Email</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: emailTouched && emailError ? '#e74c3c' : ui.textMuted,
              backgroundColor: ui.bg,
              color: ui.text,
            },
          ]}
          placeholder="you@example.com"
          placeholderTextColor={ui.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          autoCorrect={false}
        />
        {emailTouched && !!emailError && (
          <Text style={[styles.error, { color: '#e74c3c' }]}>{emailError}</Text>
        )}
      </View>

      {/* Password */}
      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: ui.text }]}>Password</Text>

        <View
          style={[
            styles.pwdRow,
            {
              borderColor: passwordTouched && passwordError ? '#e74c3c' : ui.textMuted,
              backgroundColor: ui.bg,
            },
          ]}
        >
          <TextInput
            style={[styles.pwdInput, { color: ui.text }]}
            placeholder="Mindst 8 tegn, inkl. tal"
            placeholderTextColor={ui.textMuted}
            secureTextEntry={!showPwd}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
          />
          <Pressable onPress={() => setShowPwd((v) => !v)} style={styles.showBtn}>
            <Text style={{ color: ui.primary, fontWeight: '600' }}>
              {showPwd ? 'Skjul' : 'Vis'}
            </Text>
          </Pressable>
        </View>

        {passwordTouched && !!passwordError && (
          <Text style={[styles.error, { color: '#e74c3c' }]}>{passwordError}</Text>
        )}
      </View>

      {/* Submit */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor:
                !formValid || loading ? ui.textMuted ?? '#7fb3d5' : '#ff6b00',
            },
            (!formValid || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSignUp}
          disabled={!formValid || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing up…' : 'Sign up'}
          </Text>
        </Pressable>
      </View>

      {/* Link til sign-in */}
      <View style={styles.verticallySpaced}>
        <Pressable onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>
            Allerede en konto? <Text style={styles.signInText}>Log ind</Text>
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  error: { marginTop: 4, fontSize: 12 },
  pwdRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pwdInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  showBtn: { paddingHorizontal: 8, paddingVertical: 8 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkText: { color: '#666', marginTop: 12, textAlign: 'center' },
  signInText: { color: '#007aff' },
});
