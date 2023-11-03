import React, { useCallback } from 'react';
import { VStack, Text, Button } from 'native-base';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { ProfileScreenRouteProp } from '../../navigation/navigationTypes';
import { useUserInfo } from '../../hooks/useUserInfo';
import { EditProfileScreenNavigationProp } from '../../types/navigationTypes';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage = (): JSX.Element => {
    const { onLogout } = useAuth();
    // eslint-disable-next-line prefer-destructuring
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const route = useRoute<ProfileScreenRouteProp>();
    const username = route.params?.username || null; // Access userId from the route params
    const userInfo = useUserInfo(username || 'test'); // Pass userId to your hook

    useFocusEffect(
        useCallback(() => {
            // Refetch the user data when the screen comes into focus
            userInfo.refetch();

            return () => {
                // Do any cleanup if needed when the screen goes out of focus
            };
        }, [userInfo]),
    );

    const navigateToEditProfile = (): void => {
        if (userInfo.isSuccess && userInfo) {
            navigation.navigate('EditProfile', { user: userInfo.data });
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await onLogout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <VStack alignItems="center" space={4}>
            <Text>Profile Page</Text>
            {userInfo.data && (
                <>
                    <Text>{`Username: ${userInfo.data.username}`}</Text>
                    <Text>{`Name: ${userInfo.data.firstName}${userInfo.data.lastName ? ` ${userInfo.data.lastName}` : ''}`}</Text>
                </>
            )}
            <Button onPress={navigateToEditProfile}>Edit Profile</Button>
            <Text>
                {JSON.stringify(route.params)}
            </Text>
            <Button onPress={handleLogout}>Logout</Button>
        </VStack>
    );
};
