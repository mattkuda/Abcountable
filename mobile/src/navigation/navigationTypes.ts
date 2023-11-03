import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { User } from '../types/users';

// Home Stack
export type HomeStackParamList = {
    Home: undefined;
    Search: undefined;
    Profile: {userId: string|null}
};

export type SearchScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Search'>;
//

// Profile Stack
export type ProfileStackParamList = {
    Profile: { userId?: string };
    EditProfile: { user: User };
};

export type ProfileScreenRouteProp = RouteProp<ProfileStackParamList, 'Profile'>;

//
