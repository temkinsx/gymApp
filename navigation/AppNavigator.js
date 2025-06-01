import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const StartScreen = React.lazy(() => import('../screens/StartScreen'));
const RegisterCodeScreen = React.lazy(() => import('../screens/RegisterCodeScreen'));
const RegisterNameScreen = React.lazy(() => import('../screens/RegisterNameScreen'));
const RegisterPassportScreen = React.lazy(() => import('../screens/RegisterPassportScreen'));
const HomeScreen = React.lazy(() => import('../screens/HomeScreen'));
const ScheduleScreen = React.lazy(() => import('../screens/ScheduleScreen'));
const ProfileScreen = React.lazy(() => import('../screens/ProfileScreen'));
const PaymentScreen = React.lazy(() => import('../screens/PaymentScreen'));

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ size, focused }) => {
          let iconName;
          let iconColor = focused ? '#4CAF50' : '#000000';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Расписание') iconName = 'calendar';
          else if (route.name === 'Профиль') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#000000',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Расписание" component={ScheduleScreen} />
      <Tab.Screen name="Профиль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Suspense fallback={null}>
                <Stack.Navigator initialRouteName="Start" screenOptions={{ headerTitleAlign: 'center' }}>
                    <Stack.Screen name="Start" component={StartScreen} options={{ title: '' }} />
                    <Stack.Screen name="RegisterCode" component={RegisterCodeScreen} options={{ title: 'Подтверждение' }} />
                    <Stack.Screen name="VerifyCode" component={RegisterCodeScreen} options={{ title: 'Подтверждение' }} />
                    <Stack.Screen name="RegisterName" component={RegisterNameScreen} options={{ title: 'Ваши данные' }} />
                    <Stack.Screen name="RegisterPassport" component={RegisterPassportScreen} options={{ title: 'Паспорт' }} />
                    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                    <Stack.Screen name="Оплата" component={PaymentScreen} options={{ title: 'Оплата' }} />
                </Stack.Navigator>
            </Suspense>
        </NavigationContainer>
    );
}