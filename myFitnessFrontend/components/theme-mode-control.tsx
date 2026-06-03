import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  ThemePreference,
  radii,
  useAppTheme,
} from './workout/theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const options: {
  icon: MaterialIconName;
  label: string;
  value: ThemePreference;
}[] = [
  { value: 'system', label: 'System', icon: 'settings-brightness' },
  { value: 'light', label: 'Light', icon: 'light-mode' },
  { value: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export function ThemeModeControl() {
  const { colors, setThemePreference, themePreference } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.pill,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {options.map((option) => {
        const isActive = themePreference === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} theme`}
            onPress={() => setThemePreference(option.value)}
            style={{
              flex: 1,
              minHeight: 36,
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              backgroundColor: isActive ? colors.primary : 'transparent',
              paddingHorizontal: 10,
            }}
          >
            <MaterialIcons
              name={option.icon}
              size={16}
              color={isActive ? colors.primaryText : colors.textSecondary}
            />
            <Text
              style={{
                color: isActive ? colors.primaryText : colors.textSecondary,
                fontSize: 13,
                fontWeight: '800',
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
