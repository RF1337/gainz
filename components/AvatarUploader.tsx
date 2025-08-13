import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AvatarIcon from './AvatarIcon';

interface Props {
  bucket: string;      // e.g., "user-avatars"
  folderPath: string;  // e.g., user ID, no leading slash
  onUploaded: (fullPath: string) => void;
  size?: number;
}

export default function AvatarUploader({
  bucket,
  folderPath,
  onUploaded,
  size = 100,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const { ui } = useTheme();

  const pickAndUpload = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Camera roll permission is needed to pick an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];

      if (!asset.base64) {
        Alert.alert('Error', 'Failed to retrieve image data.');
        return;
      }

      setLocalUri(asset.uri);
      setUploading(true);

      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const fullPath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, decode(asset.base64), {
          contentType: asset.mimeType || `image/${ext}`,
        });

      if (error) throw error;

      onUploaded(data.path);
    } catch (err: any) {
      console.error('Upload error:', err.message || err);
      Alert.alert('Upload failed', err.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <AvatarIcon size={100} />
      </View>

      <TouchableOpacity
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { color: ui.text }]}>Upload photo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 12,
  },
button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    borderColor: '#333',
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
  },
});