import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useAppTheme } from './theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type IconButtonProps = {
  icon?: MaterialIconName;
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  style?: ViewStyle;
};

export default function IconButton({
  icon,
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
  variant = 'default',
  style,
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const backgroundColor =
    variant === 'danger'
      ? disabled
        ? colors.surfaceMuted
        : colors.dangerBg
      : disabled
      ? colors.surfaceMuted
      : colors.control;

  const textColor =
    variant === 'danger'
      ? disabled
        ? colors.textMuted
        : colors.dangerText
      : disabled
      ? colors.textMuted
      : colors.controlText;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={[
        {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
        },
        style,
      ]}
    >
      {icon ? (
        <MaterialIcons name={icon} size={19} color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
