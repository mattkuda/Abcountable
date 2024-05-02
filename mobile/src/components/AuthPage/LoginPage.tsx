import React, { useState } from 'react';
import {
    TextInput, StyleSheet, Image, TouchableOpacity,
} from 'react-native';
import { useSetRecoilState } from 'recoil';
import { Button, VStack, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { userState } from '../../atoms/userStateAtom';
import { useAuth } from '../../context/AuthContext';
// @ts-ignore
import logo from '../../../assets/TabatableBasicLogo.png'; // Adjust the path and filename as necessary
import { AuthStackParamList } from '../../navigation/navigationTypes';

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
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
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
            alignItems="center"
            backgroundColor="gray9"
            flex={1}
            justifyContent="center"
            space={4}
            width="100%"
        >
            <Image source={logo} style={styles.logo} />
            <TextInput
                autoCapitalize="none"
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput secureTextEntry placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} />
            <Button
                borderRadius="full"
                width="80%"
                onPress={handleSignIn}
            >
                Login
            </Button>
            <Button
                borderRadius="full"
                width="80%"
                onPress={handlePrefill}
            >
                Pre-fill
            </Button>
            <Button
                borderRadius="full"
                colorScheme="secondary"
                width="80%"
                onPress={(): void => navigation.navigate('SignupScreen')}
            >
                Create a new account
            </Button>
            <TouchableOpacity onPress={(): void => navigation.navigate('SignupScreen')}>
                <Text color="white">
                    Not a member?
                    <Text textDecorationLine="underline">Sign up</Text>
                </Text>
            </TouchableOpacity>
            <Text>{errorMessage}</Text>
        </VStack>
    );
};
