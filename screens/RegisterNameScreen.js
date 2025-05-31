import { API_URL } from '@env';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterNameScreen() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const navigation = useNavigation();

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

                const response = await fetch(`${API_URL}/api/users/update-name`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phoneNumber,
                        name,
                        surname,
                        patronymic,
                        birthDate: formattedDate
                    }),
                });

                if (!response.ok) {
                    throw new Error('Ошибка при сохранении данных');
                }

                const data = await response.json();
                // при необходимости: сохранить userId в AsyncStorage или Context

                navigation.navigate('RegisterPassport');
            } catch (error) {
                console.error(error);
                alert('Ошибка при подключении к серверу');
            }
        } else {
            alert('Заполните все поля корректно');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Введите ФИО и год рождения</Text>

            <TextInput
                placeholder="Фамилия"
                value={surname}
                onChangeText={setSurname}
                onBlur={() => setSurname(capitalize(surname))}
                style={styles.input}
            />
            <TextInput
                placeholder="Имя"
                value={name}
                onChangeText={setName}
                onBlur={() => setName(capitalize(name))}
                style={styles.input}
            />
            <TextInput
                placeholder="Отчество (необязательно)"
                value={patronymic}
                onChangeText={setPatronymic}
                onBlur={() => setPatronymic(capitalize(patronymic))}
                style={styles.input}
            />
            <TextInput
                placeholder="Дата рождения"
                value={birthYear}
                onChangeText={(text) => {
                    setBirthYear(formatDate(text));
                }}
                onBlur={() => setBirthYear(formatDate(birthYear))}
                keyboardType="numeric"
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Далее</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 22, textAlign: 'center', marginBottom: 20 },
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