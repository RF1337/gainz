// report.tsx

import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

/**
 * ReportScreen
 *
 * A simple "Report a Problem" screen template.
 * - Includes a multiline TextInput for the user’s description.
 * - Validates that the report isn’t empty before submitting.
 * - On submit, shows an alert (stub for real submission logic).
 */
const ReportScreen: React.FC = () => {
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Oops!', 'Please describe the issue before submitting.');
      return;
    }

    // Stub: Replace this with your real API call / backend integration
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Thank you!',
        'Your report has been submitted. We’ll look into it as soon as possible.',
      );
      setDescription('');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Report a Problem</Text>

        <Text style={styles.label}>What’s going on?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue here..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    minHeight: 120,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#aaccee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
});
