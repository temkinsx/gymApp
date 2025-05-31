import { API_URL } from '@env';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function SubscriptionScreen() {
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const userId = '683997e2027136b5d13e2774'; // временно захардкожен
                const response = await axios.get(`${API_URL}/api/users/${userId}`);
                setSubscription(response.data.subscription);
            } catch (error) {
                console.error('Ошибка при получении подписки:', error);
            }
        };

        fetchSubscription();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Image source={require('../assets/gym_banner.png')} style={styles.banner} resizeMode="cover" />
                <Text style={styles.title}>Текущий абонемент</Text>

                <View style={styles.feature}>
                    <FontAwesome5 name="id-card" size={20} color="#4CAF50" style={styles.icon} />
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.featureText}>
                            {subscription ? `Подписка: ${subscription.plan} — ${subscription.duration}` : 'Загрузка...'}
                        </Text>
                        {subscription?.endDate && (
                            <Text style={[styles.featureText, { marginLeft: 32, fontSize: 14, color: '#777' }]}>
                                Следующий платёж: {moment(subscription.endDate).format('DD.MM.YYYY')}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.feature}>
                    <Ionicons name="calendar" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.featureText}>
                      {subscription?.endDate
                        ? `Активен до ${moment(subscription.endDate).format('DD.MM.YYYY')}`
                        : 'Дата окончания недоступна'}
                    </Text>
                </View>

                <View style={styles.feature}>
                    <MaterialIcons name="verified-user" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.featureText}>Статус: Активен</Text>
                </View>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Безлимитный доступ к тренировкам</Text>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        overflow: 'hidden'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
        marginBottom: 20,
        textAlign: 'center'
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14
    },
    icon: {
        marginRight: 12
    },
    featureText: {
        fontSize: 16,
        color: '#444'
    },
    badge: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center'
    },
    badgeText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '500'
    },
    banner: {
        marginBottom: 20,
        width: '100%',
        height: 200,
        borderRadius: 12
    }
});