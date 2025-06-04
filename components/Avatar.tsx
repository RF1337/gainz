// components/Avatar.tsx
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    Image,
    StyleSheet,
    View
} from 'react-native';
import {
    Asset,
    ImageLibraryOptions,
    launchImageLibrary,
} from 'react-native-image-picker';
import { supabase } from '../lib/supabase';

interface Props {
  size?: number;
  url: string | null;                   // storage path, e.g. "avatars/1633024800000.jpg"
  onUpload: (filePath: string) => void; // new path after upload
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { width: size, height: size };

  // Whenever `url` changes, compute the public URL:
  useEffect(() => {
    if (url) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(url);
      setAvatarUrl(data.publicUrl);
    } else {
      setAvatarUrl(null);
    }
  }, [url]);

  async function uploadAvatar() {
    try {
      setUploading(true);

      // Launch the native image library
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      };

      const result = await new Promise<{ assets?: Asset[]; errorCode?: string }>((resolve) => {
        launchImageLibrary(options, response => {
          resolve(response);
        });
      });

      if (result.errorCode) {
        throw new Error(`ImagePicker Error: ${result.errorCode}`);
      }

      if (!result.assets || result.assets.length === 0) {
        // User cancelled or no image selected
        setUploading(false);
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        throw new Error('Failed to get image URI');
      }

      // Fetch the image as an ArrayBuffer
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      // Determine file extension from URI or default to jpg
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const filePath = `${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage (bucket: "avatars")
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: asset.type ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Notify parent of new path
      onUpload(data.path);
    } catch (error: any) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[avatarSize, styles.avatar]}
        />
      ) : (
        <View style={[avatarSize, styles.noImage]} />
      )}

      <View style={styles.buttonContainer}>
        {uploading ? (
          <ActivityIndicator size="small" color="#ff6b00" />
        ) : (
          <Button title="Upload" onPress={uploadAvatar} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#eee',
  },
  noImage: {
    backgroundColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  buttonContainer: {
    marginTop: 12,
  },
});