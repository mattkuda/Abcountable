import React from 'react';
import { Box } from 'native-base';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useInfiniteQueryPostsFollowing, FetchPostsResponse } from '../../hooks/useQueryPostsFollowing';
import { PostCard } from '../common/PostCard';
import { InfiniteScrollList } from '../common/InfiniteScrollList';
import { useInfiniteQueryPosts } from '../../hooks/useQueryPosts';

const Tab = createMaterialTopTabNavigator();

const FollowingTab = (): JSX.Element => {
    const {
        data: postData,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQueryPostsFollowing();

    const flatMap = postData?.pages.flatMap((page: FetchPostsResponse) => page);

    const onRefresh = async (): Promise<void> => {
        await refetch();
    };

    return (
        <Box backgroundColor="gray.100" flex={1} justifyContent="center">
            <InfiniteScrollList
                data={flatMap}
                estimatedItemSize={285}
                fetchData={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                keyExtractor={(_, index): string => `post-${index}`}
                renderItem={(item): JSX.Element => <PostCard post={item} />}
                onRefresh={onRefresh}
            />
        </Box>
    );
};

const GlobalTab = (): JSX.Element => {
    const {
        data: postData,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQueryPosts();

    const onRefresh = async (): Promise<void> => {
        await refetch();
    };

    const flatMap2 = postData?.pages.flatMap((page: FetchPostsResponse) => page);

    return (
        <Box flex={1} justifyContent="center">
            <InfiniteScrollList
                data={flatMap2}
                estimatedItemSize={285}
                fetchData={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                keyExtractor={(_, index): string => `post-${index}`}
                renderItem={(item): JSX.Element => <PostCard post={item} />}
                onRefresh={onRefresh}
            />
        </Box>
    );
};

export const HomePage = (): JSX.Element => (
    <Box flex={1} justifyContent="center">
        <Tab.Navigator>
            <Tab.Screen component={FollowingTab} name="Following" />
            <Tab.Screen component={GlobalTab} name="Global" />
        </Tab.Navigator>
    </Box>
);
