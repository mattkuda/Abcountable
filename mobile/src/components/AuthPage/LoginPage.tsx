import React, { useState } from 'react';
import {
    StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSetRecoilState } from 'recoil';
import {
    Button, VStack, Text, Input,
} from 'native-base';
import { userState } from '../../atoms/userStateAtom';
import { useAuth } from '../../context/AuthContext';
// @ts-ignore
import logo from '../../../assets/tabafit-icon.png';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        maxWidth: '80%',
        height: 100,
        resizeMode: 'contain',
        marginHorizontal: 100,
        marginBottom: 20,
    },
    input: {
        width: '80%',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 5,
    },
});

export const LoginScreen = (): JSX.Element => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const setUser = useSetRecoilState(userState);
    const { onLogin } = useAuth();
    const handleSignIn = async (): Promise<void> => {
        try {
            const data = await onLogin(email, password);

            setErrorMessage(JSON.stringify(data));

            if (data.success) {
                setUser((prevState) => ({
                    ...prevState,
                    isAuthenticated: true,
                    user: data.user, // Assuming 'data.user' contains the user data returned from the server
                }));
            } else {
                // setErrorMessage(data.message);
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handlePrefill = async (): Promise<void> => {
        setEmail('test@gmail.com');
        setPassword('test');
        await handleSignIn();
    };

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
                        flex={1}
                        justifyContent="center"
                        padding={4}
                        space={4}
                        width="100%"
                    >
                        <Image
                            alt="TabaFit Logo"
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
                        <Button
                            borderRadius="full"
                            width="80%"
                            onPress={handleSignIn}
                        >
                            Login
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
