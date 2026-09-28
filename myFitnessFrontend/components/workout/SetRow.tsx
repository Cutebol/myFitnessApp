import { Text, TextInput, View } from 'react-native';
import IconButton from './IconButton';
import { useAppTheme } from './theme';
import { SetEntry } from './types';

type SetRowProps = {
  set: SetEntry;
  setIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChangeWeight: (value: string) => void;
  onChangeReps: (value: string) => void;
};

export default function SetRow({
  set,
  setIndex,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChangeWeight,
  onChangeReps,
}: SetRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        marginBottom: 10,
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderSoft,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: colors.text,
          }}
        >
          Set {setIndex + 1}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 6,
          }}
        >
          <IconButton
            icon="keyboard-arrow-up"
            onPress={onMoveUp}
            disabled={isFirst}
            accessibilityLabel="Move set up"
          />
          <IconButton
            icon="keyboard-arrow-down"
            onPress={onMoveDown}
            disabled={isLast}
            accessibilityLabel="Move set down"
          />
          <IconButton
            icon="delete-outline"
            onPress={onDelete}
            variant="danger"
            accessibilityLabel="Delete set"
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <TextInput
          placeholder="Weight"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={set.weight}
          onChangeText={onChangeWeight}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 6,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: colors.inputBg,
            color: colors.text,
            fontSize: 14,
          }}
        />

        <TextInput
          placeholder="Reps"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={set.reps}
          onChangeText={onChangeReps}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 6,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: colors.inputBg,
            color: colors.text,
            fontSize: 14,
          }}
        />
      </View>
    </View>
  );
}
