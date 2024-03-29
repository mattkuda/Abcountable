import {
    Avatar, Modal, VStack, Button, HStack, Input, Select, Text,
} from 'native-base';
import React, { useState } from 'react';
import {
    TouchableOpacity,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
// eslint-disable-next-line import/no-unresolved
import { ProfileStackParamList } from 'src/navigation/navigationTypes';
import { useMutateDeleteAccount, useMutateProfilePicture, useMutateUpdateProfile } from '../../mutations/profileMutations';
import { useAuth } from '../../context/AuthContext';

type EditProfileRouteProp = RouteProp<ProfileStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = StackNavigationProp<ProfileStackParamList, 'EditProfile'>;

interface EditProfileProps {
    route: EditProfileRouteProp;
    navigation: EditProfileNavigationProp;
}

export const EditProfilePage: React.FC<EditProfileProps> = ({ route, navigation }) => {
    const { user } = route.params;
    const [firstName, setFirstName] = useState(user?.firstName);
    const [lastName, setLastName] = useState(user?.lastName);
    const [bio, setBio] = useState(user?.bio);
    const [city, setCity] = useState(user?.city);
    const [state, setState] = useState(user?.state);
    const [birthday, setBirthday] = useState(user?.birthday);
    const [gender, setGender] = useState(user?.gender);
    const [weight, setWeight] = useState(user?.weight);
    const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureUrl);
    const updateProfileMutation = useMutateUpdateProfile();
    const updateProfilePictureMutation = useMutateProfilePicture();
    const deleteAccountMutation = useMutateDeleteAccount();
    const [showModal, setShowModal] = useState(false);
    const { onLogout } = useAuth();

    const handleUpdate = (): void => {
        updateProfileMutation.mutate({
            userId: user._id.toString(),
            userData: {
                firstName,
                lastName,
                bio,
                city,
                state,
                birthday,
                gender,
                weight,
            },
        }, { onSuccess: () => navigation.goBack() });
    };

    const handleProfilePictureUpdate = async (): Promise<void> => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            // Infer the type of the media from the extension
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            // Create the formData to send to the server
            const formData = new FormData();

            formData.append('file', {
                uri: localUri,
                name: filename,
                type,
            } as any); // 'any' casting is necessary to satisfy TypeScript

            updateProfilePictureMutation.mutate({
                formData,
                userId: user._id.toString(),
            }, {
                onSuccess: (data) => {
                    if (data?.url) {
                        setProfilePictureUrl(data.url);
                    } else {
                        console.error('No URL returned from the upload API');
                    }
                },
            });
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await onLogout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleBirthdayChange = (text: string): void => {
        const newText = text.replace(/[^0-9]/g, ''); // Removes any character that is not a number

        // Format as MM/DD/YYYY
        let formattedText = '';

        if (newText.length <= 2) {
            // Month part
            formattedText = newText;
        } else if (newText.length <= 4) {
            // Day part
            formattedText = `${newText.slice(0, 2)}/${newText.slice(2)}`;
        } else if (newText.length <= 8) {
            // Year part
            formattedText = `${newText.slice(0, 2)}/${newText.slice(2, 4)}/${newText.slice(4, 8)}`;
        }

        setBirthday(formattedText);
    };

    const handleDeleteAccount = async (): Promise<void> => {
        deleteAccountMutation.mutate({
            userId: user._id.toString(),
        }, { onSuccess: () => navigation.goBack() });
        await onLogout();
        setShowModal(false);
    };

    return (
        <VStack bgColor="gray9" style={{ padding: 20, gap: 8 }}>
            <HStack>
                <TouchableOpacity onPress={handleProfilePictureUpdate}>
                    <Avatar
                        borderColor="flame"
                        borderWidth={2}
                        size="xl"
                        source={{
                            uri: profilePictureUrl, // make sure you have the correct uri
                        }}
                    />
                </TouchableOpacity>
                <VStack style={{ paddingLeft: 16, gap: 4, flex: 1 }}>
                    <Input
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <Input
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </VStack>
            </HStack>
            <Input
                placeholder="Bio"
                value={bio}
                w="100%"
                onChangeText={setBio}
            />
            <Input
                placeholder="City"
                value={city}
                w="100%"
                onChangeText={setCity}
            />
            <Input
                placeholder="State"
                value={state}
                w="100%"
                onChangeText={setState}
            />
            <Text>Athlete Information</Text>
            <Input
                keyboardType="numeric"
                leftElement={<Text pl={2}>Birthday</Text>}
                placeholder="(MM/DD/YYYY)"
                value={birthday}
                w="100%"
                onChangeText={handleBirthdayChange}
            />
            <Select
                // @ts-ignore: Left element does exist on select
                leftElement={<Text pl={2}>Gender</Text>}
                selectedValue={gender}
                onValueChange={setGender}
            >
                <Select.Item label="Male" value="male" />
                <Select.Item label="Female" value="female" />
                <Select.Item label="Prefer not to say" value="not-specified" />
            </Select>
            <Input
                keyboardType="numeric"
                leftElement={<Text pl={2}>Weight (lbs)</Text>}
                value={weight ? weight.toString() : ''}
                w="100%"
                onChangeText={(text): void => setWeight(parseInt(text, 10))} // conver to number
            />
            <Button onPress={handleUpdate}>Update Profile</Button>
            <Button onPress={handleLogout}>Logout</Button>
            <Button onPress={(): void => navigation.goBack()}>Go Back</Button>
            <Button onPress={(): void => setShowModal(true)}>Delete Account</Button>
            <Modal isOpen={showModal}>
                <Modal.Content>
                    <Modal.CloseButton />
                    <Modal.Header>Delete Account</Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete your account?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button colorScheme="blueGray" variant="ghost" onPress={(): void => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button colorScheme="danger" onPress={handleDeleteAccount}>
                                Delete
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </VStack>
    );
};
