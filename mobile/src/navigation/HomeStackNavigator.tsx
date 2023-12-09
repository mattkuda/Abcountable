import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PostScreen } from '../components/PostScreen';
import { ProfilePage } from '../components/ProfilePage';
import { HomePage } from '../components/HomePage';
import { SearchPage } from '../components/SearchPage';
import { HomeStackParamList } from './navigationTypes';
import { Searchbutton } from '../components/SearchButtons';
import { NotificationsScreen } from '../components/NotificationsScreen';
import { NotificationsButton } from '../components/NotificationsButton';

const Stack = createStackNavigator<HomeStackParamList>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SearchButtonComponent = (): JSX.Element => <Searchbutton />;
const NotificationsButtonComponent = (): JSX.Element => <NotificationsButton />;

export const HomeStackNavigator = (): JSX.Element => (
    <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
            headerLeft: SearchButtonComponent,
            headerRight: NotificationsButtonComponent,
        }}
    >
        <Stack.Screen component={HomePage} name="Home" />
        <Stack.Screen component={SearchPage} name="Search" />
        <Stack.Screen
            component={ProfilePage}
            initialParams={{ userId: null }}
            name="Profile"
        />
        <Stack.Screen component={PostScreen} name="PostScreen" />
        <Stack.Screen component={NotificationsScreen} name="NotificationsScreen" />
    </Stack.Navigator>
);
