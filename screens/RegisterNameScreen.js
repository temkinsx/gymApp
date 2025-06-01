import { API_URL } from '@env';
import React, { useState, useRef } from 'react';
import { KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterNameScreen() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const navigation = useNavigation();

    const surnameRef = useRef();
    const nameRef = useRef();
    const patronymicRef = useRef();
    const birthYearRef = useRef();

    const capitalize = (text) => {
        return text.length === 0 ? '' : text[0].toLocaleUpperCase('ru-RU') + text.slice(1).toLocaleLowerCase('ru-RU');
    };

    const formatDate = (text) => {
        let cleaned = text.replace(/\D+/g, '').slice(0, 8);
        let formatted = cleaned;
        if (cleaned.length >= 3 && cleaned.length <= 4) {
            formatted = `${cleaned.slice(0,2)}.${cleaned.slice(2)}`;
        } else if (cleaned.length >= 5 && cleaned.length <= 8) {
            formatted = `${cleaned.slice(0,2)}.${cleaned.slice(2,4)}.${cleaned.slice(4)}`;
        }
        return formatted;
    };

    const handleNext = async () => {
        if (name && surname && birthYear.length === 10) {
            try {
                const phoneNumber = await AsyncStorage.getItem('phoneNumber');
                console.log('Phone number from storage:', phoneNumber);
                if (!phoneNumber) throw new Error('Номер телефона не найден');

                // Преобразование даты в формат ISO (yyyy-mm-dd)
                const [day, month, year] = birthYear.split('.');
                const formattedDate = `${year}-${month}-${day}`;

                const requestData = {
                    phoneNumber,
                    name,
                    surname,
                    patronymic,
                    birthDate: formattedDate
                };

                console.log('Sending request to:', `${API_URL}/api/users/update-name`);
                console.log('Request data:', requestData);

                const response = await fetch(`${API_URL}/api/users/update-name`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                // Получаем текст ответа для детального анализа
                const responseText = await response.text();
                console.log('Response text:', responseText);

                if (!response.ok) {
                    let errorMessage = 'Ошибка при сохранении данных';
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                        console.log('Parsed error:', errorData);
                    } catch (parseError) {
                        console.log('Could not parse error response as JSON:', parseError);
                        errorMessage = responseText || errorMessage;
                    }
                    throw new Error(`HTTP ${response.status}: ${errorMessage}`);
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('Success response:', data);
                } catch (parseError) {
                    console.log('Could not parse success response as JSON:', parseError);
                    throw new Error('Получен некорректный ответ от сервера');
                }

                navigation.navigate('RegisterPassport');
            } catch (error) {
                console.error('Full error details:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);

                // Показываем более детальную ошибку пользователю
                alert(`Ошибка: ${error.message}`);
            }
        } else {
            console.log('Validation failed:', {
                name: !!name,
                surname: !!surname,
                birthYearLength: birthYear.length
            });
            alert('Заполните все поля корректно');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Введите ФИО и год рождения</Text>
            <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TextInput
                    ref={surnameRef}
                    placeholder="Фамилия"
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    value={surname}
                    onChangeText={setSurname}
                    onBlur={() => setSurname(capitalize(surname))}
                    style={styles.input}
                    returnKeyType="next"
                    onSubmitEditing={() => nameRef.current.focus()}
                />
                <TextInput
                    ref={nameRef}
                    placeholder="Имя"
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    value={name}
                    onChangeText={setName}
                    onBlur={() => setName(capitalize(name))}
                    style={styles.input}
                    returnKeyType="next"
                    onSubmitEditing={() => patronymicRef.current.focus()}
                />
                <TextInput
                    ref={patronymicRef}
                    placeholder="Отчество (необязательно)"
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    value={patronymic}
                    onChangeText={setPatronymic}
                    onBlur={() => setPatronymic(capitalize(patronymic))}
                    style={styles.input}
                    returnKeyType="next"
                    onSubmitEditing={() => birthYearRef.current.focus()}
                />
                <TextInput
                    ref={birthYearRef}
                    placeholder="Дата рождения"
                    placeholderTextColor="rgba(0,0,0,0.5)"
                    value={birthYear}
                    onChangeText={(text) => {
                        setBirthYear(formatDate(text));
                    }}
                    onBlur={() => setBirthYear(formatDate(birthYear))}
                    keyboardType="numeric"
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                />

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Далее</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
    formContainer: {
        flexGrow: 1,
    },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 12,
        borderRadius: 8, marginBottom: 15, fontSize: 16
    },
    button: {
        backgroundColor: '#4CAF50', padding: 16,
        borderRadius: 10, alignItems: 'center'
    },
    buttonText: { color: '#fff', fontSize: 18 }
});