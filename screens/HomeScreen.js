import React, { useState, useLayoutEffect, useEffect } from 'react';
import { API_URL } from '@env';
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
    RefreshControl,
    Alert
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function HomeScreen() {
    const route = useRoute();
    const selectedPlan = route.params?.plan;
    const [subscription, setSubscription] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [qrData, setQrData] = useState(Math.random().toString(36).slice(2, 12));
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState('');
    const [isInClub, setIsInClub] = useState(false);
    const [lockerNumber, setLockerNumber] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        setIsInClub(false);
    }, []);

    useEffect(() => {
        let timer;
        if (modalVisible) {
            timer = setTimeout(async () => {
                setModalVisible(false);
                const lockerNumber = Math.floor(Math.random() * 40) + 1;
                Alert.alert('Номер вашего шкафчика', `${lockerNumber}`);
                await AsyncStorage.setItem('lockerNumber', lockerNumber.toString());
                setLockerNumber(lockerNumber);
                setIsInClub(true);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [modalVisible]);

    const fetchUser = async () => {
        try {
            const phone = await AsyncStorage.getItem('phoneNumber');
            if (!phone) return;

            const response = await axios.get(`${API_URL}/api/users/phone/${phone}`);
            const user = response.data;
            if (user.subscription?.plan) {
                setSubscription(user.subscription.plan);
            }
            else {
                setSubscription('');
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '☀️ Доброе утро';
        if (hour < 18) return '🌤️ Добрый день';
        return '🌙 Добрый вечер';
    };

    return (
        <>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerButton} />
                    <Text style={styles.headerTitle}>Главная</Text>
                    <View style={styles.headerButton} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <View style={styles.avatarRow}>
                            <Image
                                source={require('../assets/avatar.png')}
                                style={styles.avatar}
                            />
                            <View style={styles.userInfo}>
                                <Text style={styles.name}>{userName || 'Пользователь'}</Text>
                                {subscription ? (
                                    <View style={[
                                        styles.planTag,
                                        subscription === 'Lite' && { backgroundColor: '#e0f7fa' },
                                        subscription === 'Medium' && { backgroundColor: '#fff9c4' },
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
                                ) : (
                                    <Text style={styles.noSubscription}>Без подписки</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Club Access Section */}
                    {subscription && (
                        <View style={styles.clubSection}>
                            <Text style={styles.sectionTitle}>Доступ в клуб</Text>

                            <View style={styles.banner}>
                                <Text style={styles.bannerEmoji}>🏋️‍♂️</Text>
                                <Text style={styles.bannerTitle}>Время тренироваться!</Text>
                                <Text style={styles.bannerSubtitle}>Покажи QR-код на входе</Text>
                            </View>

                            <TouchableOpacity style={styles.passButton} onPress={() => setModalVisible(true)}>
                                <View style={styles.passButtonContent}>
                                    <Text style={styles.passIcon}>🎫</Text>
                                    <Text style={styles.passButtonText}>Пропуск в клуб</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Status Info */}
                            <View style={styles.statusSection}>
                                <View style={styles.statusItem}>
                                    <Text style={styles.statusIcon}>📍</Text>
                                    <View>
                                        <Text style={styles.statusLabel}>Статус</Text>
                                        <Text style={[
                                            styles.statusValue,
                                            { color: isInClub ? '#4CAF50' : '#666' }
                                        ]}>
                                            {isInClub ? 'В клубе' : 'Не в клубе'}
                                        </Text>
                                    </View>
                                </View>

                                {isInClub && (
                                    <View style={styles.statusItem}>
                                        <Text style={styles.statusIcon}>🔒</Text>
                                        <View>
                                            <Text style={styles.statusLabel}>Шкафчик</Text>
                                            <Text style={styles.statusValue}>№ {lockerNumber}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Quick Actions */}
                    <View style={styles.quickActionsSection}>
                        <Text style={styles.sectionTitle}>Быстрые действия</Text>
                        <View style={styles.quickActions}>
                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('Расписание')}
                            >
                                <Text style={styles.actionIcon}>📅</Text>
                                <Text style={styles.actionTitle}>Расписание</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('Профиль')}
                            >
                                <Text style={styles.actionIcon}>👤</Text>
                                <Text style={styles.actionTitle}>Профиль</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('Оплата')}
                            >
                                <Text style={styles.actionIcon}>💳</Text>
                                <Text style={styles.actionTitle}>Оплата</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tariff Section */}
                    <View style={styles.tariffSection}>
                        <Text style={styles.sectionTitle}>
                            {subscription ? 'Улучшить подписку' : 'Выбери свой тариф'}
                        </Text>

                        <View style={styles.tariffRow}>
                            <TouchableOpacity
                                style={[styles.tariffCard, { backgroundColor: '#e0f7fa' }]}
                                onPress={() => navigation.navigate('Оплата', { plan: 'Lite' })}
                            >
                                <Text style={styles.tariffName}>Lite</Text>
                                <Text style={styles.tariffPrice}>1 200 ₽/мес</Text>
                                <Text style={styles.tariffDesc}>Базовый доступ в клуб</Text>
                                {subscription === 'Lite' && (
                                    <View style={styles.currentBadge}>
                                        <Text style={styles.currentBadgeText}>Текущий</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tariffCard, { backgroundColor: '#fff9c4' }]}
                                onPress={() => navigation.navigate('Оплата', { plan: 'Medium' })}
                            >
                                <Text style={styles.tariffName}>Medium</Text>
                                <Text style={styles.tariffPrice}>1 900 ₽/мес</Text>
                                <Text style={styles.tariffDesc}>Клуб + групповые</Text>
                                {subscription === 'Medium' && (
                                    <View style={styles.currentBadge}>
                                        <Text style={styles.currentBadgeText}>Текущий</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.tariffCardFull, { backgroundColor: '#ede7f6' }]}
                            onPress={() => navigation.navigate('Оплата', { plan: 'Pro' })}
                        >
                            <View style={styles.tariffCardContent}>
                                <View>
                                    <Text style={styles.tariffName}>Pro</Text>
                                    <Text style={styles.tariffPrice}>2 500 ₽/мес</Text>
                                    <Text style={styles.tariffDesc}>Всё включено + SPA</Text>
                                </View>
                                {subscription === 'Pro' && (
                                    <View style={styles.currentBadge}>
                                        <Text style={styles.currentBadgeText}>Текущий</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* QR Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Пропуск в клуб</Text>
                        <QRCode value={qrData} size={200} />
                        <View style={styles.modalInstructions}>
                            <Text style={styles.modalStep}>1️⃣ Приложи браслет к турникету</Text>
                            <Text style={styles.modalStep}>2️⃣ Поднеси QR код к табло</Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setQrData(Math.random().toString(36).slice(2, 12))}
                            >
                                <Text style={styles.modalButtonText}>🔄 Обновить</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCloseButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, styles.modalCloseButtonText]}>Закрыть</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

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
        width: 24,
        height: 24,
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
    greeting: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
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
    },
    noSubscription: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    clubSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        paddingLeft: 4,
    },
    banner: {
        backgroundColor: '#e8f5e9',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 12,
    },
    bannerEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#4caf50',
    },
    passButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    passButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    passIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    passButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    statusLabel: {
        fontSize: 12,
        color: '#666',
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    quickActionsSection: {
        marginTop: 16,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    tariffSection: {
        marginTop: 16,
        marginBottom: 24,
    },
    tariffRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    tariffCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    tariffCardFull: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tariffCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tariffName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tariffPrice: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#4CAF50',
    },
    tariffDesc: {
        fontSize: 12,
        color: '#666',
    },
    currentBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    currentBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '90%',
        maxWidth: 320,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    modalInstructions: {
        marginTop: 16,
        alignItems: 'center',
    },
    modalStep: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    modalButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
    },
    modalCloseButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },
    modalCloseButtonText: {
        color: '#666',
    },
});