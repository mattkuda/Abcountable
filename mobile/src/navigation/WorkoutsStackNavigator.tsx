import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutsStackParamList } from './navigationTypes';
import { BuildWorkoutScreen } from '../components/BuildWorkoutScreen';
import { SelectExerciseScreen } from '../components/SelectExerciseScreen';
import { WorkoutsScreen } from '../components/WorkoutsScreen';
import { TabataTimerScreen } from '../components/TabataTimerScreen';
import { ShareWorkoutScreen } from '../components/ShareWorkoutScreen';

const Stack = createStackNavigator<WorkoutsStackParamList>();

export const WorkoutsStackNavigator = (): JSX.Element => (
    <Stack.Navigator
        initialRouteName="LoadWorkoutScreen"
        // screenOptions={{ headerShown: false }}
    >
        <Stack.Screen component={WorkoutsScreen} name="WorkoutsScreen" />
        <Stack.Screen component={BuildWorkoutScreen} name="BuildWorkoutScreen" />
        <Stack.Screen component={SelectExerciseScreen} name="SelectExerciseScreen" />
        <Stack.Screen component={TabataTimerScreen} name="TabataTimerScreen" />
        <Stack.Screen component={ShareWorkoutScreen} name="ShareWorkoutScreen" />
    </Stack.Navigator>
);
