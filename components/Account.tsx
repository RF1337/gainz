// components/Account.tsx
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar'; // <-- import your Avatar component

interface Props {
  session: Session;
}

export default function Account({ session }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 1. On mount (or when session changes), fetch profile data
  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session.user) throw new Error('No user on the session!');

      // Fetch username, website, and avatar_url from "profiles" table
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // 2. When Avatar uploads a new image, call this:
  async function handleAvatarUpload(newPath: string) {
    // newPath is the storage path inside the "avatars" bucket, e.g. "1633024800000.jpg"
    setAvatarUrl(newPath);

    // Immediately persist it in your "profiles" table
    await updateProfile({ username, website, avatar_url: newPath });
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);
      if (!session.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      Alert.alert('Profile updated');
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* 3. Render Avatar with size, url, and onUpload */}
      <View style={styles.avatarContainer}>
        <Avatar
          size={120}
          url={avatarUrl}                  // pass the storage path
          onUpload={handleAvatarUpload}    // callback once a new image is uploaded
        />
      </View>

      {/* 4. Email (read-only) */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={session.user.email}
          editable={false}
        />
      </View>

      {/* 5. Username input */}
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* 6. Website input */}
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          value={website}
          onChangeText={setWebsite}
        />
      </View>

      {/* 7. Update button */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Update'}
          </Text>
        </Pressable>
      </View>

      {/* 8. Sign out button */}
      <View style={styles.verticallySpaced}>
        <Pressable
          style={styles.button}
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)'); // send back into auth flow
          }}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, padding: 12, backgroundColor: '#fff' },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  verticallySpaced: { marginVertical: 8 },
  mt20: { marginTop: 20 },
  label: { fontWeight: '600', marginBottom: 4, fontSize: 14, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#ff6b00',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});