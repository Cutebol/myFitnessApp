import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = 'app_theme_preference_v1';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ActiveColorScheme = 'light' | 'dark';

const lightColors = {
  background: '#F5F7F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F4',
  surfaceTint: '#E7F5F1',

  text: '#111827',
  textSecondary: '#5B6472',
  textMuted: '#94A3B8',

  border: '#DDE3E5',
  borderSoft: '#E9EDEF',

  primary: '#0F766E',
  primaryPressed: '#115E59',
  primaryText: '#FFFFFF',

  accent: '#315A8A',
  accentSoft: '#E5EEF7',
  amber: '#B7791F',
  amberSoft: '#FAF0D8',

  control: '#EEF6F3',
  controlText: '#0F5E56',

  dangerBg: '#FEE2E2',
  dangerText: '#B91C1C',

  inputBg: '#FAFBFC',
  inputBorder: '#D7DCE5',

  progressTrack: '#EEF2F7',
  shadow: 'rgba(20, 38, 46, 0.05)',
};

const darkColors: typeof lightColors = {
  background: '#101617',
  surface: '#172022',
  surfaceMuted: '#1E292B',
  surfaceTint: '#12332E',

  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',

  border: '#2D3A3D',
  borderSoft: '#253235',

  primary: '#2DD4BF',
  primaryPressed: '#5EEAD4',
  primaryText: '#042F2E',

  accent: '#9ABCE0',
  accentSoft: '#203248',
  amber: '#E6B85C',
  amberSoft: '#3A301D',

  control: '#153633',
  controlText: '#99F6E4',

  dangerBg: '#3B121A',
  dangerText: '#FCA5A5',

  inputBg: '#0F172A',
  inputBorder: '#334155',

  progressTrack: '#1E293B',
  shadow: 'rgba(0, 0, 0, 0.28)',
};

export type AppColors = typeof lightColors;

export const colors = lightColors;

export const radii = {
  card: 8,
  control: 6,
  pill: 999,
};

function getCardShadow(colorScheme: ActiveColorScheme) {
  const shadowColor =
    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(15, 23, 42, 0.06)';

  return Platform.select({
    web: {
      boxShadow: `0 5px 14px ${shadowColor}`,
    },
    default: {
      shadowColor: colorScheme === 'dark' ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: colorScheme === 'dark' ? 0.28 : 0.06,
      shadowRadius: 18,
      elevation: 2,
    },
  });
}

export const cardShadow = getCardShadow('light');

type AppThemeContextValue = {
  cardShadow: ReturnType<typeof getCardShadow>;
  colorScheme: ActiveColorScheme;
  colors: AppColors;
  isDark: boolean;
  setThemePreference: (preference: ThemePreference) => void;
  themePreference: ThemePreference;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>('system');

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          storedPreference === 'system' ||
          storedPreference === 'light' ||
          storedPreference === 'dark'
        ) {
          setThemePreferenceState(storedPreference);
        }
      } catch (error) {
        console.log('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    AsyncStorage.setItem(THEME_STORAGE_KEY, preference).catch((error) => {
      console.log('Failed to save theme preference:', error);
    });
  }, []);

  const colorScheme: ActiveColorScheme =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  const value = useMemo(
    () => ({
      cardShadow: getCardShadow(colorScheme),
      colorScheme,
      colors: colorScheme === 'dark' ? darkColors : lightColors,
      isDark: colorScheme === 'dark',
      setThemePreference,
      themePreference,
    }),
    [colorScheme, setThemePreference, themePreference]
  );

  return createElement(AppThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
}
