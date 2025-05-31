import React, { useLayoutEffect, useEffect, useState } from 'react';
import { API_URL } from '@env';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Профиль',
      headerTitleAlign: 'center',
      headerLeft: () => null,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const phone = await AsyncStorage.getItem('phoneNumber');
        if (!phone) throw new Error('Телефон не найден в хранилище');

        const response = await axios.get(`${API_URL}/api/users/phone/${phone}`);
        const user = response.data;
        if (!user) return;

        const nameParts = user.fullName.split(' ');
        setUserName(nameParts[1] || nameParts[0]); // Показываем только имя
        setSubscription(user.subscription);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require('../assets/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userName}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {!loading && subscription && (
          <View style={styles.subscriptionContainer}>
            <Ionicons name="card-outline" size={32} color="#43A047" style={{ marginBottom: 8 }} />
            <Text style={styles.subscriptionTitle}>{subscription.plan} {subscription.duration}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="checkmark-circle" size={20} color="#43A047" style={{ marginRight: 4 }} />
              <Text style={{ color: '#43A047', fontSize: 13 }}>Активна</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color="#43A047" style={{ marginRight: 6 }} />
              <Text style={styles.subscriptionDate}>Следующий платеж: {new Date(subscription.endDate).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.supportButton}>
        <Text style={styles.supportButtonText}>Служба поддержки</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Start' }],
          });
        }}
      >
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  subscriptionContainer: {
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#43A047',
    marginBottom: 8,
  },
  subscriptionDate: {
    fontSize: 14,
    color: '#000',
  },
  supportButton: {
    marginBottom: 30,
    alignSelf: 'center',
    backgroundColor: '#43A047',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  logoutButton: {
    marginBottom: 40,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#D32F2F',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },

  logoutButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
