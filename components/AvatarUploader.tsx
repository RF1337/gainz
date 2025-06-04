// components/AvatarUploader.tsx
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  bucket: string; // e.g. "profile_avatars"
  folderPath: string; // e.g. the user’s ID or “public/…”
  onUploaded: (fullPath: string) => void;
  size?: number;
}

export default function AvatarUploader({ bucket, folderPath, onUploaded, size = 100 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const pickAndUpload = async () => {
    try {
      // 1. Ask for permission (if needed)
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera roll permission is needed to pick an image.');
        return;
      }

      // 2. Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      // 3. We have result.assets[0].uri (e.g. "file:///…/IMG_1234.jpg")
      setLocalUri(result.assets[0].uri);

      // 4. Convert URI → Blob (or ArrayBuffer)
      setUploading(true);
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      // 5. Derive a filename & path in your bucket
      //    For example: `${folderPath}/${Date.now()}.jpg`
      const ext = result.assets[0].uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const pathInBucket = `${folderPath}/${fileName}`;

      // 6. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(pathInBucket, blob, {
          contentType: blob.type,
        });

      if (uploadError) throw uploadError;

      // 7. Success! Return the full path to parent
      onUploaded(data.path);
    } catch (err: any) {
      console.log('Upload error:', err.message || err);
      Alert.alert('Upload failed', err.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/*  If localUri is set, preview it; otherwise show placeholder */}
      {localUri ? (
        <Image
          source={{ uri: localUri }}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatarPlaceholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={styles.plus}>＋</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 12,
    backgroundColor: '#ccc',
  },
  avatarPlaceholder: {
    marginBottom: 12,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});