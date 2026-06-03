import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import ExerciseCard from './ExerciseCard';
import IconButton from './IconButton';
import { useAppTheme } from './theme';
import { Day } from './types';

type DayCardProps = {
  day: Day;
  dayIndex: number;
  totalDays: number;
  onToggleDay: () => void;
  onDeleteDay: () => void;
  onMoveDayUp: () => void;
  onMoveDayDown: () => void;
  onChangeExerciseInput: (value: string) => void;
  onAddExercise: () => void;
  onMoveExerciseUp: (exerciseId: string) => void;
  onMoveExerciseDown: (exerciseId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onToggleExerciseExpanded: (exerciseId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onMoveSetUp: (exerciseId: string, setId: string) => void;
  onMoveSetDown: (exerciseId: string, setId: string) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onChangeWeight: (exerciseId: string, setId: string, value: string) => void;
  onChangeReps: (exerciseId: string, setId: string, value: string) => void;
};

export default function DayCard({
  day,
  dayIndex,
  totalDays,
  onToggleDay,
  onDeleteDay,
  onMoveDayUp,
  onMoveDayDown,
  onChangeExerciseInput,
  onAddExercise,
  onMoveExerciseUp,
  onMoveExerciseDown,
  onDeleteExercise,
  onToggleExerciseExpanded,
  onAddSet,
  onMoveSetUp,
  onMoveSetDown,
  onDeleteSet,
  onChangeWeight,
  onChangeReps,
}: DayCardProps) {
  const { cardShadow, colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        ...cardShadow,
      }}
    >
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={onToggleDay}
            style={{
              flex: 1,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              {day.name}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              gap: 6,
            }}
          >
            <IconButton
              icon="keyboard-arrow-up"
              onPress={onMoveDayUp}
              disabled={dayIndex === 0}
              accessibilityLabel="Move day up"
            />
            <IconButton
              icon="keyboard-arrow-down"
              onPress={onMoveDayDown}
              disabled={dayIndex === totalDays - 1}
              accessibilityLabel="Move day down"
            />
            <IconButton
              icon="delete-outline"
              onPress={onDeleteDay}
              variant="danger"
              accessibilityLabel="Delete day"
            />
            <IconButton
              icon={day.expanded ? 'expand-less' : 'expand-more'}
              onPress={onToggleDay}
              accessibilityLabel={day.expanded ? 'Collapse day' : 'Expand day'}
            />
          </View>
        </View>
      </View>

      {day.expanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: colors.borderSoft,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: colors.text,
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            Add Exercise
          </Text>

          <TextInput
            placeholder="Bench Press, Squat, Pull-up..."
            placeholderTextColor={colors.textMuted}
            value={day.exerciseNameInput}
            onChangeText={onChangeExerciseInput}
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.inputBg,
              color: colors.text,
              marginBottom: 12,
            }}
          />

          <TouchableOpacity
            onPress={onAddExercise}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: colors.primaryText,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Add Exercise
            </Text>
          </TouchableOpacity>

          {day.exercises.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              No exercises added for this day yet.
            </Text>
          ) : (
            day.exercises.map((exercise, exerciseIndex) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                totalExercises={day.exercises.length}
                onMoveUp={() => onMoveExerciseUp(exercise.id)}
                onMoveDown={() => onMoveExerciseDown(exercise.id)}
                onDelete={() => onDeleteExercise(exercise.id)}
                onToggleExpanded={() => onToggleExerciseExpanded(exercise.id)}
                onAddSet={() => onAddSet(exercise.id)}
                onMoveSetUp={(setId) => onMoveSetUp(exercise.id, setId)}
                onMoveSetDown={(setId) => onMoveSetDown(exercise.id, setId)}
                onDeleteSet={(setId) => onDeleteSet(exercise.id, setId)}
                onChangeWeight={(setId, value) =>
                  onChangeWeight(exercise.id, setId, value)
                }
                onChangeReps={(setId, value) =>
                  onChangeReps(exercise.id, setId, value)
                }
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}
