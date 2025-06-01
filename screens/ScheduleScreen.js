import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert } from 'react-native';

const WorkoutScheduleScreen = () => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [registeredWorkouts, setRegisteredWorkouts] = useState(new Set());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const shortNames = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
        return {
            short: shortNames[date.getDay()],
            date: date.toISOString().slice(0, 10) // YYYY-MM-DD
        };
    });

    // Генерация по 2 случайных тренировки на каждый день недели
    const getRandomTime = (existingTimes) => {
        let time;
        do {
            const hour = 8 + Math.floor(Math.random() * 10);
            const minutes = Math.random() > 0.5 ? '00' : '30';
            time = `${hour.toString().padStart(2, '0')}:${minutes}`;
        } while (existingTimes.has(time));
        existingTimes.add(time);
        return time;
    };

    const getRandomWorkout = (idPrefix, date) => {
        const usedTimes = new Set();
        return [
            {
                id: `${idPrefix}-a`,
                time: getRandomTime(usedTimes),
                duration: '45 мин',
                name: 'Йога',
                location: 'MyGym',
                trainer: 'Мария Ли',
                trainerAvatar: '🧘‍♀️',
                registrationTime: `${date.slice(8, 10)}.${date.slice(5, 7)}`
            },
            {
                id: `${idPrefix}-b`,
                time: getRandomTime(usedTimes),
                duration: '60 мин',
                name: 'Кардио HIIT',
                location: 'MyGym',
                trainer: 'Алексей Смирнов',
                trainerAvatar: '🏋️‍♂️',
                registrationTime: `${date.slice(8, 10)}.${date.slice(5, 7)}`
            }
        ];
    };

    const workoutSchedule = {};
    daysOfWeek.forEach((day, index) => {
        workoutSchedule[day.date] = getRandomWorkout(index + 1, day.date);
    });
    // Добавь вручную нужные дополнительные тренировки если нужно

    const handleRegister = (workout) => {
        if (registeredWorkouts.has(workout.id)) {
            Alert.alert(
                'Отмена записи',
                `Отменить запись на "${workout.name}"?`,
                [
                    {
                        text: 'Нет',
                        style: 'cancel',
                    },
                    {
                        text: 'Да',
                        onPress: () => {
                            const newRegistered = new Set(registeredWorkouts);
                            newRegistered.delete(workout.id);
                            setRegisteredWorkouts(newRegistered);
                            Alert.alert('Запись отменена');
                        },
                    },
                ]
            );
        } else {
            setSelectedWorkout(workout);
            setModalVisible(true);
        }
    };

    const confirmRegistration = () => {
        if (selectedWorkout) {
            const newRegistered = new Set(registeredWorkouts);
            newRegistered.add(selectedWorkout.id);
            setRegisteredWorkouts(newRegistered);
            setModalVisible(false);
            Alert.alert('🎉 Запись подтверждена!', `Вы записаны на "${selectedWorkout.name}"`);
        }
    };

    const todayWorkoutsRaw = workoutSchedule[daysOfWeek[selectedDay]?.date] || [];
    const now = new Date();
    const todayWorkouts = todayWorkoutsRaw
        .filter((workout) => {
            const workoutDate = new Date(`${daysOfWeek[selectedDay]?.date}T${workout.time}:00`);
            return workoutDate > now;
        })
        .sort((a, b) => {
            const dateA = new Date(`${daysOfWeek[selectedDay]?.date}T${a.time}:00`);
            const dateB = new Date(`${daysOfWeek[selectedDay]?.date}T${b.time}:00`);
            return dateA - dateB;
        });

    return (
        <View style={rnStyles.container}>
            {/* Header */}
            <View style={rnStyles.header}>
                <Text style={[rnStyles.headerTitle, { textAlign: 'center', flex: 1 }]}>Расписание тренировок</Text>
            </View>

            {/* Days selector */}
            <View style={rnStyles.daysContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={rnStyles.daysScrollView}>
                    {daysOfWeek.map((day, index) => (
                        <TouchableOpacity
                            key={day.date}
                            style={[
                                rnStyles.dayButton,
                                selectedDay === index && rnStyles.selectedDayButton
                            ]}
                            onPress={() => setSelectedDay(index)}
                        >
                            <Text style={[
                                rnStyles.dayShort,
                                selectedDay === index && rnStyles.selectedDayText
                            ]}>
                                {day.short}
                            </Text>
                            <Text style={[
                                rnStyles.dayNumber,
                                selectedDay === index && rnStyles.selectedDayText
                            ]}>
                                {parseInt(day.date.slice(-2), 10)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Workouts list */}
            <ScrollView style={rnStyles.workoutsList} contentContainerStyle={{paddingBottom: 32}}>
                {todayWorkouts.length > 0 ? (
                    todayWorkouts.map((workout) => {
                        const isRegistered = registeredWorkouts.has(workout.id);
                        return (
                            <View key={workout.id} style={rnStyles.workoutCard}>
                                <View style={rnStyles.workoutHeader}>
                                    <View style={rnStyles.timeContainer}>
                                        <Text style={rnStyles.workoutTime}>{workout.time}</Text>
                                        <Text style={rnStyles.workoutDuration}>{workout.duration}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            rnStyles.registerButton,
                                            isRegistered && rnStyles.registeredButton
                                        ]}
                                        onPress={() => handleRegister(workout)}
                                    >
                                        <Text style={[
                                            {fontWeight: '600'},
                                            isRegistered && {color: '#fff'},
                                            !isRegistered && {color: '#4CAF50'}
                                        ]}>
                                            {isRegistered ? 'Записан' : 'Записаться'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={rnStyles.workoutName}>{workout.name}</Text>
                                <View style={rnStyles.workoutDetails}>
                                    <View style={rnStyles.locationContainer}>
                                        <Text style={rnStyles.locationIcon}>📍</Text>
                                        <Text style={rnStyles.workoutLocation}>{workout.location}</Text>
                                    </View>
                                    <View style={rnStyles.trainerContainer}>
                                        <Text style={rnStyles.trainerAvatar}>{workout.trainerAvatar}</Text>
                                        <Text style={rnStyles.trainerName}>{workout.trainer}</Text>
                                    </View>
                                </View>
                                {isRegistered && (
                                    <View style={rnStyles.registrationNotice}>
                                        <Text style={rnStyles.checkIcon}>✅</Text>
                                        <Text style={rnStyles.registrationText}>
                                            Запись от {workout.registrationTime}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={rnStyles.noWorkoutsContainer}>
                        <Text style={rnStyles.calendarIcon}>📅</Text>
                        <Text style={rnStyles.noWorkoutsText}>На этот день тренировок нет</Text>
                        <Text style={rnStyles.noWorkoutsSubtext}>
                            Выберите другой день или проверьте расписание позже
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Registration Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={rnStyles.modalOverlay}>
                    <View style={rnStyles.modalContent}>
                        <Text style={rnStyles.modalTitle}>Подтвердить запись</Text>
                        {selectedWorkout && (
                            <View style={rnStyles.modalWorkoutInfo}>
                                <Text style={rnStyles.modalWorkoutName}>{selectedWorkout.name}</Text>
                                <Text style={rnStyles.modalWorkoutDetails}>
                                    {selectedWorkout.time} • {selectedWorkout.duration}
                                </Text>
                                <Text style={rnStyles.modalWorkoutLocation}>
                                    📍 {selectedWorkout.location}
                                </Text>
                                <Text style={rnStyles.modalTrainer}>
                                    {selectedWorkout.trainerAvatar} {selectedWorkout.trainer}
                                </Text>
                            </View>
                        )}
                        <View style={rnStyles.modalButtons}>
                            <TouchableOpacity
                                style={rnStyles.modalCancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{fontWeight: '600', color: '#666'}}>Отмена</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={rnStyles.modalConfirmButton}
                                onPress={confirmRegistration}
                            >
                                <Text style={{fontWeight: '600', color: '#fff'}}>Записаться</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const rnStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    filterButton: {
        padding: 8,
    },
    daysContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    daysScrollView: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4,
    },
    dayButton: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 60,
        backgroundColor: 'transparent',
        marginRight: 8,
    },
    selectedDayButton: {
        backgroundColor: '#4CAF50',
    },
    dayShort: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        marginBottom: 2,
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    selectedDayText: {
        color: '#fff',
    },
    workoutsList: {
        flex: 1,
        padding: 16,
    },
    workoutCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    timeContainer: {
        flex: 1,
    },
    workoutTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 2,
    },
    workoutDuration: {
        fontSize: 12,
        color: '#888',
    },
    registerButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4CAF50',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registeredButton: {
        backgroundColor: '#4CAF50',
    },
    workoutName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    workoutDetails: {
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    workoutLocation: {
        fontSize: 14,
        color: '#666',
    },
    trainerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trainerAvatar: {
        fontSize: 16,
        marginRight: 8,
    },
    trainerName: {
        fontSize: 14,
        color: '#666',
    },
    registrationNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        padding: 8,
        borderRadius: 8,
        marginTop: 12,
    },
    checkIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    registrationText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    noWorkoutsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    calendarIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    noWorkoutsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    noWorkoutsSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 300,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 25,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    modalWorkoutInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalWorkoutName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    modalWorkoutDetails: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
        marginBottom: 4,
    },
    modalWorkoutLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    modalTrainer: {
        fontSize: 14,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalConfirmButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default WorkoutScheduleScreen;