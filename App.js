import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
// IMPORT RNE THEME PROVIDER AND THEMEING UTILITIES
import { Icon, ThemeProvider, createTheme,LinearProgress } from '@rneui/themed';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import IPOScreen from './src/screens/IPOScreen';
import NewsScreen from './src/screens/NewsScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

// Import Context
import { AuthProvider, default as AuthContext } from './src/context/AuthContext';

// --- RNE Theme Configuration ---
// This theme applies a dark mode palette to all RNE components (Icon, Button, Input, etc.)
const customDarkTheme = createTheme({
  mode: 'dark', 
  darkColors: {
    // Primary/Accent color used for active tabs, buttons, etc.
    primary: '#FF8C00', // Deep Orange
    // Background color for the main screen content
    background: '#000000', // Pure Black
    // Background color for cards, headers, or segmented components
    card: '#1C1C1C', 
    // Default text color
    text: '#FFFFFF',
    // Light grey for borders, dividers, inactive states
    grey5: '#333333', 
  },
  components: {
    // Customize specific components globally if needed
    Button: {
      buttonStyle: {
        borderRadius: 8,
      },
    },
  },
});
// -----------------------------


// --- Navigation Setup ---
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

const AppTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        let iconType = 'ionicon'; // Using ionicon for a sleek look
        
        switch (route.name) {
          case 'Home':
            iconName = 'home-outline';
            break;
          case 'IPO':
            iconName = 'rocket-outline';
            break;
          case 'News':
            iconName = 'newspaper-outline';
            break;
          case 'Portfolio':
            iconName = 'briefcase-outline';
            break;
          case 'Profile':
            iconName = 'person-circle-outline';
            break;
          default:
            iconName = 'help-circle-outline';
        }
        // Icon uses the RNE theme setup provided by ThemeProvider
        return <Icon name={iconName} type={iconType} size={size} color={color} />;
      },
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: customDarkTheme.darkColors.primary, // Using theme color
      tabBarInactiveTintColor: 'gray',
      headerStyle: styles.headerStyle,
      headerTintColor: '#fff',
      headerShown: true,
      headerTitleStyle: { fontWeight: 'bold' }
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'TradeMentor' }} />
    <Tab.Screen name="Portfolio" component={PortfolioScreen} />
    <Tab.Screen name="News" component={NewsScreen} />
    <Tab.Screen name="IPO" component={IPOScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: customDarkTheme.darkColors.background } }}>
    <AuthStack.Screen name="Auth" component={AuthScreen} /> 
  </AuthStack.Navigator>
);

const RootNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearProgress color={customDarkTheme.darkColors.primary} />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading user session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};


// --- Main Export: ThemeProvider Wrapper Added ---
export default function App() {
  return (
    // ThemeProvider MUST wrap all components that use RNE elements
    <ThemeProvider theme={customDarkTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}


// --- Global Styles ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStyle: { 
    backgroundColor: '#1C1C1C', 
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBar: {
    backgroundColor: '#1C1C1C', 
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 5,
    paddingTop: 5,
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    position: 'absolute', 
    overflow: 'hidden',
  },
});
