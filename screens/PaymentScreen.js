import React, { useState, useLayoutEffect, useRef } from 'react';
import { API_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function PaymentScreen() {
    const route = useRoute();
    const navigation = useNavigation();

    const [selectedPlan, setSelectedPlan] = useState(route.params?.plan || 'Lite');
    const [currentPlan, setCurrentPlan] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [featuresModalVisible, setFeaturesModalVisible] = useState(false);

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [showCvv, setShowCvv] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState('1 месяц');
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const expiryRef = useRef(null);
    const cvvRef = useRef(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Конструктор подписки',
            headerStyle: {
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            },
            headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
                color: '#333',
            }
        });
    }, [navigation]);

    const loadUserSubscription = async () => {
        try {
            const phone = await AsyncStorage.getItem('userPhone');
            if (!phone) return;
            const res = await fetch(`${API_URL}/api/users/phone/${phone}`);
            const user = await res.json();
            if (user?.subscription?.plan) {
                setCurrentPlan(user.subscription.plan);
            }
        } catch (err) {
            console.error('Ошибка при загрузке подписки:', err);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadUserSubscription();
        }, [])
    );

    const getPrice = () => {
        const basePrice = selectedPlan === 'Lite' ? 1200 : selectedPlan === 'Medium' ? 1900 : 2500;
        const multiplier = selectedDuration === '3 месяца' ? 3 : selectedDuration === '12 месяцев' ? 12 : 1;
        const rawPrice = basePrice * multiplier;

        if (selectedDuration === '3 месяца') return { old: rawPrice, current: Math.round(rawPrice * 0.85) };
        if (selectedDuration === '12 месяцев') return { old: rawPrice, current: Math.round(rawPrice * 0.75) };
        return { current: rawPrice };
    };

    const handlePayment = async () => {
        const basePrice = selectedPlan === 'Lite' ? 1200 : selectedPlan === 'Medium' ? 1900 : 2500;
        const multiplier = selectedDuration === '3 месяца' ? 3 : selectedDuration === '12 месяцев' ? 12 : 1;
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + multiplier);

        try {
            const phone = await AsyncStorage.getItem('userPhone');
            if (!phone) throw new Error('Телефон не найден');
            const resUser = await fetch(`${API_URL}/api/users/phone/${phone}`);
            const userData = await resUser.json();
            const userId = userData._id;

            const response = await fetch(`${API_URL}/api/users/update-subscription/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: selectedPlan,
                    durationInMonths: multiplier,
                    duration: selectedDuration,
                    startDate: now.toISOString(),
                    endDate: endDate.toISOString()
                })
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response:', responseText);

            if (!response.ok) {
                throw new Error(`Ошибка API: ${response.status}`);
            }

            console.log('Оплата прошла успешно');
            route.params?.onPaymentSuccess?.(selectedPlan);
            await loadUserSubscription();
            setSuccessModalVisible(true);
        } catch (err) {
            console.error('Ошибка при обновлении подписки:', err);
            alert(`Ошибка: ${err.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Subscription Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Подписка</Text>
                        <TouchableOpacity onPress={() => setShowPlanModal(true)}>
                            <Text style={styles.changeButton}>Сменить</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Тариф</Text>
                        <View style={styles.planTransition}>
                            {(currentPlan && currentPlan !== 'NaN' && currentPlan !== null) ? (
                                <View style={styles.planFlow}>
                                    <View style={[
                                        styles.planTag,
                                        currentPlan === 'Lite' && { backgroundColor: '#e0f7fa' },
                                        currentPlan === 'Medium' && { backgroundColor: '#fff9c4' },
                                        currentPlan === 'Pro' && { backgroundColor: '#ede7f6' },
                                    ]}>
                                        <Text style={[
                                            styles.planTagText,
                                            currentPlan === 'Lite' && { color: '#00838f' },
                                            currentPlan === 'Medium' && { color: '#388e3c' },
                                            currentPlan === 'Pro' && { color: '#5e35b1' },
                                        ]}>
                                            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.arrow}>→</Text>
                                </View>
                            ) : (
                                <View style={styles.planFlow}>
                                    <Text style={styles.noPlan}>Нет</Text>
                                    <Text style={styles.arrow}>→</Text>
                                </View>
                            )}
                            <View style={[
                                styles.planTag,
                                selectedPlan === 'Lite' && { backgroundColor: '#e0f7fa' },
                                selectedPlan === 'Medium' && { backgroundColor: '#fff9c4' },
                                selectedPlan === 'Pro' && { backgroundColor: '#ede7f6' },
                            ]}>
                                <Text style={[
                                    styles.planTagText,
                                    selectedPlan === 'Lite' && { color: '#00838f' },
                                    selectedPlan === 'Medium' && { color: '#388e3c' },
                                    selectedPlan === 'Pro' && { color: '#5e35b1' },
                                ]}>
                                    {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1).toLowerCase()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Длительность</Text>
                        <Text style={styles.infoValue}>{selectedDuration}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Следующий платёж</Text>
                        <Text style={styles.infoValue}>
                            {moment().add(
                                selectedDuration === '12 месяцев' ? 12 :
                                    selectedDuration === '3 месяца' ? 3 : 1,
                                'months'
                            ).format('DD.MM.YYYY')}
                        </Text>
                    </View>
                </View>

                {/* Duration Selection Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Выберите срок подписки</Text>
                    <View style={styles.durationGrid}>
                        {[
                            { label: '1 месяц' },
                            { label: '3 месяца', sale: '−15%' },
                            { label: '12 месяцев', sale: '−25%' }
                        ].map(({ label, sale }) => (
                            <TouchableOpacity
                                key={label}
                                style={[
                                    styles.durationOption,
                                    selectedDuration === label && styles.selectedDuration
                                ]}
                                onPress={() => setSelectedDuration(label)}
                            >
                                <Text style={[
                                    styles.durationText,
                                    selectedDuration === label && styles.selectedDurationText
                                ]}>
                                    {label}
                                </Text>
                                {sale && (
                                    <View style={[
                                        styles.saleTag,
                                        selectedDuration === label && styles.selectedSaleTag
                                    ]}>
                                        <Text style={[
                                            styles.saleText,
                                            selectedDuration === label && styles.selectedSaleText
                                        ]}>
                                            {sale}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Payment Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Данные карты</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Номер карты</Text>
                        <TextInput
                            style={styles.input}
                            value={cardNumber}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/\D+/g, '').slice(0, 16);
                                const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';
                                setCardNumber(formatted);
                                if (cleaned.length === 16) {
                                    expiryRef.current?.focus();
                                }
                            }}
                            placeholder="1234 5678 9012 3456"
                            keyboardType="number-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>Срок действия</Text>
                            <TextInput
                                ref={expiryRef}
                                style={styles.input}
                                value={expiry}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D+/g, '').slice(0, 4);
                                    const formatted = cleaned.length > 2 ? `${cleaned.slice(0,2)}/${cleaned.slice(2)}` : cleaned;
                                    setExpiry(formatted);
                                    if (cleaned.length === 4) {
                                        cvvRef.current?.focus();
                                    }
                                }}
                                placeholder="MM/YY"
                                keyboardType="number-pad"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>CVV</Text>
                            <View style={styles.cvvContainer}>
                                <TextInput
                                    ref={cvvRef}
                                    style={[styles.input, styles.cvvInput]}
                                    value={cvv}
                                    onChangeText={(text) => setCvv(text.replace(/\D+/g, '').slice(0, 3))}
                                    placeholder="123"
                                    secureTextEntry={!showCvv}
                                    keyboardType="number-pad"
                                    placeholderTextColor="#999"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowCvv(!showCvv)}
                                    style={styles.eyeButton}
                                >
                                    <Text style={styles.eyeIcon}>{showCvv ? '👁️' : '🙈'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Итого к оплате</Text>
                    <View style={styles.priceContainer}>
                        {'old' in getPrice() && (
                            <Text style={styles.oldPrice}>{getPrice().old} ₽</Text>
                        )}
                        <Text style={styles.currentPrice}>{getPrice().current} ₽</Text>
                    </View>
                    <Text style={styles.nextPayment}>
                        Следующий платёж: {moment().add(
                        selectedDuration === '12 месяцев' ? 12 :
                            selectedDuration === '3 месяца' ? 3 : 1,
                        'months'
                    ).format('DD.MM.YYYY')}
                    </Text>
                    {selectedDuration !== '1 месяц' && (
                        <Text style={styles.discountInfo}>
                            Скидка применена автоматически при оплате за {selectedDuration.toLowerCase()}.
                        </Text>
                    )}
                </View>

                <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                    <Text style={styles.payButtonText}>💳 Оплатить {getPrice().current} ₽</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setFeaturesModalVisible(true)}
                    style={styles.featuresButton}
                >
                    <Text style={styles.featuresButtonText}>ℹ️ Что входит в подписку?</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Features Modal */}
            <Modal
                visible={featuresModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setFeaturesModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Что входит в подписку</Text>
                        <Text style={styles.modalPlanName}>
                            {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1).toLowerCase()}
                        </Text>

                        <ScrollView style={styles.featuresList}>
                            {selectedPlan === 'Lite' && (
                                <>
                                    <Text style={styles.featureItem}>🏋️ Доступ в тренажёрный зал с 6:00 до 24:00</Text>
                                    <Text style={styles.featureItem}>👥 1 групповое занятие в неделю</Text>
                                    <Text style={styles.featureItem}>💪 Консультация тренера 1 раз в месяц</Text>
                                </>
                            )}
                            {selectedPlan === 'Medium' && (
                                <>
                                    <Text style={styles.featureItem}>🏋️ Безлимитный доступ в тренажёрный зал</Text>
                                    <Text style={styles.featureItem}>👥 Неограниченное количество групповых занятий</Text>
                                    <Text style={styles.featureItem}>💪 1 персональная тренировка в месяц</Text>
                                    <Text style={styles.featureItem}>❄️ Бесплатная заморозка до 7 дней</Text>
                                    <Text style={styles.featureItem}>📊 Тестовая диагностика состава тела</Text>
                                    <Text style={styles.featureItem}>🍎 Доступ к программе питания в приложении</Text>
                                </>
                            )}
                            {selectedPlan === 'Pro' && (
                                <>
                                    <Text style={styles.featureItem}>✨ Всё из Medium</Text>
                                    <Text style={styles.featureItem}>💪 3 персональные тренировки в неделю</Text>
                                    <Text style={styles.featureItem}>🍎 Индивидуальный план питания</Text>
                                    <Text style={styles.featureItem}>💬 Личный куратор (чат в приложении)</Text>
                                    <Text style={styles.featureItem}>❄️ Бесплатная заморозка до 30 дней</Text>
                                    <Text style={styles.featureItem}>🧖‍♀️ Доступ к SPA-зоне</Text>
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setFeaturesModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Plan Selection Modal */}
            <Modal
                visible={showPlanModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowPlanModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Выберите подписку</Text>

                        <View style={styles.plansList}>
                            {['Lite', 'Medium', 'Pro'].map(plan => (
                                <TouchableOpacity
                                    key={plan}
                                    onPress={() => {
                                        setSelectedPlan(plan);
                                        setShowPlanModal(false);
                                    }}
                                    style={[
                                        styles.planOption,
                                        selectedPlan === plan && styles.selectedPlanOption
                                    ]}
                                >
                                    <View style={[
                                        styles.planTag,
                                        plan === 'Lite' && { backgroundColor: '#e0f7fa' },
                                        plan === 'Medium' && { backgroundColor: '#fff9c4' },
                                        plan === 'Pro' && { backgroundColor: '#ede7f6' }
                                    ]}>
                                        <Text style={[
                                            styles.planTagText,
                                            plan === 'Lite' && { color: '#00838f' },
                                            plan === 'Medium' && { color: '#388e3c' },
                                            plan === 'Pro' && { color: '#5e35b1' }
                                        ]}>
                                            {plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.planPrice}>
                                        {plan === 'Lite' ? '1 200' : plan === 'Medium' ? '1 900' : '2 500'} ₽/мес
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowPlanModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={successModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSuccessModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.successEmoji}>🎉</Text>
                        <Text style={styles.successTitle}>Оплата прошла успешно!</Text>
                        <Text style={styles.successMessage}>
                            Вы оплатили подписку <Text style={styles.successPlan}>{selectedPlan}</Text> на <Text style={styles.successDuration}>{selectedDuration}</Text>
                        </Text>
                        <Text style={styles.celebrationEmojis}>🎊🎈🥳</Text>

                        <TouchableOpacity
                            onPress={() => {
                                setSuccessModalVisible(false);
                                navigation.navigate('MainTabs', { screen: 'Home' });
                            }}
                            style={styles.successButton}
                        >
                            <Text style={styles.successButtonText}>Перейти на главную</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    card: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    changeButton: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    planTransition: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planFlow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 8,
    },
    noPlan: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    planTag: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
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
    durationGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    durationOption: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedDuration: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    durationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    selectedDurationText: {
        color: '#fff',
    },
    saleTag: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    selectedSaleTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    saleText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    selectedSaleText: {
        color: '#fff',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    cvvContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cvvInput: {
        flex: 1,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    eyeIcon: {
        fontSize: 18,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    oldPrice: {
        fontSize: 18,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    currentPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    nextPayment: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    discountInfo: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    featuresButton: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    featuresButtonText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalPlanName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        textAlign: 'center',
        marginBottom: 16,
    },
    featuresList: {
        marginBottom: 20,
        maxHeight: 200,
    },
    featureItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    plansList: {
        marginBottom: 20,
    },
    planOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedPlanOption: {
        backgroundColor: '#e8f5e9',
        borderColor: '#4CAF50',
    },
    planPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    modalCloseButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalCloseText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    successEmoji: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    successPlan: {
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    successDuration: {
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    celebrationEmojis: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 20,
    },
    successButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    successButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
