import React from 'react';
import {
    VStack, FlatList, Pressable, Text,
} from 'native-base';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    lowerBodyExercises,
    upperBodyExercises,
    absExercises,
    cardioExercises,
} from '../../util/constants';
import { WorkoutsStackParamList } from '../../navigation/navigationTypes';
import { TabataExercise } from '../../types/workouts';

type SelectExerciseScreenNavigationProp = StackNavigationProp<WorkoutsStackParamList, 'SelectExerciseScreen'>;
type SelectExerciseScreenRouteProp = RouteProp<WorkoutsStackParamList, 'SelectExerciseScreen'>;

export const SelectExerciseScreen = (): JSX.Element => {
    const exercises = [...lowerBodyExercises, ...upperBodyExercises, ...absExercises, ...cardioExercises].sort(
        (a, b) => a.name.localeCompare(b.name),
    );
    const navigation = useNavigation<SelectExerciseScreenNavigationProp>();
    const route = useRoute<SelectExerciseScreenRouteProp>();

    const handleSelectExercise = (exercise: TabataExercise): void => {
        const { onSelectWorkout } = route.params;

        onSelectWorkout(exercise);
        navigation.goBack();
    };

    return (
        <VStack>
            <FlatList
                data={exercises}
                keyExtractor={(item): string => item._id}
                renderItem={({ item }): JSX.Element => (
                    <Pressable onPress={(): void => handleSelectExercise(item)}>
                        <Text>{item.name}</Text>
                    </Pressable>
                )}
            />
        </VStack>
    );
};
