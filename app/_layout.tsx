import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { Inter_600SemiBold } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <SafeAreaProvider>
          <BottomSheetModalProvider>
            <ThemeProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="explore-item" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="scanner" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="progress" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="workouts" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false, animation: 'slide_from_left', animationDuration: 200 }} />
              </Stack>
              <ThemedStatusBar />
              <Toast /> {/* 👈 Add Toast at the root level */}
            </ThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}