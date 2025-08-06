import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import 'react-native-gesture-handler';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import KentekenCheckScreen from './src/screens/KentekenCheckScreen';
import BpmCheckScreen from './src/screens/BpmCheckScreen';
import BijtellingCheckScreen from './src/screens/BijtellingCheckScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Settings button component for header
const SettingsButton = ({ navigation }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={styles.settingsButton}
      onPress={() => navigation.navigate('Settings')}
    >
      <Text style={[styles.settingsIcon, { color: colors.text }]}>👤</Text>
    </TouchableOpacity>
  );
};

// Tab navigator
const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = '🏠';
          } else if (route.name === 'KentekenCheck') {
            iconName = '🚗';
          } else if (route.name === 'BpmCheck') {
            iconName = '💰';
          } else if (route.name === 'BijtellingCheck') {
            iconName = '📊';
          }
          return <Text style={{ fontSize: size, color }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={({ navigation }) => ({ 
          title: 'Home',
          headerRight: () => <SettingsButton navigation={navigation} />
        })}
      />
      <Tab.Screen 
        name="KentekenCheck" 
        component={KentekenCheckScreen}
        options={({ navigation }) => ({ 
          title: 'Kenteken',
          headerRight: () => <SettingsButton navigation={navigation} />
        })}
      />
      <Tab.Screen 
        name="BpmCheck" 
        component={BpmCheckScreen}
        options={({ navigation }) => ({ 
          title: 'BPM Check',
          headerRight: () => <SettingsButton navigation={navigation} />
        })}
      />
      <Tab.Screen 
        name="BijtellingCheck" 
        component={BijtellingCheckScreen}
        options={({ navigation }) => ({ 
          title: 'Bijtelling',
          headerRight: () => <SettingsButton navigation={navigation} />
        })}
      />
    </Tab.Navigator>
  );
};

// Main app component
const AppContent = () => {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          colors: {
            background: colors.background,
            border: colors.border,
            card: colors.card,
            primary: colors.primary,
            text: colors.text,
          },
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              title: 'Account',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
            }}
          />
        </Stack.Navigator>
        <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

// Root component with theme provider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    marginRight: 15,
    padding: 5,
  },
  settingsIcon: {
    fontSize: 24,
  },
}); 