import {
    SafeAreaView,
    Text,
    ViewStyle,
} from 'react-native';
import { Avatar, useTheme } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { HomeStackNavigator } from '../navigation/HomeStackNavigator';
import { ProfileStackNavigator } from '../navigation/ProfileStackNavigator';
import { useAuth } from '../context/AuthContext';
import { TabNavigatorParamList } from '../types/navigationTypes';
import { showFooterState } from '../atoms/showFooterAtom';
import { WorkoutsStackNavigator } from '../navigation/WorkoutsStackNavigator';
import { useUserInfo } from '../hooks/useUserInfo';
import { AuthStackNavigator } from '../navigation/AuthStackNavigator';
import { SignUpWizardStackNavigator } from '../navigation/SignUpWizardStackNavigator';
import { wizardTodoState } from '../atoms/wizardTodoAtom';

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

const HomeIcon = ({ color, size }): JSX.Element => <Ionicons color={color} name="home-outline" size={size} />;
const TimerIcon = ({ color, size }): JSX.Element => <Ionicons color={color} name="timer-outline" size={size} />;

const ProfileTabIcon = ({ focused, color, size }): JSX.Element => {
    const { authState } = useAuth();
    const { data } = useUserInfo(authState.userId);
    const profilePictureUrl = data?.profilePictureUrl;

    if (profilePictureUrl) {
        return (
            <Avatar
                borderColor={focused ? 'flame' : 'white'}
                borderWidth={2}
                size="sm"
                source={{
                    uri: profilePictureUrl,
                }}
            />
        );
    }
    // Fallback icon if no profile picture is available
    return <Ionicons color={color} name="person-circle-outline" size={size} />;
};

export const Routes = (): JSX.Element => {
    const showFooter = useRecoilValue(showFooterState);
    const { authState } = useAuth();
    const wizardTodo = useRecoilValue(wizardTodoState);
    const { colors } = useTheme();

    if (!authState.authenticated) {
        return (
            <NavigationContainer>
                <SafeAreaView style={{ flex: 1 }}>
                    <AuthStackNavigator />
                    <Text>
                        {authState.authenticated ? 'y' : 'n'}
                    </Text>
                </SafeAreaView>
            </NavigationContainer>
        );
    }

    if (authState.authenticated && wizardTodo) {
        return (
            <NavigationContainer>
                <SafeAreaView style={{ flex: 1 }}>
                    <SignUpWizardStackNavigator />
                </SafeAreaView>
            </NavigationContainer>
        );
    }

    const tabBarStyle: ViewStyle = {
        // paddingBottom: 0,
        // height: 49,
        backgroundColor: colors.gray[900], // Set the background color to gray[900]
    };
    const tabBarStyleNoFooter: ViewStyle = {
        ...tabBarStyle,
        display: 'none',
    };

    return (
        <NavigationContainer>
            <SafeAreaView style={{ flex: 1 }}>
                <Tab.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: { backgroundColor: colors.gray[900] },
                        tabBarActiveTintColor: '#F3754B',
                        tabBarInactiveTintColor: 'white',

                        // tabBarPressColor: '#F3754B',
                        // tabBarIndicatorStyle: { backgroundColor: '#F3754B' },
                    }}
                >
                    <Tab.Screen
                        component={HomeStackNavigator}
                        name="Home"
                        options={{
                            tabBarIcon: HomeIcon,
                            tabBarStyle,
                        }}
                    />
                    <Tab.Screen
                        component={WorkoutsStackNavigator}
                        name="Workouts"
                        options={{
                            tabBarIcon: TimerIcon,
                            tabBarStyle: !showFooter ? tabBarStyleNoFooter : tabBarStyle,
                        }}
                    />
                    <Tab.Screen
                        component={ProfileStackNavigator}
                        name="Profile"
                        options={{
                            tabBarIcon: ProfileTabIcon,
                            tabBarStyle,
                        }}
                    />
                </Tab.Navigator>
            </SafeAreaView>
        </NavigationContainer>
    );
};
