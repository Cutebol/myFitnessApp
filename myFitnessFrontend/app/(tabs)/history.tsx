import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { radii, useAppTheme } from '../../components/workout/theme';
import { Day } from '../../components/workout/types';

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
const WORKOUT_STORAGE_KEY = 'workout_days_v2';

function formatRange(minValue?: number, maxValue?: number, suffix = '') {
  const min = Number(minValue ?? 0);
  const max = Number(maxValue ?? 0);

  if (min === max) return `${min}${suffix}`;
  return `${min}-${max}${suffix}`;
}

export default function HistoryScreen() {
  const { cardShadow, colors } = useAppTheme();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [days, setDays] = useState<Day[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [storedMeals, storedDays] = await Promise.all([
            AsyncStorage.getItem(MEALS_STORAGE_KEY),
            AsyncStorage.getItem(WORKOUT_STORAGE_KEY),
          ]);

          setMeals(storedMeals ? JSON.parse(storedMeals) : []);
          setDays(storedDays ? JSON.parse(storedDays) : []);
        } catch (error) {
          console.log('History load error:', error);
        }
      };

      loadData();
    }, [])
  );

  const recentMeals = useMemo(() => {
    return [...meals]
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      )
      .slice(0, 12);
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 4,
        }}
      >
        History
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 15,
          marginBottom: 16,
        }}
      >
        Recent meals and your saved training structure
      </Text>

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <MaterialIcons name="fitness-center" size={20} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
            Workout Plan
          </Text>
        </View>

        <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
          {days.length} days, {workoutSummary.exercises} exercises,{' '}
          {workoutSummary.sets} sets saved.
        </Text>

        {days.length > 0 && (
          <View style={{ marginTop: 14, gap: 10 }}>
            {days.map((day) => (
              <View
                key={day.id}
                style={{
                  backgroundColor: colors.surfaceMuted,
                  borderRadius: radii.control,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.borderSoft,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: '800',
                    marginBottom: 4,
                  }}
                >
                  {day.name}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {day.exercises.length} exercises
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.card,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          ...cardShadow,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <MaterialIcons name="restaurant" size={20} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
            Meal Log
          </Text>
        </View>

        {recentMeals.length === 0 ? (
          <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
            Meals you add in the Food tab will appear here.
          </Text>
        ) : (
          <View style={{ gap: 10 }}>
            {recentMeals.map((meal) => (
              <View
                key={meal.id}
                style={{
                  paddingBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderSoft,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: '800',
                    marginBottom: 3,
                  }}
                >
                  {meal.description || 'Meal photo'}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  {new Date(meal.createdAt).toLocaleString()}
                </Text>

                {meal.analysis ? (
                  <Text style={{ color: colors.textSecondary }}>
                    {formatRange(
                      meal.analysis.caloriesMin,
                      meal.analysis.caloriesMax
                    )}{' '}
                    cal ·{' '}
                    {formatRange(
                      meal.analysis.proteinMin,
                      meal.analysis.proteinMax,
                      ' g'
                    )}{' '}
                    protein
                  </Text>
                ) : (
                  <Text style={{ color: colors.textSecondary }}>
                    Saved without analysis
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
