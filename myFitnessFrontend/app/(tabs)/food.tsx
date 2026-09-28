import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PageFrame } from '../../components/page-frame';
import { radii, useAppTheme } from '../../components/workout/theme';

type MealItem = {
  name: string;
  estimatedQuantity: string;
  caloriesMin: number;
  caloriesMax: number;
  proteinMin: number;
  proteinMax: number;
  carbsMin: number;
  carbsMax: number;
  fatMin: number;
  fatMax: number;
  confidence?: number;
};

type MealAnalysis = {
  caloriesMin: number;
  caloriesMax: number;
  proteinMin: number;
  proteinMax: number;
  carbsMin: number;
  carbsMax: number;
  fatMin: number;
  fatMax: number;
  notes?: string[];
  items?: MealItem[];
};

type Meal = {
  id: string;
  image: string | null;
  description: string;
  createdAt: string;
  analysis?: MealAnalysis;
  expanded?: boolean;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  (__DEV__ ? 'http://localhost:3001' : undefined);
const ANALYZE_MEAL_URL = API_BASE_URL
  ? `${API_BASE_URL.replace(/\/$/, '')}/analyze-meal`
  : null;
const MEALS_STORAGE_KEY = 'food_meals_v1';
const GOALS_STORAGE_KEY = 'food_goals_v1';

function clampProgress(value: number) {
  return Math.max(0, Math.min(value, 1));
}

type ProgressBarProps = {
  label: string;
  minValue: number;
  maxValue: number;
  goal: number;
  suffix?: string;
};

function ProgressBar({
  label,
  minValue,
  maxValue,
  goal,
  suffix = '',
}: ProgressBarProps) {
  const { colors } = useAppTheme();
  const minProgress = goal > 0 ? clampProgress(minValue / goal) : 0;
  const maxProgress = goal > 0 ? clampProgress(maxValue / goal) : 0;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: colors.text,
          fontWeight: '700',
          marginBottom: 6,
        }}
      >
        {label}: {minValue}–{maxValue}{suffix} / {goal}{suffix}
      </Text>

      <View
        style={{
          height: 12,
          backgroundColor: colors.borderSoft,
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${maxProgress * 100}%`,
            backgroundColor: colors.accentSoft,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${minProgress * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}

export default function FoodScreen() {
  const { cardShadow, colors } = useAppTheme();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mealMessage, setMealMessage] = useState<{
    message: string;
    tone: 'error' | 'success';
  } | null>(null);

  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [proteinGoal, setProteinGoal] = useState('150');

  useEffect(() => {
    void (async () => {
      try {
        const [storedMeals, storedGoals] = await Promise.all([
          AsyncStorage.getItem(MEALS_STORAGE_KEY),
          AsyncStorage.getItem(GOALS_STORAGE_KEY),
        ]);

        if (storedMeals) {
          const parsedMeals: Meal[] = JSON.parse(storedMeals);
          setMeals(
            parsedMeals.map((meal) => ({
              ...meal,
              expanded: false,
            }))
          );
        }

        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals);
          setCalorieGoal(String(parsedGoals.calorieGoal ?? '2000'));
          setProteinGoal(String(parsedGoals.proteinGoal ?? '150'));
        }
      } catch (error) {
        console.log('Failed to load food data:', error);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const persistMeals = async () => {
      try {
        await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.log('Failed to save meals:', error);
      }
    };

    persistMeals();
  }, [meals, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const persistGoals = async () => {
      try {
        await AsyncStorage.setItem(
          GOALS_STORAGE_KEY,
          JSON.stringify({
            calorieGoal,
            proteinGoal,
          })
        );
      } catch (error) {
        console.log('Failed to save goals:', error);
      }
    };

    persistGoals();
  }, [calorieGoal, proteinGoal, loaded]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow photo access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) return;

    try {
      const pickedUri = result.assets[0].uri;

      const manipulated = await ImageManipulator.manipulateAsync(
        pickedUri,
        [],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setImage(manipulated.uri);
    } catch {
      Alert.alert('Image error', 'Failed to prepare the image.');
    }
  };

  const addMeal = async () => {
    const trimmedDescription = description.trim();

    if (!image && trimmedDescription === '') {
      setMealMessage({
        message: 'Add a description or choose a photo first.',
        tone: 'error',
      });
      return;
    }

    try {
      setIsLoading(true);
      setMealMessage(null);

      let analysis: MealAnalysis | undefined;
      let savedWithoutAnalysis = false;

      if (image && ANALYZE_MEAL_URL) {
        const formData = new FormData();
        formData.append('description', trimmedDescription);

        formData.append('image', {
          uri: image,
          name: 'meal.jpg',
          type: 'image/jpeg',
        } as any);

        const response = await fetch(ANALYZE_MEAL_URL, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to analyze meal');
        }

        const result = await response.json();

        analysis = {
          caloriesMin: Number(result.totals?.calories_min ?? 0),
          caloriesMax: Number(result.totals?.calories_max ?? 0),
          proteinMin: Number(result.totals?.protein_min ?? 0),
          proteinMax: Number(result.totals?.protein_max ?? 0),
          carbsMin: Number(result.totals?.carbs_min ?? 0),
          carbsMax: Number(result.totals?.carbs_max ?? 0),
          fatMin: Number(result.totals?.fat_min ?? 0),
          fatMax: Number(result.totals?.fat_max ?? 0),
          notes: Array.isArray(result.notes) ? result.notes : [],
          items: Array.isArray(result.items)
            ? result.items.map((item: any) => ({
                name: item.name ?? 'Unknown item',
                estimatedQuantity:
                  item.estimated_quantity ?? 'Unknown quantity',
                caloriesMin: Number(item.calories_min ?? 0),
                caloriesMax: Number(item.calories_max ?? 0),
                proteinMin: Number(item.protein_min ?? 0),
                proteinMax: Number(item.protein_max ?? 0),
                carbsMin: Number(item.carbs_min ?? 0),
                carbsMax: Number(item.carbs_max ?? 0),
                fatMin: Number(item.fat_min ?? 0),
                fatMax: Number(item.fat_max ?? 0),
                confidence:
                  item.confidence !== undefined
                    ? Number(item.confidence)
                    : undefined,
              }))
            : [],
        };
      } else if (image) {
        savedWithoutAnalysis = true;
      }

      const newMeal: Meal = {
        id: String(Date.now() + Math.random()),
        image,
        description: trimmedDescription,
        createdAt: new Date().toISOString(),
        analysis,
        expanded: false,
      };

      setMeals((prev) => [newMeal, ...prev]);
      setImage(null);
      setDescription('');
      setMealMessage({
        message: savedWithoutAnalysis
          ? 'Meal saved. Photo analysis will be added when the analysis service is connected.'
          : analysis
            ? 'Meal analyzed and saved.'
            : 'Meal saved.',
        tone: 'success',
      });
    } catch (error: any) {
      setMealMessage({
        message: error?.message || 'Meal analysis failed. Please try again.',
        tone: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  };

  const toggleMealExpanded = (mealId: string) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === mealId ? { ...meal, expanded: !meal.expanded } : meal
      )
    );
  };

  const updateMealAnalysisField = (
    mealId: string,
    field: keyof MealAnalysis,
    value: string
  ) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId || !meal.analysis) return meal;

        return {
          ...meal,
          analysis: {
            ...meal.analysis,
            [field]: Number(value) || 0,
          },
        };
      })
    );
  };

  const todaysMeals = useMemo(() => {
    const today = new Date().toDateString();

    return meals.filter(
      (meal) => new Date(meal.createdAt).toDateString() === today
    );
  }, [meals]);

  const totals = useMemo(() => {
    return todaysMeals.reduce(
      (acc, meal) => {
        if (!meal.analysis) return acc;

        acc.caloriesMin += meal.analysis.caloriesMin;
        acc.caloriesMax += meal.analysis.caloriesMax;
        acc.proteinMin += meal.analysis.proteinMin;
        acc.proteinMax += meal.analysis.proteinMax;
        acc.carbsMin += meal.analysis.carbsMin;
        acc.carbsMax += meal.analysis.carbsMax;
        acc.fatMin += meal.analysis.fatMin;
        acc.fatMax += meal.analysis.fatMax;

        return acc;
      },
      {
        caloriesMin: 0,
        caloriesMax: 0,
        proteinMin: 0,
        proteinMax: 0,
        carbsMin: 0,
        carbsMax: 0,
        fatMin: 0,
        fatMax: 0,
      }
    );
  }, [todaysMeals]);

  const editInputStyle = {
    flex: 1 as const,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.inputBg,
    color: colors.text,
    fontSize: 14,
  };

  const calorieGoalNumber = Number(calorieGoal) || 0;
  const proteinGoalNumber = Number(proteinGoal) || 0;
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <PageFrame>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '800',
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Food Log
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 15,
            marginBottom: 16,
          }}
        >
          {todaysMeals.length} meals today · {meals.length} total logged
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
            ...cardShadow,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 10,
            }}
          >
            Daily Goals
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TextInput
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="numeric"
              placeholder="Calories goal"
              placeholderTextColor={colors.textMuted}
              style={editInputStyle}
            />
            <TextInput
              value={proteinGoal}
              onChangeText={setProteinGoal}
              keyboardType="numeric"
              placeholder="Protein goal"
              placeholderTextColor={colors.textMuted}
              style={editInputStyle}
            />
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Goals save automatically.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.card,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
            ...cardShadow,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 10,
            }}
          >
            Today
          </Text>

          <Text style={{ color: colors.text, marginBottom: 4 }}>
            Carbs: {totals.carbsMin}–{totals.carbsMax} g
          </Text>
          <Text style={{ color: colors.text, marginBottom: 12 }}>
            Fat: {totals.fatMin}–{totals.fatMax} g
          </Text>

          <ProgressBar
            label="Calories"
            minValue={totals.caloriesMin}
            maxValue={totals.caloriesMax}
            goal={calorieGoalNumber}
          />

          <ProgressBar
            label="Protein"
            minValue={totals.proteinMin}
            maxValue={totals.proteinMax}
            goal={proteinGoalNumber}
            suffix=" g"
          />
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
            Add Meal
          </Text>

          <TouchableOpacity
            onPress={pickImage}
            style={{
              backgroundColor: colors.control,
              flexDirection: 'row',
              gap: 8,
              paddingVertical: 12,
              borderRadius: radii.control,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <MaterialIcons
              name="add-photo-alternate"
              size={18}
              color={colors.controlText}
            />
            <Text style={{ color: colors.controlText, fontWeight: '600' }}>
              Choose Photo
            </Text>
          </TouchableOpacity>

          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: '100%',
                height: 180,
                borderRadius: radii.control,
                marginBottom: 12,
              }}
            />
          )}

          <TextInput
            placeholder="Describe your meal in any language..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              if (mealMessage?.tone === 'error') setMealMessage(null);
            }}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: radii.control,
              padding: 12,
              backgroundColor: colors.inputBg,
              color: colors.text,
              marginBottom: 12,
              minHeight: 90,
              textAlignVertical: 'top',
            }}
          />

          <TouchableOpacity
            onPress={addMeal}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Add meal"
            style={{
              backgroundColor: isLoading ? colors.border : colors.primary,
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
              {isLoading ? 'Analyzing...' : 'Add Meal'}
            </Text>
          </TouchableOpacity>

          {mealMessage && (
            <Text
              accessibilityRole={mealMessage.tone === 'error' ? 'alert' : 'text'}
              style={{
                color:
                  mealMessage.tone === 'error'
                    ? colors.dangerText
                    : colors.primary,
                fontSize: 14,
                fontWeight: '700',
                lineHeight: 20,
                marginTop: 10,
              }}
            >
              {mealMessage.message}
            </Text>
          )}
        </View>

        {meals.length === 0 ? (
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
              No meals logged yet
            </Text>
            <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
              Add a meal photo or description to start tracking daily nutrition.
            </Text>
          </View>
        ) : (
          meals.map((meal) => (
            <View
              key={meal.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.card,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
                ...cardShadow,
              }}
            >
              {meal.image && (
                <Image
                  source={{ uri: meal.image }}
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: radii.control,
                    marginBottom: 10,
                  }}
                />
              )}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => toggleMealExpanded(meal.id)}
                  style={{ flex: 1, marginRight: 10 }}
                >
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    {new Date(meal.createdAt).toLocaleString()}
                  </Text>

                  {meal.description !== '' && (
                    <Text
                      style={{
                        color: colors.text,
                        marginBottom: meal.analysis ? 10 : 0,
                      }}
                    >
                      {meal.description}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <TouchableOpacity onPress={() => toggleMealExpanded(meal.id)}>
                    <Text
                      style={{
                        color: colors.primary,
                        fontWeight: '600',
                      }}
                    >
                      {meal.expanded ? 'Done' : 'Edit'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteMeal(meal.id)}>
                    <Text
                      style={{
                        color: colors.dangerText,
                        fontWeight: '600',
                      }}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {meal.analysis && (
                <View
                  style={{
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 6,
                    padding: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      marginBottom: 4,
                      fontWeight: '700',
                    }}
                  >
                    Total
                  </Text>

                  <Text style={{ color: colors.text, marginBottom: 4 }}>
                    Calories: {meal.analysis.caloriesMin}–
                    {meal.analysis.caloriesMax}
                  </Text>
                  <Text style={{ color: colors.text, marginBottom: 4 }}>
                    Protein: {meal.analysis.proteinMin}–
                    {meal.analysis.proteinMax} g
                  </Text>
                  <Text style={{ color: colors.text, marginBottom: 4 }}>
                    Carbs: {meal.analysis.carbsMin}–{meal.analysis.carbsMax} g
                  </Text>
                  <Text style={{ color: colors.text, marginBottom: 8 }}>
                    Fat: {meal.analysis.fatMin}–{meal.analysis.fatMax} g
                  </Text>

                  {meal.expanded && (
                    <View style={{ marginTop: 10 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontWeight: '700',
                          marginBottom: 8,
                        }}
                      >
                        Edit Totals
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <TextInput
                          value={String(meal.analysis.caloriesMin)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(
                              meal.id,
                              'caloriesMin',
                              value
                            )
                          }
                          keyboardType="numeric"
                          placeholder="Calories min"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                        <TextInput
                          value={String(meal.analysis.caloriesMax)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(
                              meal.id,
                              'caloriesMax',
                              value
                            )
                          }
                          keyboardType="numeric"
                          placeholder="Calories max"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <TextInput
                          value={String(meal.analysis.proteinMin)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(meal.id, 'proteinMin', value)
                          }
                          keyboardType="numeric"
                          placeholder="Protein min"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                        <TextInput
                          value={String(meal.analysis.proteinMax)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(meal.id, 'proteinMax', value)
                          }
                          keyboardType="numeric"
                          placeholder="Protein max"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <TextInput
                          value={String(meal.analysis.carbsMin)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(meal.id, 'carbsMin', value)
                          }
                          keyboardType="numeric"
                          placeholder="Carbs min"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                        <TextInput
                          value={String(meal.analysis.carbsMax)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(meal.id, 'carbsMax', value)
                          }
                          keyboardType="numeric"
                          placeholder="Carbs max"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <TextInput
                          value={String(meal.analysis.fatMin)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(meal.id, 'fatMin', value)
                          }
                          keyboardType="numeric"
                          placeholder="Fat min"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                        <TextInput
                          value={String(meal.analysis.fatMax)}
                          onChangeText={(value) =>
                            updateMealAnalysisField(meal.id, 'fatMax', value)
                          }
                          keyboardType="numeric"
                          placeholder="Fat max"
                          placeholderTextColor={colors.textMuted}
                          style={editInputStyle}
                        />
                      </View>
                    </View>
                  )}

                  {meal.analysis.items && meal.analysis.items.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text
                        style={{
                          color: colors.text,
                          marginBottom: 8,
                          fontWeight: '700',
                        }}
                      >
                        Items
                      </Text>

                      {meal.analysis.items.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor: colors.surface,
                            borderRadius: 6,
                            padding: 10,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.text,
                              fontWeight: '600',
                              marginBottom: 4,
                            }}
                          >
                            {item.name}
                          </Text>

                          <Text
                            style={{
                              color: colors.textSecondary,
                              marginBottom: 6,
                            }}
                          >
                            {item.estimatedQuantity}
                          </Text>

                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              marginBottom: 2,
                            }}
                          >
                            Calories: {item.caloriesMin}–{item.caloriesMax}
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              marginBottom: 2,
                            }}
                          >
                            Protein: {item.proteinMin}–{item.proteinMax} g
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                              marginBottom: 2,
                            }}
                          >
                            Carbs: {item.carbsMin}–{item.carbsMax} g
                          </Text>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 13,
                            }}
                          >
                            Fat: {item.fatMin}–{item.fatMax} g
                          </Text>

                          {item.confidence !== undefined && (
                            <Text
                              style={{
                                color: colors.textSecondary,
                                fontSize: 12,
                                marginTop: 6,
                              }}
                            >
                              Confidence: {Math.round(item.confidence * 100)}%
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {meal.analysis.notes?.map((note, index) => (
                    <Text
                      key={index}
                      style={{
                        color: colors.textSecondary,
                        marginTop: 4,
                        fontSize: 13,
                      }}
                    >
                      • {note}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </PageFrame>
    </KeyboardAwareScrollView>
  );
}
