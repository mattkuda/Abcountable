import React, { useState } from 'react';
import {
    StyleSheet, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSetRecoilState } from 'recoil';
import {
    Input, VStack, Button, Text, ScrollView,
} from 'native-base';
import { userState } from '../../atoms/userStateAtom';
import { useAuth } from '../../context/AuthContext';
// @ts-ignore
import logo from '../../../assets/tabafit-icon.png';

const styles = StyleSheet.create({
    logo: {
        maxWidth: '80%',
        height: 100,
        resizeMode: 'contain',
        marginBottom: 20,
        alignSelf: 'center',
    },
});

export const SignupScreen = (): JSX.Element => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const setUser = useSetRecoilState(userState);
    const { onRegister } = useAuth();

    const handleSignUp = async (): Promise<void> => {
        try {
            const data = await onRegister(email, password, firstName, lastName, username);

            if (data.success) {
                setUser((prevState) => ({
                    ...prevState,
                    isAuthenticated: true,
                    user: data.user,
                }));
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handlePrefill = async (): Promise<void> => {
        const randomNumber = Math.floor(Math.random() * 10000) + 1;

        setEmail(`test${randomNumber}@gmail.com`);
        setUsername(`test${randomNumber}`);
        setFirstName(`test${randomNumber}`);
        setLastName(`test${randomNumber}`);
        setPassword('test');
    };

    const isFormIncomplete = !email || !password || !firstName || !lastName || !username;

    return (
        <VStack
            backgroundColor="gray9"
            flex={1}
            width="100%"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <VStack
                        alignItems="center"
                        backgroundColor="gray9"
                        flex={1}
                        justifyContent="center"
                        padding={4}
                        space={4}
                        width="100%"
                    >
                        <Image
                            alt="TabaFit logo"
                            source={logo}
                            style={styles.logo}
                        />
                        <Input
                            autoCapitalize="none"
                            placeholder="Email"
                            value={email}
                            width="80%"
                            onChangeText={setEmail}
                        />
                        <Input
                            secureTextEntry
                            placeholder="Password"
                            value={password}
                            width="80%"
                            onChangeText={setPassword}
                        />
                        <Input
                            placeholder="First Name"
                            value={firstName}
                            width="80%"
                            onChangeText={setFirstName}
                        />
                        <Input
                            placeholder="Last Name"
                            value={lastName}
                            width="80%"
                            onChangeText={setLastName}
                        />
                        <Input
                            autoCapitalize="none"
                            placeholder="Username"
                            value={username}
                            width="80%"
                            onChangeText={setUsername}
                        />
                        <Button
                            borderRadius="full"
                            disabled={isFormIncomplete}
                            width="80%"
                            onPress={handleSignUp}
                        >
                            Sign Up
                        </Button>
                        {process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production' && (
                        <Button
                            borderRadius="full"
                            width="80%"
                            onPress={handlePrefill}
                        >
                            Pre-fill
                        </Button>
                        )}
                        <Text>{errorMessage}</Text>
                    </VStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </VStack>
    );
};
