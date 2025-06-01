import React, { useLayoutEffect, useEffect, useState } from 'react';
import { API_URL } from '@env';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [subColor, setSubColor] = useState('#BDBDBD');
  const [subscriptionTextColor, setSubscriptionTextColor] = useState('#000');

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

        const nameParts = user.fullName ? user.fullName.split(' ') : [];
        setUserName(nameParts[1] || nameParts[0] || 'Пользователь');
        setUserFullName(user.fullName || 'Имя не указано');
        setSubscription(user.subscription);

        let subColor = '#f5f5f5'; // default
        if (user.subscription?.plan === 'Pro') {
          subColor = '#d1c4e9'; // фиолетовый
          setSubscriptionTextColor('#000');
        } else if (user.subscription?.plan === 'Medium') {
          subColor = '#ffe082'; // жёлтый
          setSubscriptionTextColor('#000');
        } else if (user.subscription?.plan === 'Lite') {
          subColor = '#d0f0c0'; // светло-зелёный
          setSubscriptionTextColor('#000');
        }
        setSubColor(subColor);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const menuItems = [
    {
      id: 'subscription',
      title: 'Управление подпиской',
      icon: '💳',
      onPress: () => navigation.navigate('Оплата'),
    }
  ];

  return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Image
                  source={require('../assets/avatar.png')}
                  style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userFullName}>{userFullName}</Text>
              </View>
            </View>
          </View>

          {/* Subscription Card */}
          {!loading && subscription && (
              <View style={styles.subscriptionSection}>
                <Text style={styles.sectionTitle}>Подписка</Text>
                <View style={[styles.subscriptionCard, { backgroundColor: subColor }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: subscriptionTextColor }]}>
                      {subscription.plan} {subscription.duration}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: subscriptionTextColor }]}>Активна</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.calendarIcon}>📅</Text>
                    <Text style={[styles.cardFooterText, { color: subscriptionTextColor }]}>
                      Следующий платеж: {new Date(subscription.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Меню</Text>
            {menuItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
            ))}
          </View>

          {/* Support Button */}
          <View style={styles.supportSection}>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportIcon}>💬</Text>
              <Text style={styles.supportButtonText}>Служба поддержки</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
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
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 4,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userFullName: {
    fontSize: 14,
    color: '#666',
  },
  subscriptionSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingLeft: 4,
  },
  subscriptionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cardFooterText: {
    fontSize: 14,
  },
  menuSection: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuArrow: {
    fontSize: 16,
    color: '#666',
  },
  supportSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;