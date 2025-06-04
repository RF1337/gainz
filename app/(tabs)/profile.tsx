// app/(tabs)/settings/profile.tsx
import AvatarUploader from '@/components/AvatarUploader';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 1. On mount, fetch current session & profile
  useEffect(() => {
    async function getSessionAndProfile() {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        Alert.alert('Error', sessionError.message);
        return;
      }
      if (!currentSession) {
        router.replace('/(auth)');
        return;
      }

      setSession(currentSession);

      // fetch profile row
      const { data, error: fetchError, status } = await supabase
        .from('profile')
        .select('display_name, avatar_url')
        .eq('id', currentSession.user.id)
        .single();

      if (fetchError && status !== 406) {
        Alert.alert('Error', fetchError.message);
      } else if (data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    }

    getSessionAndProfile();

    // listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!newSession) {
        router.replace('/(auth)');
      } else {
        setSession(newSession);
        fetchProfile(newSession);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch profile helper
  async function fetchProfile(currentSession: Session) {
    try {
      setLoading(true);
      const userId = currentSession.user.id;
      const { data, error, status } = await supabase
        .from('profile')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .single();

      if (error && status !== 406) throw error;
      if (data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. Upsert displayName + avatar_url
  async function updateProfile({
    display_name,
    avatar_url,
  }: {
    display_name: string;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        display_name,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profile').upsert(updates);
      if (error) throw error;
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  // 4. Callback for when AvatarUploader returns the new path
  function handleAvatarUpload(path: string) {
    setAvatarUrl(path);
    updateProfile({ display_name: displayName, avatar_url: path });
  }

  // 5. Sign out handler
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)');
  }

  // 6. Navigate to the settings “index” screen
  function goToSettings() {
    // Because your file is at app/(tabs)/settings/index.tsx,
    // the correct path to push is "/settings"
    router.push('/settings');
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ─── Top Bar with “Settings” cog button ───────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Pressable onPress={goToSettings} style={styles.cogButton}>
          <Ionicons name="settings-outline" size={28} color="#333" />
        </Pressable>
      </View>

      {/* ─── Avatar Uploader ───────────────────────────────────────────────── */}
      <View style={styles.avatarContainer}>
        <AvatarUploader
          bucket="user-avatars"
          folderPath={session!.user.id}
          onUploaded={handleAvatarUpload}
          size={120}
        />
      </View>

      {/* ─── Email (read-only) ──────────────────────────────────────────────── */}
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0', color: '#888' }]}
          value={session!.user.email}
          editable={false}
        />
      </View>

      {/* ─── Display Name ───────────────────────────────────────────────────── */}
      <View style={styles.field}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter a display name"
          autoCapitalize="none"
        />
      </View>

      {/* ─── Update Profile Button ──────────────────────────────────────────── */}
      <View style={[styles.field, styles.mt20]}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() =>
            updateProfile({ display_name: displayName, avatar_url: avatarUrl })
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Text>
        </Pressable>
      </View>

      {/* ─── Sign Out Button ────────────────────────────────────────────────── */}
      <View style={styles.field}>
        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 32, // space for status bar
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  cogButton: {
    padding: 8, // increase touch area
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  mt20: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#ff6b00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});