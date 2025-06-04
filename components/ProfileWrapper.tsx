// components/ProfileWrapper.tsx
import { useThemeContext } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

export default function ProfileWrapper({ children }: { children: React.ReactNode }) {
  const { scheme } = useThemeContext();
  const isDark = scheme === 'dark';

  // State to hold the avatar URL (if any)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the current user on mount
    async function loadAvatar() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Supabase will put the OAuth provider's avatar (or your custom avatar_url)
          // into user.user_metadata.avatar_url or user.user_metadata.picture.
          const urlFromMetadata =
            // @ts-ignore
            (user.user_metadata as any).avatar_url ||
            // @ts-ignore
            (user.user_metadata as any).picture ||
            null;

          setAvatarUrl(urlFromMetadata);
        }
      } catch (error) {
        console.error('Error fetching user avatar:', error);
        setAvatarUrl(null);
      }
    }

    loadAvatar();
  }, []);

  return (
    <View style={[styles.wrapper, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <View style={styles.topBar}>
        <Image
          // If we have an avatarUrl, use it; otherwise fall back to a local default image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require('../assets/images/avatar.jpg')
          }
          style={styles.avatar}
        />
        <Pressable onPress={() => router.push('../settings/notifications')}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={isDark ? '#fff' : '#121212'}
          />
        </Pressable>
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc', // placeholder background while loading
  },
  content: {
    flex: 1,
  },
});