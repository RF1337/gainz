import { HealthDataProvider } from '@/providers/HealthDataProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { Inter_600SemiBold } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from 'expo-font';
import * as QuickActions from "expo-quick-actions";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message'; // 👈 Import Toast

function isColorDark(hsla: string) {
  const lightness = parseFloat(hsla.split(',')[2]); // h, s, l%, a
  return lightness < 50; // mindre end 50% lys = mørk baggrund
}

function ThemedStatusBar() {
  const { ui } = useTheme();
  const darkBg = isColorDark(ui.bg);

  return (
    <StatusBar
      style={darkBg ? 'light' : 'dark'} // skifter ikonfarve
      backgroundColor={ui.bg}           // baggrundsfarve (Android)
    />
  );
}


export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_600SemiBold,
  });

  useEffect(() => {
    QuickActions.setItems([
      {
        id: "1",
        title: "Wait! Don't leave me!",
        subtitle: "We're here to help",
        icon: "love"
      },
      {
        id: "2",
        title: "Log Workout",
        subtitle: "Track your training",
        icon: "update"
      },
      {
        id: "3",
        title: "Log Food",
        subtitle: "Track your meals",
        icon: "task"
      },
      {
        id: "4",
        title: "Reminders",
        subtitle: "Stay on track",
        icon: "alarm"
      }
    ]);
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <ThemeProvider>
            <HealthDataProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="explore-item" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="scanner" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="progress" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="sleep" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="steps" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="workouts" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              <Stack.Screen name="+not-found" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
            </Stack>
            </HealthDataProvider>
            <ThemedStatusBar />
            <Toast />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}