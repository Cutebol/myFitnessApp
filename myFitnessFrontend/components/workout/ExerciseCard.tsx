import { Text, TouchableOpacity, View } from 'react-native';
import IconButton from './IconButton';
import SetRow from './SetRow';
import { useAppTheme } from './theme';
import { Exercise } from './types';

type ExerciseCardProps = {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onToggleExpanded: () => void;
  onAddSet: () => void;
  onMoveSetUp: (setId: string) => void;
  onMoveSetDown: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
  onChangeWeight: (setId: string, value: string) => void;
  onChangeReps: (setId: string, value: string) => void;
};

export default function ExerciseCard({
  exercise,
  exerciseIndex,
  totalExercises,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleExpanded,
  onAddSet,
  onMoveSetUp,
  onMoveSetDown,
  onDeleteSet,
  onChangeWeight,
  onChangeReps,
}: ExerciseCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surfaceMuted,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderSoft,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={onToggleExpanded}
          style={{
            flex: 1,
            marginRight: 10,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: colors.text,
            }}
          >
            {exercise.name}
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
            onPress={onMoveUp}
            disabled={exerciseIndex === 0}
            accessibilityLabel="Move exercise up"
          />
          <IconButton
            icon="keyboard-arrow-down"
            onPress={onMoveDown}
            disabled={exerciseIndex === totalExercises - 1}
            accessibilityLabel="Move exercise down"
          />
          <IconButton
            icon="delete-outline"
            onPress={onDelete}
            variant="danger"
            accessibilityLabel="Delete exercise"
          />
          <IconButton
            icon={exercise.expanded ? 'expand-less' : 'expand-more'}
            onPress={onToggleExpanded}
            accessibilityLabel={
              exercise.expanded ? 'Collapse exercise' : 'Expand exercise'
            }
          />
        </View>
      </View>

      {exercise.expanded && (
        <View style={{ marginTop: 12 }}>
          <TouchableOpacity
            onPress={onAddSet}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: colors.primaryText,
                fontSize: 15,
                fontWeight: '700',
              }}
            >
              Add Set
            </Text>
          </TouchableOpacity>

          {exercise.sets.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>No sets yet.</Text>
          ) : (
            exercise.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                set={set}
                setIndex={setIndex}
                isFirst={setIndex === 0}
                isLast={setIndex === exercise.sets.length - 1}
                onMoveUp={() => onMoveSetUp(set.id)}
                onMoveDown={() => onMoveSetDown(set.id)}
                onDelete={() => onDeleteSet(set.id)}
                onChangeWeight={(value) => onChangeWeight(set.id, value)}
                onChangeReps={(value) => onChangeReps(set.id, value)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}
