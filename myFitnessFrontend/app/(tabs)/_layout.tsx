import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../../components/workout/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  return (
    <Tabs
      screenOptions={{
        headerShown: isDesktop,
        headerTitle: 'MY FITNESS',
        headerTitleStyle: {
          color: colors.text,
          fontSize: 15,
          fontWeight: '900',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
        headerShadowVisible: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarLabelPosition: 'below-icon',
        tabBarVariant: isDesktop ? 'material' : 'uikit',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarActiveBackgroundColor: isDesktop ? colors.control : 'transparent',
        tabBarLabelStyle: {
          fontSize: isDesktop ? 14 : 12,
          fontWeight: '800',
        },
        tabBarItemStyle: isDesktop
          ? {
              minHeight: 52,
              maxHeight: 68,
              marginHorizontal: 8,
              marginVertical: 4,
              borderRadius: 6,
            }
          : undefined,
        tabBarStyle: isDesktop
          ? {
              width: 128,
              paddingTop: 18,
              borderRightColor: colors.border,
              backgroundColor: colors.surface,
            }
          : {
              height: 72,
              paddingTop: 8,
              paddingBottom: 14,
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="fitness-center" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
