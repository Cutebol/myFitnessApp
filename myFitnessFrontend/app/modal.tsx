import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { ThemeModeControl } from '../components/theme-mode-control';
import { radii, useAppTheme } from '../components/workout/theme';

export default function ModalScreen() {
  const { cardShadow, colors } = useAppTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
          ...cardShadow,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            backgroundColor: colors.surfaceTint,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <MaterialIcons name="fitness-center" size={28} color={colors.primary} />
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 28,
            fontWeight: '800',
            marginBottom: 8,
          }}
        >
          My Fitness
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 16,
            lineHeight: 24,
            marginBottom: 18,
          }}
        >
          A focused workout planner and meal tracker with photo-based nutrition
          estimates, daily goals, and local history.
        </Text>

        <ThemeModeControl />

        <Link href="/" dismissTo style={{ marginTop: 18 }}>
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: '800',
            }}
          >
            Back to today
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
