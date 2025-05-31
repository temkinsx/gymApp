import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback, Alert, Image, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';

export default function RegisterPassportScreen() {
    const [series, setSeries] = useState('');
    const [number, setNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [deptCode, setDeptCode] = useState('');
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const navigation = useNavigation();

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

    const handleAttachPhoto = async () => {
      const options = ['Сделать фото', 'Выбрать из галереи', 'Отмена'];
      const cancelButtonIndex = 2;

      const choice = await new Promise((resolve) => {
        Alert.alert(
          'Прикрепить фото',
          'Выберите источник',
          [
            { text: options[0], onPress: () => resolve('camera') },
            { text: options[1], onPress: () => resolve('gallery') },
            { text: options[2], style: 'cancel', onPress: () => resolve(null) },
          ],
          { cancelable: true }
        );
      });

      if (choice === 'camera') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
        });
        if (!result.canceled) {
          setPhoto(result.assets[0].uri);
        }
      }

      if (choice === 'gallery') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
        });
        if (!result.canceled) {
          setPhoto(result.assets[0].uri);
        }
      }
    };

    const handleNext = async () => {
        if (series.length === 4 && number.length === 6) {
            const formData = new FormData();
            formData.append('series', series);
            formData.append('number', number);
            formData.append('issueDate', issueDate);
            formData.append('deptCode', deptCode);
            formData.append('address', address);
            if (photo) {
                formData.append('passportPhoto', {
                    uri: photo,
                    type: 'image/jpeg',
                    name: 'passport.jpg',
                });
            }

            try {
                const response = await fetch(`${API_URL}/api/user/passport`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при отправке данных');
                }
            } catch (error) {
                console.error('Ошибка отправки:', error);
                alert('Не удалось отправить данные');
                return;
            }
            navigation.navigate('RegisterPhoto');
        } else {
            alert('Введите корректные паспортные данные');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Введите паспортные данные</Text>

            <TextInput
                placeholder="Серия (4 цифры)"
                keyboardType="numeric"
                value={series}
                onChangeText={(text) => setSeries(text.replace(/\D/g, '').slice(0, 4))}
                style={styles.input}
            />

            <TextInput
                placeholder="Номер (6 цифр)"
                keyboardType="numeric"
                value={number}
                onChangeText={(text) => setNumber(text.replace(/\D/g, '').slice(0, 6))}
                style={styles.input}
            />

            <TextInput
                placeholder="Дата выдачи"
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

            <TouchableOpacity style={styles.photoButton} onPress={handleAttachPhoto}>
              <Text style={styles.photoButtonText}>Прикрепить фото</Text>
            </TouchableOpacity>
            {photo && (
      <>
        <TouchableOpacity onPress={() => setPreviewVisible(true)} style={{ marginBottom: 10 }}>
          <Image source={{ uri: photo }} style={{ width: 80, height: 80, borderRadius: 6 }} />
        </TouchableOpacity>
        <Modal visible={previewVisible} transparent={true}>
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center'
          }}>
            <Pressable onPress={() => setPreviewVisible(false)} style={{ flex: 1, width: '100%' }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
            </Pressable>
          </View>
        </Modal>
      </>
    )}

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Отправить</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 32, justifyContent: 'center', backgroundColor: '#f4f4f4' },
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