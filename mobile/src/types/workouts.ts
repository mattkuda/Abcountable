import { Exercise } from './exercises';

export interface Workout {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    warmupDuration: number;
    exercises: Exercise[];
    restDuration: number;
    exerciseDuration: number;
    circuits: number;
    intermisionDuration: number;
    cooldownDuration: number;
}

export type TabataExerciseType = 'Lower Body' | 'Upper Body' | 'Abs' | 'Cardio' | 'Glutes' | 'Spicy'

export interface TabataExercise {
    _id: string;
    name: string;
    types: TabataExerciseType[];
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    videoLink: string;
}

export type TabataCircuit = TabataExercise[]

export interface TabataWorkout {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    warmupDuration: number;
    tabatas: TabataCircuit[];
    restDuration: number;
    exerciseDuration: number;
    numberOfTabatas: number;
    exercisesPerTabata: number;
    intermisionDuration: number;
    cooldownDuration: number;
}
