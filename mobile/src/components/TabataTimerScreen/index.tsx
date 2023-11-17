import React, { useState, useEffect } from 'react';
import {
    VStack, Text, Button, IconButton, Icon,
    Modal, Box, Heading, Divider,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSetRecoilState } from 'recoil';
import { TabataTimerScreenRouteProp } from '../../navigation/navigationTypes';
import { TabataExercise } from '../../types/workouts';
import { Intervals } from '../../util/constants';
import { TimerScreenNavigationProp } from '../../types/navigationTypes';
import { showFooterState } from '../../atoms/showFooterAtom';

export const TabataTimerScreen = (): JSX.Element => {
    const route = useRoute<TabataTimerScreenRouteProp>();
    const {
        warmupDuration, exerciseDuration, restDuration,
        tabatas, exercisesPerTabata, numberOfTabatas,
        intermisionDuration, cooldownDuration,
    } = route.params.workout;

    const navigation = useNavigation<TimerScreenNavigationProp>();
    const [currentInterval, setCurrentInterval] = useState<Intervals>(Intervals.Warmup);
    const [exercisesDone, setExercisesDone] = useState(0);
    const [circuitsDone, setCircuitsDone] = useState(0);
    const [seconds, setSeconds] = useState(warmupDuration);
    const [isActive, setIsActive] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [currentExercise, setCurrentExercise] = useState<TabataExercise | null>(null);
    const currentTabata = tabatas[circuitsDone];
    const [showAlert, setShowAlert] = useState(false);
    const setShowFooter = useSetRecoilState(showFooterState);

    useEffect(() => {
        setShowFooter(false); // Hide the tab bar when the Timer component is mounted

        return () => {
            setShowFooter(true); // Show the tab bar when the Timer component is unmounted
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = (): void => {
        setIsActive(!isActive);
    };

    const reset = (): void => {
        setIsReset(true);
        setIsActive(false);
        setCurrentInterval(Intervals.Warmup);
        setExercisesDone(0);
        setCircuitsDone(0);
        setSeconds(warmupDuration);
        setRemainingTime(totalWorkoutTime);
        setCurrentExercise(null);
    };

    const formatTime = (time: number): string => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time - (hours * 3600)) / 60);
        const currSeconds = time - (hours * 3600) - (minutes * 60);

        const hoursStr = hours < 10 ? `0${hours}` : hours;
        const minsStr = minutes < 10 ? `0${minutes}` : minutes;
        const secsStr = seconds < 10 ? `0${currSeconds}` : currSeconds;

        return hours > 0 ? `${hoursStr}:${minsStr}:${secsStr}` : `${minsStr}:${secsStr}`;
    };

    useEffect(() => {
        setTotalWorkoutTime(warmupDuration + numberOfTabatas * (exercisesPerTabata * (exerciseDuration + restDuration)
        + intermisionDuration) + cooldownDuration - intermisionDuration);
        setRemainingTime(warmupDuration + numberOfTabatas * (
            exercisesPerTabata * (exerciseDuration + restDuration) + intermisionDuration)
        + cooldownDuration - intermisionDuration);
    }, [warmupDuration, exerciseDuration, restDuration, numberOfTabatas,
        exercisesPerTabata, intermisionDuration, cooldownDuration]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && !isReset) {
            interval = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                    setRemainingTime(remainingTime - 1);
                } else {
                    switch (currentInterval) {
                        case Intervals.Warmup:
                            setCurrentInterval(Intervals.Exercise);
                            setSeconds(exerciseDuration);
                            setCurrentExercise(currentTabata[exercisesDone < exercisesPerTabata
                                ? exercisesDone : exercisesPerTabata - 1]);
                            break;
                        case Intervals.Exercise:
                            setCurrentInterval(Intervals.Rest);
                            setSeconds(restDuration);
                            setCurrentExercise(null);
                            break;
                        case Intervals.Rest:
                            if (exercisesDone < exercisesPerTabata - 1) {
                                setCurrentInterval(Intervals.Exercise);
                                setSeconds(exerciseDuration);
                                setExercisesDone(exercisesDone + 1);
                                setCurrentExercise(tabatas[circuitsDone][exercisesDone + 1]);
                            } else {
                                setCurrentInterval(Intervals.Intermission);
                                setSeconds(intermisionDuration);
                                setCircuitsDone(circuitsDone + 1);
                                setCurrentExercise(null);
                            }
                            break;
                        case Intervals.Intermission:
                            if (circuitsDone < numberOfTabatas - 1) {
                                setCurrentInterval(Intervals.Exercise);
                                setSeconds(exerciseDuration);
                                setExercisesDone(0);
                                setCurrentExercise(tabatas[circuitsDone][0]);
                            } else {
                                setCurrentInterval(Intervals.Cooldown);
                                setSeconds(cooldownDuration);
                            }
                            break;
                        case Intervals.Cooldown:
                            setIsActive(false);
                            setShowAlert(true);
                            break;
                        default: break;
                    }
                }
            }, 1000);
        } else if (!isActive && seconds !== 0 && !isReset) {
            if (interval) {
                clearInterval(interval);
            }
        } else if (isReset) {
            setIsReset(false);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, seconds, isReset, exerciseDuration, numberOfTabatas, currentInterval,
        remainingTime, cooldownDuration, intermisionDuration, exercisesDone, circuitsDone,
        restDuration, currentTabata, exercisesPerTabata, tabatas]);

    const handleReturnHome = (): void => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'WorkoutsPage' }],
        });
        navigation.navigate('Home');
        setShowAlert(false);
    };

    return (
        <VStack alignItems="center" space={4}>
            <IconButton
                icon={<Icon as={Ionicons} name="arrow-back" />}
                left={0}
                position="absolute"
                top={0}
                onPress={(): void => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ShuffleScreen' }],
                    });
                    navigation.navigate('ShuffleScreen');
                }}
            />
            <Text>{`Total remaining time: ${formatTime(remainingTime)}`}</Text>
            {/* <Text>{`${JSON.stringify(route.params.workout)}`}</Text> */}

            <Text
                // eslint-disable-next-line no-nested-ternary
                color={currentInterval === Intervals.Exercise ? 'green.500' : currentInterval === Intervals.Cooldown
                    ? 'orange.500' : 'yellow.500'}
                fontSize="6xl"
            >
                {formatTime(seconds)}
            </Text>
            <Text>
                Exercises:
                {' '}
                {currentInterval === Intervals.Intermission || currentInterval === Intervals.Warmup ? `0/${exercisesPerTabata}` : `${exercisesDone + 1}/${exercisesPerTabata}`}
            </Text>
            <Text>
                Tabatas:
                {' '}
                {currentInterval === Intervals.Intermission && `0/${numberOfTabatas}`}
                {currentInterval === Intervals.Exercise || currentInterval === Intervals.Rest || currentInterval === Intervals.Cooldown ? `${circuitsDone + 1}/${numberOfTabatas}` : `${circuitsDone}/${numberOfTabatas}`}
            </Text>
            <Text>{currentExercise ? `Current Exercise: ${currentExercise.name}` : `Current: ${currentInterval.toUpperCase()}`}</Text>
            <Button onPress={toggle}>{isActive ? 'Pause' : 'Start'}</Button>
            <Button onPress={reset}>Reset</Button>
            <Modal isOpen={showAlert} onClose={(): void => setShowAlert(false)}>
                <Modal.Content maxWidth="400px">
                    <Modal.CloseButton />
                    <Modal.Header>Congrats!</Modal.Header>
                    <Modal.Body>
                        <Box mb={5}>
                            <Heading my={2} size="lg">
                                Your workout was
                                {' '}
                                {formatTime(totalWorkoutTime)}
                                {' '}
                                long.
                            </Heading>
                        </Box>
                        <Divider my={5} />
                        <Button colorScheme="twitter" mb={4} onPress={handleReturnHome}>Share to Twitter</Button>
                        <Button onPress={handleReturnHome}>Return Home</Button>
                    </Modal.Body>
                </Modal.Content>
            </Modal>
        </VStack>
    );
};
