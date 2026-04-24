import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from './constants/colors';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
