import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterPassportScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [series, setSeries] = useState('');
    const [number, setNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [deptCode, setDeptCode] = useState('');
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
      (async () => {
        const storedPhone = await AsyncStorage.getItem('phoneNumber');
        setPhoneNumber(storedPhone || '');
      })();
    }, []);

    const fetchSuggestions = async (query) => {
      if (!query) return setSuggestions([]);
      try {
        const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token eae2672524708c275ce6782bfab3f2641bd385ba'
          },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Ошибка при получении подсказок:', error);
        setSuggestions([]);
      }
    };

    const handleNext = async () => {
        console.log('Raw issueDate input:', issueDate);

        if (series.length === 4 && number.length === 6) {
            try {
                // Валидация и форматирование даты
                let formattedIssueDate = '';
                if (!issueDate || issueDate.length !== 10) {
                    throw new Error('Введите дату выдачи в формате ДД.ММ.ГГГГ');
                }

                // Проверяем формат даты
                const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
                const match = issueDate.match(dateRegex);

                if (!match) {
                    throw new Error('Неверный формат даты. Используйте ДД.ММ.ГГГГ');
                }

                const [, day, month, year] = match;
                const dayNum = parseInt(day);
                const monthNum = parseInt(month);
                const yearNum = parseInt(year);

                console.log('Parsed date parts:', { day: dayNum, month: monthNum, year: yearNum });

                // Валидация частей даты
                if (dayNum < 1 || dayNum > 31) {
                    throw new Error('День должен быть от 01 до 31');
                }
                if (monthNum < 1 || monthNum > 12) {
                    throw new Error('Месяц должен быть от 01 до 12');
                }
                if (yearNum < 1950 || yearNum > 2030) {
                    throw new Error('Год должен быть от 1950 до 2030');
                }

                // Дополнительная проверка валидности даты
                const testDate = new Date(yearNum, monthNum - 1, dayNum);
                if (testDate.getDate() !== dayNum ||
                    testDate.getMonth() !== monthNum - 1 ||
                    testDate.getFullYear() !== yearNum) {
                    throw new Error('Такой даты не существует');
                }

                formattedIssueDate = `${year}-${month}-${day}`;
                console.log('Valid formatted date:', formattedIssueDate);

                const formData = new FormData();
                formData.append('phoneNumber', phoneNumber);
                formData.append('series', series);
                formData.append('number', number);
                formData.append('issueDate', formattedIssueDate);
                formData.append('deptCode', deptCode);
                formData.append('address', address);

                console.log('Sending valid passport data:', {
                    phoneNumber,
                    series,
                    number,
                    issueDate: formattedIssueDate,
                    deptCode,
                    address
                });

                const response = await fetch(`${API_URL}/api/users/update-passport`, {
                    method: 'POST',
                    body: formData,
                });

                console.log('Passport upload status:', response.status);
                const responseText = await response.text();
                console.log('Passport upload response:', responseText);

                if (!response.ok) {
                    let errorMessage = 'Ошибка при отправке данных';
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = responseText || errorMessage;
                    }
                    throw new Error(`HTTP ${response.status}: ${errorMessage}`);
                }

                const data = JSON.parse(responseText);
                console.log('Passport update success:', data);
                Alert.alert('Успешно', 'Паспортные данные сохранены', [
                  { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) }
                ]);
                return;
            } catch (error) {
                console.error('Ошибка:', error.message);
                alert(error.message);
                return;
            }
        } else {
            alert('Заполните все поля корректно:\n- Серия: 4 цифры\n- Номер: 6 цифр\n- Дата: ДД.ММ.ГГГГ');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Введите паспортные данные</Text>
            <TextInput
              placeholder="Телефон"
              value={phoneNumber}
              editable={false}
              style={styles.input}
              placeholderTextColor="rgba(0,0,0,0.5)"
            />
            <KeyboardAvoidingView
              style={styles.formContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 60}
            >
            <TextInput
                placeholder="Серия (4 цифры)"
                placeholderTextColor="rgba(0,0,0,0.5)"
                keyboardType="numeric"
                value={series}
                onChangeText={(text) => setSeries(text.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
            />

            <TextInput
                placeholder="Номер (6 цифр)"
                placeholderTextColor="rgba(0,0,0,0.5)"
                keyboardType="numeric"
                value={number}
                onChangeText={(text) => setNumber(text.replace(/\D/g, '').slice(0, 6))}
                style={styles.input}
            />

            <TextInput
                placeholder="Дата выдачи"
                placeholderTextColor="rgba(0,0,0,0.5)"
                value={issueDate}
                onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').slice(0, 8);
                    let formatted = cleaned;
                    if (cleaned.length >= 3 && cleaned.length <= 4) {
                        formatted = `${cleaned.slice(0,2)}.${cleaned.slice(2)}`;
                    } else if (cleaned.length >= 5 && cleaned.length <= 8) {
                        formatted = `${cleaned.slice(0,2)}.${cleaned.slice(2,4)}.${cleaned.slice(4)}`;
                    }
                    setIssueDate(formatted);
                }}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                placeholder="Код подразделения"
                placeholderTextColor="rgba(0,0,0,0.5)"
                value={deptCode}
                onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').slice(0, 6);
                    let formatted = cleaned;
                    if (cleaned.length > 3) {
                        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
                    }
                    setDeptCode(formatted);
                }}
                keyboardType="numeric"
                style={styles.input}
            />

            <View style={styles.addressContainer}>
              <TextInput
                  placeholder="Адрес регистрации"
                  placeholderTextColor="rgba(0,0,0,0.5)"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    fetchSuggestions(text);
                  }}
                  style={styles.input}
              />
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableWithoutFeedback onPress={() => {
                    setAddress(item.value);
                    setSuggestions([]);
                  }}>
                    <View style={styles.suggestionItem}>
                      <Text>{item.value}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                )}
                style={styles.suggestionList}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Отправить</Text>
            </TouchableOpacity>
           </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32, justifyContent: 'flex-start', backgroundColor: '#fff' },
    formContainer: {
      flexGrow: 1,
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 24,
        fontWeight: '600',
        color: '#333'
    },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 12,
        borderRadius: 8, marginBottom: 15, fontSize: 16
    },
    button: {
        backgroundColor: '#4CAF50', padding: 16,
        borderRadius: 10, alignItems: 'center'
    },
    buttonText: { color: '#fff', fontSize: 18 },
    photoLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    photoButton: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10
    },
    photoButtonText: {
        fontSize: 16,
        color: '#333'
    },
    addressContainer: {
      position: 'relative',
      marginBottom: 15
    },
    suggestionList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      maxHeight: 150,
    },
    suggestionItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee'
    },
});