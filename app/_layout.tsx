import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { ProfilesProvider } from "@/lib/profiles-context";
import { AppProvider } from "@/lib/app-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { FocusProvider } from "@/lib/tv-focus/focus-manager";

// Do not let the native splash get stuck forever. If any asset/provider is slow,
// the app still shows the first screen instead of sitting on the 3-button logo.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppProvider>
            <ProfilesProvider>
              <FocusProvider>
                <Stack screenOptions={{ headerShown: false, animation: Platform.isTV ? "none" : "fade" }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="loved-one/[profileId]" />
                  <Stack.Screen name="action/choice" options={{ presentation: "modal" }} />
                  <Stack.Screen name="caregiver" />
                </Stack>
                <StatusBar hidden />
              </FocusProvider>
            </ProfilesProvider>
          </AppProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
