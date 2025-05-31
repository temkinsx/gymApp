import React, { useLayoutEffect } from 'react';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, TextInput, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import gymBg from '../assets/gymStartScreen.png'; // путь можно скорректировать по структуре проекта
import { useNavigation } from '@react-navigation/native';

export default function StartScreen() {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const translateY = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
            Animated.timing(translateY, {
                toValue: -e.endCoordinates.height / 2,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
        const hideSub = Keyboard.addListener('keyboardWillHide', () => {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    return (
        <ImageBackground source={gymBg} style={styles.container} resizeMode="cover">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                        <Text style={styles.title}>Добро пожаловать в MyGym!</Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                            style={styles.keyboardAvoiding}
                        >
                            <Animated.View style={[styles.inner, { transform: [{ translateY }] }]}>
                                <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>
                                    Введите номер телефона:
                                </Text>
                                <TextInput
                                    placeholder="+7 (123) 456-78-90"
                                    placeholderTextColor="#666"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={(text) => {
                                        let digits = text.replace(/\D/g, '');
                                        if (digits.startsWith('8')) digits = '7' + digits.slice(1);
                                        if (!digits.startsWith('7')) digits = '7' + digits;

                                        let formatted = '+7';
                                        if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
                                        if (digits.length >= 4) formatted += ') ' + digits.slice(4, 7);
                                        if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
                                        if (digits.length >= 9) formatted += '-' + digits.slice(9, 11);

                                        // Убираем лишние символы при удалении
                                        if (text.length < phoneNumber.length) {
                                            setPhoneNumber(text);
                                        } else {
                                            setPhoneNumber(formatted);
                                        }
                                        setErrorMessage('');
                                    }}
                                    style={styles.input}
                                />
                                {errorMessage !== '' && (
                                    <Text style={{ color: '#ff6b6b', fontSize: 14, marginTop: 4 }}>{errorMessage}</Text>
                                )}
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={async () => {
                                        const cleanPhone = phoneNumber.replace(/\D/g, '');
                                        if (cleanPhone.length < 11) {
                                            setErrorMessage('Введен неверный номер телефона');
                                            return;
                                        }
                                        const formattedPhone = '+' + cleanPhone;
                                        try {
                                            const response = await fetch(`${API_URL}/api/users/check`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({ phoneNumber: formattedPhone }),
                                            });

                                            if (!response.ok) {
                                                const errorText = await response.text();
                                                throw new Error(`Ошибка ответа сервера: ${response.status} — ${errorText}`);
                                            }

                                            const data = await response.json();

                                            // Сохраняем номер телефона
                                            await AsyncStorage.setItem('phoneNumber', formattedPhone);

                                            navigation.navigate('VerifyCode', { phoneNumber: formattedPhone });
                                        } catch (error) {
                                            console.error('Ошибка при проверке номера:', error);
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>Войти</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 32 },
    flex: { flex: 1 },
    scroll: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingBottom: 40,
        paddingHorizontal: 32,
    },
    keyboardAvoiding: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    inner: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16,
        paddingTop: 0,   // Изменено с 16 на 0
        paddingBottom: 60, // Изменено с 100 на 200
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 20,
        marginTop: 30,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 0.5,
    },
    input: {
        width: 280,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        marginBottom: 2,
        paddingVertical: 15,
        paddingHorizontal: 18,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        color: '#000',
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#219653',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
    },
    linkText: {
        color: '#fff',
        marginTop: 0,
        fontSize: 15,
        textDecorationLine: 'underline',
        fontWeight: '500',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
});