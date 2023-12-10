import React from 'react';
import {
    Icon, IconButton, Box, Badge,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationsScreenNavigationProp } from '../navigation/navigationTypes';
import { useQueryNotifications } from '../hooks/useQueryNotifications';

export const NotificationsButton = (): JSX.Element => {
    const navigation = useNavigation<NotificationsScreenNavigationProp>();
    // Inside your NotificationsButton component
    const { data: notifications } = useQueryNotifications(true); // Pass true to only fetch unread notifications

    const unreadNotificationsCount = notifications?.filter((notif) => !notif.read).length || 0;

    // ... rest of your component code, including badge display logic

    return (
        <Box>
            <IconButton
                borderRadius="full"
                icon={<Icon as={Ionicons} name="notifications-outline" />}
                onPress={(): void => navigation.navigate('NotificationsScreen')}
            />
            {unreadNotificationsCount > 0 && (
                <Badge // Position the badge over the icon
                    _text={{
                        fontSize: 'xs',
                    }}
                    colorScheme="danger"
                    position="absolute"
                    right={0}
                    rounded="full"
                    top={0}
                    variant="solid"
                    zIndex={1}
                >
                    {unreadNotificationsCount}
                </Badge>

            )}
        </Box>
    );
};
