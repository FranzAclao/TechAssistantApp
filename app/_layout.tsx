import React, { useEffect, useMemo } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from './constants/colors';
import { AuthProvider, useAuth } from './context/AuthContext';

export const unstable_settings = {
  anchor: 'index',
};

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading: authLoading } = useAuth();
  const isChecking = authLoading;

  const routeKey = useMemo(() => segments.join('/'), [segments]);
  const inTabs = segments[0] === '(tabs)';
  const inAuth = segments[0] === 'screens' && segments[1] === 'auth';
  const inAppScreens = segments[0] === 'screens' && segments[1] !== 'auth';
  const inIndex = segments.length === 0 || segments[0] === 'index';

  useEffect(() => {
    if (isChecking) return;

    if (session) {
      // Allow authenticated users to stay in tabs or navigate to the check-in flow screens.
      if (!inTabs && !inAppScreens) router.replace('/(tabs)/dashboard');
      return;
    }

    // If not authenticated, only allow auth screens.
    if (!inAuth && !inIndex) router.replace('/screens/auth/LoginScreen');
  }, [inAppScreens, inAuth, inIndex, inTabs, isChecking, routeKey, router, session]);

  if (isChecking) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="screens/HomeScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="screens/QuestionsScreen"
        options={{
          title: 'Follow-up Questions',
          headerBackTitle: 'Back',
          headerTintColor: COLORS.PRIMARY,
        }}
      />
      <Stack.Screen
        name="screens/DiagnosisScreen"
        options={{
          title: 'Your Advice',
          headerBackTitle: 'Back',
          headerTintColor: COLORS.PRIMARY,
        }}
      />

      <Stack.Screen name="screens/auth/LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/auth/SignUpScreen" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
});
