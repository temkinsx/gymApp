import 'react-native-dotenv';
import React, { useState, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
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

    useLayoutEffect(() => {
      navigation.setOptions({ title: 'Конструктор подписки' });
    }, [navigation]);

    // Вынесенная функция загрузки подписки пользователя
    const loadUserSubscription = async () => {
      try {
        const phone = await AsyncStorage.getItem('userPhone');
        if (!phone) return;

        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/phone/${phone}`);
        const user = await res.json();
        console.log('USER AFTER PAYMENT:', user);
        if (user?.subscription?.plan) {
          setCurrentPlan(user.subscription.plan);
          // Удалено: setSelectedPlan(user.subscription.plan);
        }
      } catch (err) {
        console.error('Ошибка при загрузке подписки:', err);
      }
    };

    // useEffect(() => {
    //   loadUserSubscription();
    // }, []);

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
      const total = selectedDuration === '3 месяца' ? Math.round(basePrice * 3 * 0.85)
                    : selectedDuration === '12 месяцев' ? Math.round(basePrice * 12 * 0.75)
                    : basePrice;

      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + multiplier);

      try {
        const phone = await AsyncStorage.getItem('userPhone');
        if (!phone) throw new Error('Телефон не найден');

        const resUser = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/phone/${phone}`);
        const userData = await resUser.json();
        const userId = userData._id;

        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/update-subscription/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: selectedPlan,
            duration: selectedDuration,
            startDate: now.toISOString(),
            endDate: endDate.toISOString()
          })
        });

        route.params?.onPaymentSuccess?.(selectedPlan);
        await loadUserSubscription();
        setSuccessModalVisible(true);
      } catch (err) {
        console.error('Ошибка при обновлении подписки:', err);
      }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <View style={{ flexGrow: 1, paddingBottom: 140 }}>
                <View style={styles.planTableBlock}>
                  <View style={styles.planTable}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.planTableHeading}>Подписка</Text>
                      <TouchableOpacity onPress={() => setShowPlanModal(true)}>
                        <Text style={{ color: '#388e3c', textDecorationLine: 'underline' }}>Сменить</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.planTableRow}>
                      <Text style={styles.planTableLabel}>Тариф</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[
                          styles.planTag,
                          currentPlan === 'Lite' && { backgroundColor: '#e0f7fa' },
                          currentPlan === 'Medium' && { backgroundColor: '#fff9c4' }, // светло-жёлтый
                          currentPlan === 'Pro' && { backgroundColor: '#ede7f6' }
                        ]}>
                          <Text style={[
                            styles.planTagText,
                            currentPlan === 'Lite' && { color: '#00838f' },
                            currentPlan === 'Medium' && { color: '#388e3c' },
                            currentPlan === 'Pro' && { color: '#5e35b1' }
                          ]}>
                            {currentPlan?.charAt(0).toUpperCase() + currentPlan?.slice(1).toLowerCase()}
                          </Text>
                        </View>
                        {currentPlan !== selectedPlan && (
                          <>
                            <Text style={{ fontSize: 16, marginHorizontal: 4 }}>→</Text>
                            <View style={[
                              styles.planTag,
                              selectedPlan === 'Lite' && { backgroundColor: '#e0f7fa' },
                              selectedPlan === 'Medium' && { backgroundColor: '#fff9c4' }, // светло-жёлтый
                              selectedPlan === 'Pro' && { backgroundColor: '#ede7f6' }
                            ]}>
                              <Text style={[
                                styles.planTagText,
                                selectedPlan === 'Lite' && { color: '#00838f' },
                                selectedPlan === 'Medium' && { color: '#388e3c' },
                                selectedPlan === 'Pro' && { color: '#5e35b1' }
                              ]}>
                                {selectedPlan?.charAt(0).toUpperCase() + selectedPlan?.slice(1).toLowerCase()}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={styles.planTableRow}>
                      <Text style={styles.planTableLabel}>Длительность</Text>
                      <Text style={styles.planTableValue}>
                        {selectedDuration}
                      </Text>
                    </View>
                    <View style={styles.planTableRow}>
                      <Text style={styles.planTableLabel}>Следующий платёж</Text>
                      <Text style={styles.planTableValue}>
                        {moment().add(
                          selectedDuration === '12 месяцев' ? 12 :
                          selectedDuration === '3 месяца' ? 3 : 1,
                          'months'
                        ).format('DD.MM.YYYY')}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>Выберите срок подписки:</Text>
                <View style={styles.durationRow}>
                    {[{ label: '1 месяц' }, { label: '3 месяца', sale: '−15%' }, { label: '12 месяцев', sale: '−25%' }].map(({ label, sale }) => (
                        <TouchableOpacity
                            key={label}
                            style={[
                                styles.durationOption,
                                selectedDuration === label && styles.selectedOption
                            ]}
                            onPress={() => setSelectedDuration(label)}
                        >
                            <Text style={[
                                styles.durationText,
                                selectedDuration === label && { color: 'white' }
                            ]}>{label}</Text>
                            {sale && (
                                <View style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 4, borderRadius: 4, marginTop: 4 }}>
                                    <Text style={{ fontSize: 10, color: '#388e3c' }}>{sale}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Номер карты:</Text>
                <TextInput
                    style={styles.input}
                    value={cardNumber}
                    onChangeText={(text) => {
                        const cleaned = text.replace(/\D+/g, '').slice(0, 16);
                        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';
                        setCardNumber(formatted);
                    }}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    placeholderTextColor="#ccc"
                />

                <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>Срок действия:</Text>
                        <TextInput
                            style={styles.input}
                            value={expiry}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/\D+/g, '').slice(0, 4);
                                const formatted = cleaned.length > 2 ? `${cleaned.slice(0,2)}/${cleaned.slice(2)}` : cleaned;
                                setExpiry(formatted);
                            }}
                            placeholder="MM/YY"
                            keyboardType="number-pad"
                            placeholderTextColor="#ccc"
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.label}>CVV:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={cvv}
                                onChangeText={(text) => setCvv(text.replace(/\D+/g, '').slice(0, 3))}
                                placeholder="123"
                                secureTextEntry={!showCvv}
                                keyboardType="number-pad"
                                placeholderTextColor="#ccc"
                            />
                            <TouchableOpacity onPress={() => setShowCvv(!showCvv)} style={{ marginLeft: 8, opacity: 0.7 }}>
                                <Text style={{ fontSize: 20 }}>{showCvv ? '👁️' : '🙈'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>Итог:</Text>
                    {'old' in getPrice() && (
                        <Text style={styles.oldPrice}>{getPrice().old} ₽</Text>
                    )}
                    <Text style={styles.discountedPrice}>{getPrice().current} ₽</Text>
                    <Text style={{ fontSize: 13, color: '#555', marginTop: 6 }}>
                      Следующий платёж: {moment().add(
                        selectedDuration === '12 месяцев' ? 12 :
                        selectedDuration === '3 месяца' ? 3 : 1, 'months'
                      ).format('DD.MM.YYYY')}
                    </Text>
                    {selectedDuration !== '1 месяц' && (
                      <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        Скидка применена автоматически при оплате за {selectedDuration.toLowerCase()}.
                      </Text>
                    )}
                </View>

                <TouchableOpacity onPress={() => setFeaturesModalVisible(true)} style={styles.toggleFeaturesButton}>
                  <Text style={styles.toggleFeaturesText}>Что входит в подписку?</Text>
                </TouchableOpacity>

                <Modal
                  visible={featuresModalVisible}
                  animationType="fade"
                  transparent={true}
                  onRequestClose={() => setFeaturesModalVisible(false)}
                >
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Что входит в подписку:</Text>
                      {selectedPlan === 'Lite' && (
                        <>
                          <Text style={styles.featureItem}>• Доступ в тренажёрный зал с 6:00 до 24:00</Text>
                          <Text style={styles.featureItem}>• 1 групповое занятие в неделю</Text>
                          <Text style={styles.featureItem}>• Консультация тренера 1 раз в месяц</Text>
                        </>
                      )}
                      {selectedPlan === 'Medium' && (
                        <>
                          <Text style={styles.featureItem}>• Безлимитный доступ в тренажёрный зал с 6:00 до 24:00</Text>
                          <Text style={styles.featureItem}>• Неограниченное количество групповых занятий</Text>
                          <Text style={styles.featureItem}>• 1 персональная тренировка в месяц</Text>
                          <Text style={styles.featureItem}>• Бесплатная заморозка до 7 дней</Text>
                          <Text style={styles.featureItem}>• Тестовая диагностика состава тела 1 раз в месяц</Text>
                              <Text style={styles.featureItem}>• Доступ к программе питания в приложении</Text>
                        </>
                      )}
                      {selectedPlan === 'Pro' && (
                        <>
                          <Text style={styles.featureItem}>• Всё из Medium</Text>
                          <Text style={styles.featureItem}>• 3 персональные тренировки в неделю</Text>
                          <Text style={styles.featureItem}>• Индивидуальный план питания</Text>
                          <Text style={styles.featureItem}>• Личный куратор (чат в приложении)</Text>
                          <Text style={styles.featureItem}>• Бесплатная заморозка до 30 дней</Text>
                          <Text style={styles.featureItem}>• Доступ к SPA-зоне</Text>
                        </>
                      )}
                      <TouchableOpacity onPress={() => setFeaturesModalVisible(false)} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center' }}>Закрыть</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={showPlanModal}
                  animationType="fade"
                  transparent={true}
                  onRequestClose={() => setShowPlanModal(false)}
                >
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Выберите подписку:</Text>
                      {['Lite', 'Medium', 'Pro'].map(plan => (
                        <TouchableOpacity
                          key={plan}
                          onPress={() => {
                            setSelectedPlan(plan);
                            setShowPlanModal(false);
                          }}
                          style={{
                            borderWidth: 1,
                            borderColor: '#4caf50',
                            borderRadius: 8,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            marginBottom: 8,
                            backgroundColor: selectedPlan === plan ? (plan === 'Medium' ? '#fff9c4' : '#e8f5e9') : '#fff',
                            alignItems: 'center'
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[
                              styles.planTag,
                              plan === 'Lite' && { backgroundColor: '#e0f7fa' },
                              plan === 'Medium' && { backgroundColor: '#fff9c4' }, // светло-жёлтый
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
                          </View>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity onPress={() => setShowPlanModal(false)} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center' }}>Закрыть</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={successModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setSuccessModalVisible(false)}
                >
                  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 16, alignItems: 'center', width: '80%' }}>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>🎉 Оплата прошла успешно!</Text>
                      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
                        Вы оплатили подписку <Text style={{ fontWeight: 'bold' }}>{selectedPlan}</Text> на <Text style={{ fontWeight: 'bold' }}>{selectedDuration}</Text>
                      </Text>
                      <Text style={{ fontSize: 30 }}>🎊🎈🥳</Text>
                      <TouchableOpacity onPress={() => setSuccessModalVisible(false)} style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 16, color: '#388e3c', fontWeight: 'bold' }}>Закрыть</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>Оплатить</Text>
            </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    label: { marginTop: 12, marginBottom: 6, fontSize: 14 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 18,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 1,
    },
    durationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    durationOption: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4caf50',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        minWidth: 90,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#4caf50',
    },
    durationText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center'
    },
    planInfo: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#444',
        textAlign: 'center'
    },
    planInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        textAlign: 'center',
        marginBottom: 4
    },
    planRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginRight: 8
    },
    planNameLarge: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    changePlan: {
        fontSize: 14,
        color: '#388e3c',
        textDecorationLine: 'underline'
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryBlock: {
        marginTop: 20,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginBottom: 12
    },
    priceBlock: {
        textAlign: 'center'
    },
    oldPrice: {
        textDecorationLine: 'line-through',
        color: '#aaa',
        fontSize: 18,
        fontWeight: '300',
    },
    discountedPrice: {
        color: '#388e3c',
        fontWeight: 'bold',
        fontSize: 26,
    },
    summary: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    payButton: {
        backgroundColor: '#4caf50',
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    featuresBlock: {
      marginTop: 20,
      backgroundColor: '#f5f5f5',
      padding: 16,
      borderRadius: 12
    },
    featuresTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#333'
    },
    featureItem: {
      fontSize: 14,
      marginBottom: 4,
      color: '#555'
    },
    toggleFeaturesButton: {
        marginTop: 12,
        alignItems: 'center'
    },
    toggleFeaturesText: {
        fontSize: 14,
        color: '#388e3c',
        textDecorationLine: 'underline'
    },
    planHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8
    },
    changeButton: {
        marginLeft: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#e0f2f1',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    planTableBlock: {
      marginBottom: 16,
      backgroundColor: '#f9f9f9',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    planTable: {},
    planTableHeading: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#222',
      textAlign: 'center'
    },
    planTableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10
    },
    planTableLabel: {
      fontSize: 14,
      color: '#666'
    },
    planTableValue: {
      fontSize: 14,
      fontWeight: '500',
      color: '#222'
    },
    planTableValueLink: {
      fontSize: 14,
      fontWeight: '500',
      color: '#388e3c',
      textDecorationLine: 'underline'
    },
    subscriptionBadge: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    subscriptionText: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase'
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
    }
});