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
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceTint: '#ECFDF5',

  text: '#111827',
  textSecondary: '#5B6472',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderSoft: '#EEF2F7',

  primary: '#0F766E',
  primaryPressed: '#115E59',
  primaryText: '#FFFFFF',

  accent: '#2563EB',
  accentSoft: '#DBEAFE',
  amber: '#F59E0B',
  amberSoft: '#FEF3C7',

  control: '#EEF6F3',
  controlText: '#0F5E56',

  dangerBg: '#FEE2E2',
  dangerText: '#B91C1C',

  inputBg: '#FAFBFC',
  inputBorder: '#D7DCE5',

  progressTrack: '#EEF2F7',
  shadow: 'rgba(15, 23, 42, 0.06)',
};

const darkColors: typeof lightColors = {
  background: '#0B1120',
  surface: '#121A2B',
  surfaceMuted: '#172033',
  surfaceTint: '#0F2E2A',

  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',

  border: '#243044',
  borderSoft: '#1E293B',

  primary: '#2DD4BF',
  primaryPressed: '#5EEAD4',
  primaryText: '#042F2E',

  accent: '#93C5FD',
  accentSoft: '#172554',
  amber: '#FBBF24',
  amberSoft: '#3B2F12',

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
  card: 16,
  control: 12,
  pill: 999,
};

function getCardShadow(colorScheme: ActiveColorScheme) {
  const shadowColor =
    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(15, 23, 42, 0.06)';

  return Platform.select({
    web: {
      boxShadow: `0 8px 18px ${shadowColor}`,
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
