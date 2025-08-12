import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import KentekenCheckScreen from './src/screens/KentekenCheckScreen';
import RekenhulpScreen from './src/screens/RekenhulpScreen';
import InfohoekScreen from './src/screens/InfohoekScreen';
import BpmCheckScreen from './src/screens/BpmCheckScreen';
import BijtellingCheckScreen from './src/screens/BijtellingCheckScreen';
import VoordeligsteRijdenScreen from './src/screens/VoordeligsteRijdenScreen';
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

// Back button component for header
const BackButton = ({ navigation }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
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
          } else if (route.name === 'Rekenhulp') {
            iconName = '🧮';
          } else if (route.name === 'Infohoek') {
            iconName = '📚';
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
          headerLeft: () => <BackButton navigation={navigation} />,
          headerRight: () => <SettingsButton navigation={navigation} />
        })}
      />
      <Tab.Screen 
        name="Rekenhulp" 
        component={RekenhulpScreen}
        options={({ navigation }) => ({ 
          title: 'Rekenhulp',
          headerLeft: () => <BackButton navigation={navigation} />,
          headerRight: () => <SettingsButton navigation={navigation} />
        })}
      />
      <Tab.Screen 
        name="Infohoek" 
        component={InfohoekScreen}
        options={({ navigation }) => ({ 
          title: 'Infohoek',
          headerLeft: () => <BackButton navigation={navigation} />,
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
          <Stack.Screen 
            name="BpmCheck" 
            component={BpmCheckScreen}
            options={{ 
              title: 'BPM Check',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen 
            name="BijtellingCheck" 
            component={BijtellingCheckScreen}
            options={{ 
              title: 'Bijtelling Check',
              headerStyle: {
                backgroundColor: colors.card,
              },
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen 
            name="VoordeligsteRijden" 
            component={VoordeligsteRijdenScreen}
            options={{ 
              title: 'Voordeligste Rijden',
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
  backButton: {
    marginLeft: 15,
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
  },
}); 