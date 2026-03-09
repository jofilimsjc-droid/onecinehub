import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { COLORS, GRADIENTS, SHADOWS, SIZES } from './src/theme';

// Re-export for backward compatibility with any existing imports
export { COLORS, GRADIENTS, SHADOWS, SIZES };

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import BookingScreen from './src/screens/BookingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import type { MainTabParamList, RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: '#333',
  },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000', borderTopColor: '#222', height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarActiveTintColor: '#e50914',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎬</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? <Stack.Screen name="Main" component={MainStack} /> : <Stack.Screen name="Auth" component={AuthStack} />}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

