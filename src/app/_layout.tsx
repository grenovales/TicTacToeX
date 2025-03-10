/**
 * Layout component for the app
 */
import '@styles/global.css';

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NAV_THEME } from '@lib/constants';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

//TODO: Add dark theme
/*
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};*/

export {
// Catch any errors thrown by the Layout component.
ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  return (
    <ThemeProvider value={LIGHT_THEME}>
      <StatusBar style={'light'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'TicTacToeX',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                className="mr-4"
                accessibilityLabel="Settings"
                accessibilityRole="button"
              >
                <Ionicons name="settings-outline" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal'
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}