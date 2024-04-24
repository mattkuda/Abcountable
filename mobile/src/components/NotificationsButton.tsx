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
    const { data: notifications } = useQueryNotifications(true);

    const unreadNotificationsCount = notifications?.filter((notif) => !notif.read).length || 0;

    return (
        <Box>
            <IconButton
                _icon={{
                    color: 'flame',
                    size: 'md',
                }}
                borderRadius="full"
                color="flame"
                icon={<Icon as={Ionicons} name="notifications" size="md" />}
                onPress={(): void => navigation.navigate('NotificationsScreen')}
            />
            {unreadNotificationsCount > 0 && (
                <Badge
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
