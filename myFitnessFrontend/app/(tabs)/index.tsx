import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ThemeModeControl } from '../../components/theme-mode-control';
import { radii, useAppTheme } from '../../components/workout/theme';
import { Day } from '../../components/workout/types';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type Meal = {
  id: string;
  createdAt: string;
  description: string;
  analysis?: {
    caloriesMin: number;
    caloriesMax: number;
    proteinMin: number;
    proteinMax: number;
    carbsMin?: number;
    carbsMax?: number;
    fatMin?: number;
    fatMax?: number;
  };
};

const MEALS_STORAGE_KEY = 'food_meals_v1';
const GOALS_STORAGE_KEY = 'food_goals_v1';
const WORKOUT_STORAGE_KEY = 'workout_days_v2';

function clampProgress(value: number) {
  return Math.max(0, Math.min(value, 1));
}

function formatRange(minValue: number, maxValue: number, suffix = '') {
  if (minValue === maxValue) return `${minValue}${suffix}`;
  return `${minValue}-${maxValue}${suffix}`;
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: MaterialIconName;
  label: string;
  value: string;
  tone: 'green' | 'blue' | 'amber';
}) {
  const { colors } = useAppTheme();
  const toneStyles = {
    green: {
      backgroundColor: colors.surfaceTint,
      borderColor: colors.border,
      iconColor: colors.primary,
    },
    blue: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.border,
      iconColor: colors.accent,
    },
    amber: {
      backgroundColor: colors.amberSoft,
      borderColor: colors.border,
      iconColor: colors.amber,
    },
  }[tone];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: toneStyles.backgroundColor,
        borderRadius: radii.control,
        padding: 12,
        borderWidth: 1,
        borderColor: toneStyles.borderColor,
      }}
    >
      <MaterialIcons name={icon} size={20} color={toneStyles.iconColor} />
      <Text
        style={{
          color: colors.text,
          fontSize: 17,
          fontWeight: '800',
          marginTop: 8,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ProgressBar({
  label,
  minValue,
  maxValue,
  goal,
  suffix = '',
}: {
  label: string;
  minValue: number;
  maxValue: number;
  goal: number;
  suffix?: string;
}) {
  const { colors } = useAppTheme();
  const minProgress = goal > 0 ? clampProgress(minValue / goal) : 0;
  const maxProgress = goal > 0 ? clampProgress(maxValue / goal) : 0;

  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 7,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '800' }}>{label}</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>
          {formatRange(minValue, maxValue, suffix)} / {goal}
          {suffix}
        </Text>
      </View>

      <View
        style={{
          height: 12,
          backgroundColor: colors.borderSoft,
          borderRadius: radii.pill,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: `${maxProgress * 100}%`,
            height: '100%',
            backgroundColor: colors.accentSoft,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: `${minProgress * 100}%`,
            height: '100%',
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { cardShadow, colors } = useAppTheme();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [storedMeals, storedGoals, storedDays] = await Promise.all([
            AsyncStorage.getItem(MEALS_STORAGE_KEY),
            AsyncStorage.getItem(GOALS_STORAGE_KEY),
            AsyncStorage.getItem(WORKOUT_STORAGE_KEY),
          ]);

          setMeals(storedMeals ? JSON.parse(storedMeals) : []);
          setDays(storedDays ? JSON.parse(storedDays) : []);

          if (storedGoals) {
            const goals = JSON.parse(storedGoals);
            setCalorieGoal(Number(goals.calorieGoal) || 2000);
            setProteinGoal(Number(goals.proteinGoal) || 150);
          }
        } catch (error) {
          console.log('Home load error:', error);
        }
      };

      loadData();
    }, [])
  );

  const todaysMeals = useMemo(() => {
    const today = new Date().toDateString();

    return meals.filter(
      (meal) => new Date(meal.createdAt).toDateString() === today
    );
  }, [meals]);

  const latestMeal = useMemo(() => {
    return [...meals].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    )[0];
  }, [meals]);

  const workoutSummary = useMemo(() => {
    return days.reduce(
      (acc, day) => {
        acc.exercises += day.exercises.length;
        acc.sets += day.exercises.reduce(
          (setCount, exercise) => setCount + exercise.sets.length,
          0
        );
        return acc;
      },
      { exercises: 0, sets: 0 }
    );
  }, [days]);

  const nextWorkout = days.find((day) => day.exercises.length > 0) || days[0];

  const totals = useMemo(() => {
    return todaysMeals.reduce(
      (acc, meal) => {
        if (!meal.analysis) return acc;

        acc.caloriesMin += meal.analysis.caloriesMin;
        acc.caloriesMax += meal.analysis.caloriesMax;
        acc.proteinMin += meal.analysis.proteinMin;
        acc.proteinMax += meal.analysis.proteinMax;

        return acc;
      },
      {
        caloriesMin: 0,
        caloriesMax: 0,
        proteinMin: 0,
        proteinMax: 0,
      }
    );
  }, [todaysMeals]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          fontWeight: '700',
          marginBottom: 4,
        }}
      >
        {new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      <Text
        style={{
          fontSize: 32,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 16,
        }}
      >
        Today
      </Text>

      <View style={{ marginBottom: 16 }}>
        <ThemeModeControl />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <MetricCard
          icon="restaurant"
          label="Meals"
          value={String(todaysMeals.length)}
          tone="green"
        />
        <MetricCard
          icon="local-fire-department"
          label="Calories"
          value={formatRange(totals.caloriesMin, totals.caloriesMax)}
          tone="amber"
        />
        <MetricCard
          icon="fitness-center"
          label="Exercises"
          value={String(workoutSummary.exercises)}
          tone="blue"
        />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          ...cardShadow,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Nutrition Progress
        </Text>

        <ProgressBar
          label="Calories"
          minValue={totals.caloriesMin}
          maxValue={totals.caloriesMax}
          goal={calorieGoal}
        />

        <ProgressBar
          label="Protein"
          minValue={totals.proteinMin}
          maxValue={totals.proteinMax}
          goal={proteinGoal}
          suffix=" g"
        />

        {todaysMeals.length === 0 && (
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
            Log a meal in the Food tab to see today fill in.
          </Text>
        )}
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
          ...cardShadow,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Training Plan
        </Text>

        {nextWorkout ? (
          <>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 6,
              }}
            >
              {nextWorkout.name}
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
              {days.length} days planned with {workoutSummary.exercises}{' '}
              exercises and {workoutSummary.sets} sets.
            </Text>
          </>
        ) : (
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
            Add your first workout day to make the dashboard useful.
          </Text>
        )}
      </View>

      {latestMeal && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontWeight: '700',
              marginBottom: 5,
            }}
          >
            Latest Meal
          </Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
            {latestMeal.description || 'Meal photo'}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            {new Date(latestMeal.createdAt).toLocaleString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
