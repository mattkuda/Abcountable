import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { TabataWorkout } from '../types/workouts';
import { User } from '../types/users';

// Home Stack
export type HomeStackParamList = {
    Home: undefined;
    Search: undefined;
    Profile: {userId: string | null}
    PostScreen: {postId: string}
    NotificationsScreen: undefined
};

export type SearchScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Search'>;
export type NotificationsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'NotificationsScreen'>;
//

// Profile Stack
export type ProfileStackParamList = {
    Profile: { userId?: string };
    EditProfile: { user: User };
};

export type ProfileScreenRouteProp = RouteProp<ProfileStackParamList, 'Profile'>;

// Post Stack
export type PostStackParamList = {
    PostScreen: { postId: string };
};

export type PostScreenRouteProp = RouteProp<PostStackParamList, 'PostScreen'>;

// Shuffle Stack
export type ShuffleStackParamList = {
    ShuffleScreen: { workout?: TabataWorkout };
    LoadWorkoutScreen;
    TabataTimer: {workout: TabataWorkout};
    ShareWorkoutScreen: {workout: TabataWorkout, completedAt: Date};
};

export type ShuffleScreenRouteProp = RouteProp<ShuffleStackParamList, 'ShuffleScreen'>;
export type TabataTimerScreenRouteProp = RouteProp<ShuffleStackParamList, 'TabataTimer'>;
export type ShareWorkoutScreenRouteProp = RouteProp<ShuffleStackParamList, 'ShareWorkoutScreen'>;
export type LoadWorkoutScreenRouteProp = RouteProp<ShuffleStackParamList, 'LoadWorkoutScreen'>;
