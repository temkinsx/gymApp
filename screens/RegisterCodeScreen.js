import React, { useState } from 'react';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

export default function RegisterCodeScreen() {
    const [code, setCode] = useState('');
    const navigation = useNavigation();
    const route = useRoute();
    const { phoneNumber } = route.params;

    const handleNext = async () => {
        if (code.trim() !== '1234') {
            alert('Неверный код');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/users/check`, { phoneNumber });
            if (response.data.exists) {
                const userData = await axios.get(`${API_URL}/api/users/phone/${encodeURIComponent(phoneNumber)}`);
                const user = userData.data;

                const isFullyRegistered = user.fullName && user.birthDate && user.passport?.number;

                await AsyncStorage.setItem('userPhone', phoneNumber);
                await AsyncStorage.setItem('phoneNumber', phoneNumber);

                if (isFullyRegistered) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                    });
                } else {
                    navigation.navigate('RegisterName', { phoneNumber });
                }
            } else {
                try {
                    await axios.post(`${API_URL}/api/users/register`, {
                        phoneNumber
                    });
                    await AsyncStorage.setItem('userPhone', phoneNumber);
                    await AsyncStorage.setItem('phoneNumber', phoneNumber);
                    navigation.navigate('RegisterName', { phoneNumber });
                } catch (registerError) {
                    console.error('Ошибка при создании пользователя:', registerError);
                    alert('Не удалось создать пользователя');
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке пользователя:', error);
            alert('Ошибка подключения к серверу');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            enabled
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Text style={styles.title}>Введите код из SMS</Text>
                    <View style={{ marginTop: 20 }}>
                        <TextInput
                            placeholder="Код"
                            keyboardType="numeric"
                            value={code}
                            onChangeText={setCode}
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>Далее</Text>
                        </TouchableOpacity>
                        <Text style={styles.hint}>* используйте "1234" как тестовый код</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 32 },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 12,
        borderRadius: 8, marginBottom: 20, fontSize: 18
    },
    button: {
        backgroundColor: '#4CAF50', padding: 16,
        borderRadius: 10, alignItems: 'center'
    },
    buttonText: { color: '#fff', fontSize: 18 },
    hint: { textAlign: 'center', color: '#666', marginTop: 10 }
});