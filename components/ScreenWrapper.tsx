import { useTheme } from "@/theme/ThemeProvider";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export default function ScreenWrapper({ children, scroll = true, style }: Props) {
  const insets = useSafeAreaInsets();
  const { ui } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const Container = scroll ? ScrollView : View;

  return (
    <View style={{ backgroundColor: ui.bg, flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <Container
            contentContainerStyle={scroll ? styles.scrollContent : undefined}
            style={[{ flex: 1 }, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            {...(scroll && {
              refreshControl: (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={ui.textMuted}
                />
              ),
            })}
          >
            {children}
          </Container>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});