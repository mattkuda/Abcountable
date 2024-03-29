import React, { useEffect, useState } from 'react';
import {
    ScrollView, Button, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    VStack, HStack, Avatar, Text, Icon, IconButton,
} from 'native-base';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useMutateAddComment, useMutateDeleteComment } from '../../mutations/commentMutations';
import { PostScreenRouteProp } from '../../navigation/navigationTypes';
import { useQueryPost } from '../../hooks/useQueryPost'; // Import the usePost hook
import { useMutateLike, useMutateUnlike } from '../../mutations/useMutateLike';
import { PostScreenNavigationProp } from '../../types/navigationTypes';
import { formatName, formatTabatasCount } from '../../util/util';
import { CommentCard } from './CommentCard';
import { getFormattedTimeForTabataWorkout } from '../TabataTimerScreen/util';

export const PostScreen = (): JSX.Element => {
    const route = useRoute<PostScreenRouteProp>();
    const { postId } = route.params;
    const {
        data: post, isLoading, isError, refetch,
    } = useQueryPost(postId);
    const addCommentMutation = useMutateAddComment();
    const deleteCommentMutation = useMutateDeleteComment();
    const [commentBody, setCommentBody] = useState('');
    const { authState } = useAuth();
    const userId = authState?.userId;
    const likeMutation = useMutateLike();
    const unlikeMutation = useMutateUnlike();
    const navigation = useNavigation<PostScreenNavigationProp>();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const formattedTotalWorkoutTime = post?.workout ? getFormattedTimeForTabataWorkout(post.workout) : '0';

    useEffect(() => {
        if (post) {
            setLiked(post.likes.map((id) => id.toString()).includes(userId));
            setLikeCount(post.likes.length);
        }
    }, [post, userId]);

    const handleLikePress = (): void => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        if (liked) {
            unlikeMutation.mutate({ postId: post._id.toString(), userId }, {
                onError: () => {
                    setLiked(true);
                    setLikeCount(likeCount);
                },
            });
        } else {
            likeMutation.mutate({ postId: post._id.toString(), userId }, {
                onError: () => {
                    setLiked(false);
                    setLikeCount(likeCount);
                },
            });
        }
    };

    const handleCommentPress = (): void => {
        console.log('TODO: Highlight input when button pressed');
    };

    const handleAddComment = (): void => {
        addCommentMutation.mutate({ postId, userId, body: commentBody }, {
            onSuccess: () => {
                refetch();
            },
        });
        setCommentBody('');
    };

    const handleDeleteComment = (commentId: string): void => {
        deleteCommentMutation.mutate({ postId, commentId }, {
            onSuccess: () => {
                refetch();
            },
        });
    };

    const handleWorkoutNamePress = (): void => {
        if (post?.workout && post.workout._id) {
            navigation.navigate('ViewWorkoutScreen', { workout: post.workout });
        }
    };

    const handlePressUser = (): void => {
        navigation.navigate('Profile', { userId: post.userId });
    };

    if (isLoading) return <Text>Loading...</Text>;
    if (isError || !post) return <Text>Error loading post</Text>;
    const userFound = post?.user?.username;

    return (
        <ScrollView>
            <VStack borderColor="coolGray.200" borderRadius="md" borderWidth={1} mt={4} p={4} space={2}>
                <HStack justifyContent="space-between" space={2}>
                    <Avatar borderColor="flame" size="48px" source={{ uri: post.user.profilePictureUrl }} />
                    <VStack flex={1}>
                        <Text fontSize="md" onPress={userFound && handlePressUser}>
                            {userFound ? `${formatName(post.user.firstName, post.user.lastName)} @${post.user.username}` : 'Unknown User'}
                        </Text>
                        <Text color="coolGray.600" fontSize="xs">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </Text>
                    </VStack>
                </HStack>
                <Text mt={2} onPress={handleWorkoutNamePress}>
                    {post.workout.name}
                    {' '}
                    {formatTabatasCount(post.workout.numberOfTabatas)}
                </Text>
                <Text mt={2}>
                    Total Workout Time:
                    {' '}
                    {formattedTotalWorkoutTime}
                </Text>
                <Text mt={2}>{post.description}</Text>
                <HStack justifyContent="space-between" mt={2} space={4}>
                    <IconButton
                        borderRadius="full"
                        icon={(
                            <Icon
                                as={Ionicons}
                                color={liked ? 'red.500' : 'coolGray.500'}
                                name={liked ? 'heart' : 'heart-outline'}
                                size="sm"
                            />
                        )}
                        onPress={handleLikePress}
                    />
                    <IconButton
                        borderRadius="full"
                        icon={<Icon as={Ionicons} name="chatbubble-outline" size="sm" />}
                        onPress={handleCommentPress}
                    />
                </HStack>
                <HStack color="coolGray.500" fontSize="xs" justifyContent="space-between" mt={2}>
                    <Text>
                        {likeCount}
                        {' '}
                        Likes
                    </Text>
                    <Text>
                        {post.comments.length}
                        {' '}
                        Comments
                    </Text>
                </HStack>
            </VStack>
            <TextInput
                placeholder="Write a comment..."
                style={{
                    borderWidth: 1, borderColor: 'grey', padding: 10, margin: 10,
                }}
                value={commentBody}
                onChangeText={setCommentBody}
            />
            <Button title="Add Comment" onPress={handleAddComment} />
            {post.comments.map((comment) => (
                <CommentCard
                    comment={comment}
                    key={comment._id?.toString()}
                    onDeleteComment={handleDeleteComment}
                />
            ))}
        </ScrollView>
    );
};
