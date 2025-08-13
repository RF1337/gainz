import AvatarUploader from '@/components/AvatarUploader';
import BackButton from '@/components/BackButton';
import Header from '@/components/Header';
import ScreenWrapper from '@/components/ScreenWrapper';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const Profile: React.FC = () => {
  const { ui } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return;
      }
      setUserId(data.user?.id ?? null);
    };
    fetchUserId();
  }, []);

  const loadProfile = useCallback(
    async (uid: string) => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `display_name, username, first_name, last_name, height_cm, weight_kg, gender, date_of_birth, avatar_url`
        )
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No rows" in some setups; treat missing profile as empty
        console.warn('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile.'); 
      }

      if (data) {
        setDisplayName(data.display_name || '');
        setUsername(data.username || '');
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setHeight(data.height_cm != null ? String(data.height_cm) : '');
        setWeight(data.weight_kg != null ? String(data.weight_kg) : '');
        setGender(data.gender || '');
        setDateOfBirth(data.date_of_birth || '');
        setAvatarUri(data.avatar_url || null);
      }

      setLoadingProfile(false);
    },
    []
  );

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'No user ID available.');
      return;
    }
    if (saving) return; // prevent double submit
    setSaving(true);

    const updates: Record<string, any> = {
      id: userId,
      display_name: displayName || null,
      username: username || null,
      first_name: firstName || null,
      last_name: lastName || null,
      height_cm: height ? Number(height) : null,
      weight_kg: weight ? Number(weight) : null,
      gender: gender || null,
      date_of_birth: dateOfBirth || null,
      avatar_url: avatarUri || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Profile update failed',
        text2: error.message,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Profile updated',
        text2: 'Your changes have been saved.',
      });
    }
    setSaving(false);
  };

  const handleChoosePhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7 },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          setAvatarUri(response.assets[0].uri || null);
        }
      }
    );
  };

  // If profile is loading show spinner overlay
  if (loadingProfile) {
    return (
      <ScreenWrapper>
        <Header
          leftIcon={<BackButton />}
          title="Profile"
          rightIcon={<View style={{ width: 60 }} />} // placeholder to align
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, color: ui.textMuted }}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        leftIcon={<BackButton />}
        title="Profile"
        rightIcon={
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={{ fontSize: 18, color: ui.text, fontWeight: '500' }}>
              Save
            </Text>
          </TouchableOpacity>
        }
      />
      <AvatarUploader bucket='user-avatars' folderPath={userId as any} onUploaded={setAvatarUri} />

      <View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: ui.textMuted }]}>Display Name</Text>
          <TextInput
            style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display Name"
            placeholderTextColor={ui.placeholder}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: ui.textMuted }]}>Username</Text>
          <TextInput
            style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={ui.placeholder}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>First name</Text>
            <TextInput
              style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={ui.placeholder}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>Last name</Text>
            <TextInput
              style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={ui.placeholder}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>Height</Text>
            <TextInput
              style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
              value={height}
              onChangeText={setHeight}
              placeholder="Height (cm)"
              placeholderTextColor={ui.placeholder}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>Weight</Text>
            <TextInput
              style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="Weight (kg)"
              placeholderTextColor={ui.placeholder}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>Gender</Text>
            <TextInput
              style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
              value={gender}
              onChangeText={setGender}
              placeholder="Gender"
              placeholderTextColor={ui.placeholder}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: ui.textMuted }]}>Date of Birth</Text>
            <TextInput
              style={[styles.input, { borderColor: ui.border,  color: ui.text }]}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={ui.placeholder}
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    borderColor: '#333',
    borderWidth: 1,
  },
  deleteButton: {
    // Variant styling if desired
  },
  buttonText: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  field: {
    flex: 1,
    marginBottom: 15,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    alignItems: 'center',
    marginTop: 10,
  },
});

export default Profile;
