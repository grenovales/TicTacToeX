/**
 * Layout component for the app
 */
import '@styles/global.css';

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NAV_THEME } from '@lib/constants';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
// Catch any errors thrown by the Layout component.
ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
 

  return (
    <ThemeProvider value={LIGHT_THEME}>
      <StatusBar style={'light'} />
      <Stack />
    </ThemeProvider>
  );
}