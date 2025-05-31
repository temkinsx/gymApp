import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    RefreshControl
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// To hide the header, set headerShown: false in the navigator configuration for HomeScreen.
export default function HomeScreen() {
    const route = useRoute();
    const selectedPlan = route.params?.plan;
    const [subscription, setSubscription] = useState('Lite');
    const [modalVisible, setModalVisible] = useState(false);
    const [qrData, setQrData] = useState(Math.random().toString(36).slice(2, 12));
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('');
    const navigation = useNavigation();

    const fetchUser = async () => {
      try {
        const phone = await AsyncStorage.getItem('phoneNumber');
        if (!phone) return;

        const response = await axios.get(`http://150.241.96.229:5000/api/users/phone/${phone}`);
        const user = response.data;
        if (user.subscription?.plan) {
          setSubscription(user.subscription.plan);
        }
        if (user.fullName) {
          const parts = user.fullName.trim().split(' ');
          setUserName(parts[1] || parts[0]); // берём имя
        }
      } catch (error) {
        console.error('Ошибка при получении подписки:', error);
      }
    };

    useFocusEffect(
      React.useCallback(() => {
        fetchUser();
      }, [])
    );

    const onRefresh = async () => {
      setRefreshing(true);
      await fetchUser();
      setRefreshing(false);
    };

    const getSubscriptionColor = (type) => {
        switch (type) {
            case 'Lite':
                return '#d0f0c0';
            case 'Medium':
                return '#ffe082';
            case 'Pro':
                return '#d1c4e9';
            default:
                return '#ccc';
        }
    };

    return (
        <>
        <ScrollView
            style={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={[styles.avatarRow, { marginBottom: 16 }]}>
                <Image
                    source={require('../assets/avatar.png')}
                    style={styles.avatar}
                />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.name}>{userName}</Text>
                    <View style={[
                      styles.planTag,
                      subscription === 'Lite' && { backgroundColor: '#e0f7fa' },
                      subscription === 'Medium' && { backgroundColor: '#e8f5e9' },
                      subscription === 'Pro' && { backgroundColor: '#ede7f6' }
                    ]}>
                      <Text style={[
                        styles.planTagText,
                        subscription === 'Lite' && { color: '#00838f' },
                        subscription === 'Medium' && { color: '#388e3c' },
                        subscription === 'Pro' && { color: '#5e35b1' }
                      ]}>
                        {subscription.charAt(0).toUpperCase() + subscription.slice(1).toLowerCase()}
                      </Text>
                    </View>
                </View>
            </View>
            <View style={styles.cardBlock}>
                <View style={styles.banner}>
                    <Text style={styles.bannerText}>Тут будет баннер</Text>
                </View>

                <TouchableOpacity style={styles.passButton} onPress={() => setModalVisible(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('../assets/club-pass-icon.png')}
                            style={styles.passIcon}
                        />
                        <Text style={styles.passButtonText}>Пропуск в клуб</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.tariffBlock}>
                <Text style={styles.tariffTitle}>Выбери свой тариф</Text>
                <View style={styles.tariffRow}>
                    <TouchableOpacity
                        style={[styles.tariffCard, { backgroundColor: '#b2ebf2' }]}
                        onPress={() => navigation.navigate('Оплата', { plan: 'Lite' })}
                    >
                        <Text style={styles.tariffName}>Lite</Text>
                        <Text style={styles.tariffPrice}>1 200 ₽/мес</Text>
                        <Text style={styles.tariffDesc}>Базовый доступ в клуб</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tariffCard, { backgroundColor: '#ffe082' }]}
                        onPress={() => navigation.navigate('Оплата', { plan: 'Medium' })}
                    >
                        <Text style={styles.tariffName}>Medium</Text>
                        <Text style={styles.tariffPrice}>1 900 ₽/мес</Text>
                        <Text style={styles.tariffDesc}>Клуб + групповые занятия</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.tariffCard, { backgroundColor: '#d1c4e9', marginTop: 12 }]}
                    onPress={() => navigation.navigate('Оплата', { plan: 'Pro' })}
                >
                    <Text style={styles.tariffName}>Pro</Text>
                    <Text style={styles.tariffPrice}>2 500 ₽/мес</Text>
                    <Text style={styles.tariffDesc}>Всё включено + SPA</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>

        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <QRCode value={qrData} size={200} />
                    <Text style={styles.modalText}>1. Приложи браслет к турникету</Text>
                    <Text style={styles.modalText}>2. Поднеси QR код к табло</Text>
                    <TouchableOpacity
                        style={styles.updateBtn}
                        onPress={() => setQrData(Math.random().toString(36).slice(2, 12))}
                    >
                        <Text style={styles.updateBtnText}>Обновить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.updateBtn} onPress={() => setModalVisible(false)}>
                        <Text style={styles.updateBtnText}>Закрыть</Text>
                    </TouchableOpacity>
 к               </View>
            </View>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ccc',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
    },
    planTag: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignSelf: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 2,
    },
    planTagText: {
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'none',
    },
    cardScroll: {
        marginVertical: 20
    },
    card: {
        backgroundColor: '#b2dfdb',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: 150,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 14
    },
    passButton: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20
    },
    passButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    sectionText: {
        color: '#555',
        marginBottom: 8
    },
    link: {
        color: '#4caf50',
        fontWeight: '600'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderRadius: 24,
        alignItems: 'center',
        width: '90%',
        maxWidth: 400
    },
    modalText: {
        marginTop: 16,
        fontSize: 14,
        textAlign: 'center',
        color: '#333'
    },
    updateBtn: {
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginTop: 16
    },
    updateBtnText: {
        color: 'white',
        fontWeight: '600'
    },
    banner: {
        backgroundColor: '#d1f5d3',
        padding: 24,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
        height: 160,
        justifyContent: 'center'
    },
    bannerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2e7d32'
    },
    passIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
        tintColor: 'white'
    },
    cardBlock: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    tariffBlock: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    tariffTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12
    },
    tariffRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tariffCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        marginRight: 12
    },
    tariffName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6
    },
    tariffPrice: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4
    },
    tariffDesc: {
        fontSize: 13,
        color: '#444',
    }
});