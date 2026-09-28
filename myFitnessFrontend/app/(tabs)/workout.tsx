import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PageFrame } from '../../components/page-frame';
import DayCard from '../../components/workout/DayCard';
import { radii, useAppTheme } from '../../components/workout/theme';
import { Day, Exercise, SetEntry } from '../../components/workout/types';
const STORAGE_KEY = 'workout_days_v2';

function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
}

export default function WorkoutScreen() {
  const { cardShadow, colors } = useAppTheme();
  const [dayName, setDayName] = useState('');
  const [days, setDays] = useState<Day[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedValue) {
          const parsedDays: Day[] = JSON.parse(storedValue);
          setDays(parsedDays);
        }
      } catch (error) {
        console.log('Failed to load workout data:', error);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const persistDays = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(days));
      } catch (error) {
        console.log('Failed to save workout data:', error);
      }
    };

    persistDays();
  }, [days, loaded]);

  const addDay = () => {
    const trimmed = dayName.trim();
    if (!trimmed) return;

    const newDay: Day = {
      id: String(Date.now() + Math.random()),
      name: trimmed,
      expanded: false,
      exerciseNameInput: '',
      exercises: [],
    };

    setDays((prev) => [...prev, newDay]);
    setDayName('');
  };

  const toggleDay = (dayId: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId ? { ...day, expanded: !day.expanded } : day
      )
    );
  };

  const deleteDay = (dayId: string) => {
    setDays((prev) => prev.filter((day) => day.id !== dayId));
  };

  const moveDayUp = (dayId: string) => {
    setDays((prev) => {
      const index = prev.findIndex((day) => day.id === dayId);
      if (index <= 0) return prev;
      return moveItem(prev, index, index - 1);
    });
  };

  const moveDayDown = (dayId: string) => {
    setDays((prev) => {
      const index = prev.findIndex((day) => day.id === dayId);
      if (index === -1 || index >= prev.length - 1) return prev;
      return moveItem(prev, index, index + 1);
    });
  };

  const updateDayExerciseInput = (dayId: string, value: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId ? { ...day, exerciseNameInput: value } : day
      )
    );
  };

  const addExerciseToDay = (dayId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        const exerciseName = day.exerciseNameInput.trim();
        if (!exerciseName) return day;

        const newExercise: Exercise = {
          id: String(Date.now() + Math.random()),
          name: exerciseName,
          expanded: true,
          sets: [],
        };

        return {
          ...day,
          exercises: [...day.exercises, newExercise],
          exerciseNameInput: '',
        };
      })
    );
  };

  const toggleExerciseExpanded = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? { ...exercise, expanded: !exercise.expanded }
              : exercise
          ),
        };
      })
    );
  };

  const deleteExercise = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.filter(
            (exercise) => exercise.id !== exerciseId
          ),
        };
      })
    );
  };

  const moveExerciseUp = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        const index = day.exercises.findIndex(
          (exercise) => exercise.id === exerciseId
        );
        if (index <= 0) return day;

        return {
          ...day,
          exercises: moveItem(day.exercises, index, index - 1),
        };
      })
    );
  };

  const moveExerciseDown = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        const index = day.exercises.findIndex(
          (exercise) => exercise.id === exerciseId
        );
        if (index === -1 || index >= day.exercises.length - 1) return day;

        return {
          ...day,
          exercises: moveItem(day.exercises, index, index + 1),
        };
      })
    );
  };

  const addSet = (dayId: string, exerciseId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            const newSet: SetEntry = {
              id: String(Date.now() + Math.random()),
              weight: '',
              reps: '',
            };

            return {
              ...exercise,
              sets: [...exercise.sets, newSet],
            };
          }),
        };
      })
    );
  };

  const deleteSet = (dayId: string, exerciseId: string, setId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            return {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            };
          }),
        };
      })
    );
  };

  const moveSetUp = (dayId: string, exerciseId: string, setId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            const index = exercise.sets.findIndex((set) => set.id === setId);
            if (index <= 0) return exercise;

            return {
              ...exercise,
              sets: moveItem(exercise.sets, index, index - 1),
            };
          }),
        };
      })
    );
  };

  const moveSetDown = (dayId: string, exerciseId: string, setId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            const index = exercise.sets.findIndex((set) => set.id === setId);
            if (index === -1 || index >= exercise.sets.length - 1) return exercise;

            return {
              ...exercise,
              sets: moveItem(exercise.sets, index, index + 1),
            };
          }),
        };
      })
    );
  };

  const updateSetField = (
    dayId: string,
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) return exercise;

            return {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            };
          }),
        };
      })
    );
  };

  const summary = useMemo(() => {
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
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <PageFrame maxWidth={1000}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Workout Plan
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 15,
            marginBottom: 16,
          }}
        >
          {days.length} days · {summary.exercises} exercises · {summary.sets} sets
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surfaceTint,
              borderRadius: radii.control,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.controlText, fontWeight: '800' }}>
              {days.length}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 3 }}>
              Days
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.accentSoft,
              borderRadius: radii.control,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.accent, fontWeight: '800' }}>
              {summary.exercises}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 3 }}>
              Exercises
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.amberSoft,
              borderRadius: radii.control,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.amber, fontWeight: '800' }}>
              {summary.sets}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 3 }}>
              Sets
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
            ...cardShadow,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 10,
            }}
          >
            Build Your Week
          </Text>

          <TextInput
            placeholder="Monday, Push Day, Leg Day..."
            placeholderTextColor={colors.textMuted}
            value={dayName}
            onChangeText={setDayName}
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: 6,
              padding: 12,
              backgroundColor: colors.inputBg,
              color: colors.text,
              marginBottom: 12,
            }}
          />

          <TouchableOpacity
            onPress={addDay}
            disabled={dayName.trim() === ''}
            style={{
              backgroundColor:
                dayName.trim() === '' ? colors.border : colors.primary,
              paddingVertical: 14,
              borderRadius: radii.control,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.primaryText,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Add Day
            </Text>
          </TouchableOpacity>
        </View>

        {days.length === 0 ? (
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
                color: colors.text,
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              No workout days yet
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
              Add your first training day to start building a reusable plan.
            </Text>
          </View>
        ) : (
          days.map((day, dayIndex) => (
            <DayCard
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              totalDays={days.length}
              onToggleDay={() => toggleDay(day.id)}
              onDeleteDay={() => deleteDay(day.id)}
              onMoveDayUp={() => moveDayUp(day.id)}
              onMoveDayDown={() => moveDayDown(day.id)}
              onChangeExerciseInput={(value) =>
                updateDayExerciseInput(day.id, value)
              }
              onAddExercise={() => addExerciseToDay(day.id)}
              onMoveExerciseUp={(exerciseId) => moveExerciseUp(day.id, exerciseId)}
              onMoveExerciseDown={(exerciseId) =>
                moveExerciseDown(day.id, exerciseId)
              }
              onDeleteExercise={(exerciseId) => deleteExercise(day.id, exerciseId)}
              onToggleExerciseExpanded={(exerciseId) =>
                toggleExerciseExpanded(day.id, exerciseId)
              }
              onAddSet={(exerciseId) => addSet(day.id, exerciseId)}
              onMoveSetUp={(exerciseId, setId) =>
                moveSetUp(day.id, exerciseId, setId)
              }
              onMoveSetDown={(exerciseId, setId) =>
                moveSetDown(day.id, exerciseId, setId)
              }
              onDeleteSet={(exerciseId, setId) =>
                deleteSet(day.id, exerciseId, setId)
              }
              onChangeWeight={(exerciseId, setId, value) =>
                updateSetField(day.id, exerciseId, setId, 'weight', value)
              }
              onChangeReps={(exerciseId, setId, value) =>
                updateSetField(day.id, exerciseId, setId, 'reps', value)
              }
            />
          ))
        )}
      </PageFrame>
    </KeyboardAwareScrollView>
  );
}
