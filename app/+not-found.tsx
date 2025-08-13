import { usePathname, useRouter } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/theme/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  const router = useRouter();
  const path = usePathname();
  const { ui } = useTheme();

  return (
    <ThemedView
      style={[
        styles.outer,
        {
          backgroundColor: ui.bg,
          padding: 24,
        },
      ]}
      accessibilityRole="alert"
      accessible
    >
      <View style={styles.content}>
        <MaterialIcons
          name="search-off"
          size={64}
          style={{ marginBottom: 12, color: ui?.textMuted ?? '#666' }}
          accessibilityLabel="Not found icon"
        />

        <ThemedText
          type="title"
          style={[styles.title, { color: ui.text }]}
        >
          Oops!
        </ThemedText>

        <ThemedText
          type="default"
          style={[styles.message, { color: ui?.textMuted ?? '#666' }]}
        >
          Something went wrong!
        </ThemedText>

          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={[
              styles.primaryButton,
              { backgroundColor: ui.primary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go to homepage"
          >
            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
              Go to homepage
            </ThemedText>
          </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginTop: 4,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    paddingVertical: 12,
    width: '90%',
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  footer: {
    marginTop: 4,
    textAlign: 'center',
  },
});
