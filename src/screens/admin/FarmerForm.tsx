import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useSelector } from 'react-redux';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { BASE_URL } from '../../../token/tokenStorage';
import { Farmer } from '../../interface';

const createInitialFarmer = (): Farmer => ({
    name: '',
    phoneNumber: '',
    password: '',
    buffaloRate: '',
    cowRate: '',
    userCode: '',
    hisabCycleDays: '',
    cowMilk: {
        activeCowMilk: false,
        fixedAmount: false,
        fatAmount: false,
        snfAmount: false,
        morningTimeMilk: false,
        eveningTimeMilk: false,
    },
    buffaloMilk: {
        activeBuffaloMilk: false,
        fixedAmount: false,
        fatAmount: false,
        snfAmount: false,
        morningTimeMilk: false,
        eveningTimeMilk: false,
    },
    _id: '',
});

const FarmerForm = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const firm = useSelector((state: any) => state.firm.value);

    const mode = route.params?.mode || 'create';
    const isEdit = mode === 'edit';
    const existingFarmer = route.params?.farmer;
    const userType = route.params?.userType || 'farmer';
    const isFarmer = userType === 'farmer';

    const [Farmer, setFarmer] = useState<Farmer>(() => {
        if (isEdit && existingFarmer) {
            return {
                ...existingFarmer,
                cowRate: String(existingFarmer.cowRate ?? ''),
                buffaloRate: String(existingFarmer.buffaloRate ?? ''),
                hisabCycleDays: String(existingFarmer.hisabCycleDays ?? ''),
                password: '',
            };
        }

        return createInitialFarmer();
    });

    const [isLoading, setIsLoading] = useState(false);



    const CreateFarmer = async () => {
        if (
            !Farmer.name ||
            !Farmer.phoneNumber ||
            !Farmer.userCode ||
            (!isEdit && !Farmer.password)
        ) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Warning',
                textBody: 'All Fields Required',
            });
            return;
        }

        setIsLoading(true);

        try {
            const payload: any = {
                ...Farmer,
                buffaloRate: Number(Farmer.buffaloRate) || 0,
                cowRate: Number(Farmer.cowRate) || 0,
                userType: userType,
                firmId: firm.id,
            };

            // Blank = Monthly, so don't send 0/empty value
            if (Farmer.hisabCycleDays) {
                payload.hisabCycleDays = Number(Farmer.hisabCycleDays);
            } else {
                delete payload.hisabCycleDays;
            }

            // EDIT FARMER
            if (isEdit) {
                // Password blank means keep existing password
                if (!Farmer.password) {
                    delete payload.password;
                }

                const response = await fetch(`${BASE_URL}/user/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok || data.status === 401) {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: data.message || 'Farmer update failed',
                    });
                    return;
                }

                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: `${Farmer.name} Farmer updated!!`,
                });

                navigation.goBack();
                return;
            }

            // CREATE FARMER
            const response = await fetch(`${BASE_URL}/user/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.status === 401) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Farmer Already Exist!!',
                });
                return;
            }

            if (!response.ok) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: data.message || 'Farmer creation failed',
                });
                return;
            }

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: `${Farmer.name} Farmer created!!`,
            });

            navigation.goBack();
        } catch (error) {
            console.log('Farmer create/update error:', error);

            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Something went wrong',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateFarmer = (changes: Partial<Farmer>) => {
        setFarmer(prev => ({
            ...prev,
            ...changes,
        }));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <FaIcon name="arrow-left" size={20} color="#1E293B" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {isEdit
                        ? `Edit ${isFarmer ? 'Farmer' : 'Customer'}`
                        : `Create ${isFarmer ? 'Farmer' : 'Customer'}`}
                </Text>

                <View style={{ width: 42 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* MILK TYPE */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Milk Type</Text>

                    {/* BUFFALO ROW */}
                    <View style={styles.milkTypeRow}>
                        <View style={styles.milkTypeMain}>
                            <BouncyCheckbox
                                size={20}
                                fillColor="#9C27B0"
                                unFillColor="#F7F5FF"

                                text="Buffalo"
                                iconStyle={{ borderColor: '#9C27B0' }}
                                innerIconStyle={{ borderWidth: 2 }}
                                textContainerStyle={{ marginLeft: 4 }}
                                textStyle={styles.oldCheckboxText}
                                isChecked={Farmer?.buffaloMilk?.activeBuffaloMilk}
                                onPress={isChecked => {
                                    updateFarmer({
                                        buffaloMilk: {
                                            ...Farmer.buffaloMilk,
                                            activeBuffaloMilk: isChecked,
                                            ...(isChecked
                                                ? {}
                                                : {
                                                    morningTimeMilk: false,
                                                    eveningTimeMilk: false,
                                                    fixedAmount: false,
                                                    fatAmount: false,
                                                    snfAmount: false,
                                                }),
                                        },
                                    });
                                }}
                            />

                            {/* <FaIcon name="arrows-h" size={16} /> */}
                        </View>

                        <BouncyCheckbox
                            size={20}
                            fillColor="#9C27B0"
                            unFillColor="#F7F5FF"
                            style={{ width: '20%' }}
                            text="Fixed"
                            iconStyle={{ borderColor: '#9C27B0' }}
                            innerIconStyle={{ borderWidth: 2 }}
                            textContainerStyle={{ marginLeft: 4 }}
                            textStyle={styles.oldCheckboxText}
                            disabled={!Farmer?.buffaloMilk?.activeBuffaloMilk}
                            isChecked={Farmer?.buffaloMilk?.fixedAmount}
                            onPress={isChecked => {
                                updateFarmer({
                                    buffaloMilk: {
                                        ...Farmer.buffaloMilk,
                                        fixedAmount: isChecked,
                                        fatAmount: false,
                                        snfAmount: false,
                                    },
                                });
                            }}
                        />

                        <BouncyCheckbox
                            size={20}
                            fillColor="#9C27B0"
                            unFillColor="#F7F5FF"
                            style={{ width: '20%' }}
                            text="Fat"
                            iconStyle={{ borderColor: '#9C27B0' }}
                            innerIconStyle={{ borderWidth: 2 }}
                            textContainerStyle={{ marginLeft: 4 }}
                            textStyle={styles.oldCheckboxText}
                            disabled={!Farmer?.buffaloMilk?.activeBuffaloMilk}
                            isChecked={Farmer?.buffaloMilk?.fatAmount}
                            onPress={isChecked => {
                                updateFarmer({
                                    buffaloMilk: {
                                        ...Farmer.buffaloMilk,
                                        fatAmount: isChecked,
                                        fixedAmount: false,
                                        snfAmount: false,
                                    },
                                });
                            }}
                        />

                        <BouncyCheckbox
                            size={20}
                            fillColor="#9C27B0"
                            unFillColor="#F7F5FF"
                            style={{ width: '20%' }}
                            text="SNF"
                            iconStyle={{ borderColor: '#9C27B0' }}
                            innerIconStyle={{ borderWidth: 2 }}
                            textContainerStyle={{ marginLeft: 4 }}
                            textStyle={styles.oldCheckboxText}
                            disabled={!Farmer?.buffaloMilk?.activeBuffaloMilk}
                            isChecked={Farmer?.buffaloMilk?.snfAmount}
                            onPress={isChecked => {
                                updateFarmer({
                                    buffaloMilk: {
                                        ...Farmer.buffaloMilk,
                                        snfAmount: isChecked,
                                        fixedAmount: false,
                                        fatAmount: false,
                                    },
                                });
                            }}
                        />
                    </View>

                    {/* COW ROW */}
                    <View style={[styles.milkTypeRow, { marginTop: 10 }]}>
                        <View style={styles.milkTypeMain}>
                            <BouncyCheckbox
                                size={20}
                                fillColor="#9C27B0"
                                unFillColor="#F7F5FF"

                                text="Cow"
                                iconStyle={{ borderColor: '#9C27B0' }}
                                innerIconStyle={{ borderWidth: 2 }}
                                textContainerStyle={{ marginLeft: 4 }}
                                textStyle={styles.oldCheckboxText}
                                isChecked={Farmer?.cowMilk?.activeCowMilk}
                                onPress={isChecked => {
                                    updateFarmer({
                                        cowMilk: {
                                            ...Farmer.cowMilk,
                                            activeCowMilk: isChecked,
                                            ...(isChecked
                                                ? {}
                                                : {
                                                    morningTimeMilk: false,
                                                    eveningTimeMilk: false,
                                                    fixedAmount: false,
                                                    fatAmount: false,
                                                    snfAmount: false,
                                                }),
                                        },
                                    });
                                }}
                            />

                            {/* <FaIcon name="arrows-h" size={16} /> */}
                        </View>

                        <BouncyCheckbox
                            size={20}
                            fillColor="#9C27B0"
                            unFillColor="#F7F5FF"
                            style={{ width: '20%' }}
                            text="Fixed"
                            iconStyle={{ borderColor: '#9C27B0' }}
                            innerIconStyle={{ borderWidth: 2 }}
                            textContainerStyle={{ marginLeft: 4 }}
                            textStyle={styles.oldCheckboxText}
                            disabled={!Farmer?.cowMilk?.activeCowMilk}
                            isChecked={Farmer?.cowMilk?.fixedAmount}
                            onPress={isChecked => {
                                updateFarmer({
                                    cowMilk: {
                                        ...Farmer.cowMilk,
                                        fixedAmount: isChecked,
                                        fatAmount: false,
                                        snfAmount: false,
                                    },
                                });
                            }}
                        />

                        <BouncyCheckbox
                            size={20}
                            fillColor="#9C27B0"
                            unFillColor="#F7F5FF"
                            style={{ width: '20%' }}
                            text="Fat"
                            iconStyle={{ borderColor: '#9C27B0' }}
                            innerIconStyle={{ borderWidth: 2 }}
                            textContainerStyle={{ marginLeft: 4 }}
                            textStyle={styles.oldCheckboxText}
                            disabled={!Farmer?.cowMilk?.activeCowMilk}
                            isChecked={Farmer?.cowMilk?.fatAmount}
                            onPress={isChecked => {
                                updateFarmer({
                                    cowMilk: {
                                        ...Farmer.cowMilk,
                                        fatAmount: isChecked,
                                        fixedAmount: false,
                                        snfAmount: false,
                                    },
                                });
                            }}
                        />

                        <BouncyCheckbox
                            size={20}
                            fillColor="#9C27B0"
                            unFillColor="#F7F5FF"
                            style={{ width: '20%' }}
                            text="SNF"
                            iconStyle={{ borderColor: '#9C27B0' }}
                            innerIconStyle={{ borderWidth: 2 }}
                            textContainerStyle={{ marginLeft: 4 }}
                            textStyle={styles.oldCheckboxText}
                            disabled={!Farmer?.cowMilk?.activeCowMilk}
                            isChecked={Farmer?.cowMilk?.snfAmount}
                            onPress={isChecked => {
                                updateFarmer({
                                    cowMilk: {
                                        ...Farmer.cowMilk,
                                        snfAmount: isChecked,
                                        fixedAmount: false,
                                        fatAmount: false,
                                    },
                                });
                            }}
                        />
                    </View>
                </View>

                {/* BASIC DETAILS */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Farmer Details</Text>

                    <View style={styles.inputRow}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                value={Farmer.name}
                                onChangeText={text => updateFarmer({ name: text })}
                                style={styles.input}
                                placeholder="Enter name"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                value={Farmer.phoneNumber}
                                onChangeText={text => updateFarmer({ phoneNumber: text })}
                                style={styles.input}
                                placeholder="Enter phone"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    <View style={styles.inputRow}>
                        {Farmer?.buffaloMilk?.activeBuffaloMilk && (
                            <View style={styles.field}>
                                <Text style={styles.label}>Buffalo Rate</Text>
                                <TextInput
                                    value={Farmer.buffaloRate}
                                    onChangeText={text =>
                                        updateFarmer({ buffaloRate: text })
                                    }
                                    style={styles.input}
                                    placeholder="Buffalo rate"
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        {Farmer?.cowMilk?.activeCowMilk && (
                            <View style={styles.field}>
                                <Text style={styles.label}>Cow Rate</Text>
                                <TextInput
                                    value={Farmer.cowRate}
                                    onChangeText={text => updateFarmer({ cowRate: text })}
                                    style={styles.input}
                                    placeholder="Cow rate"
                                    keyboardType="numeric"
                                />
                            </View>
                        )}
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Code</Text>
                            <TextInput
                                value={Farmer.userCode}
                                onChangeText={text => updateFarmer({ userCode: text })}
                                style={styles.input}
                                placeholder="Enter code"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>
                                Password {isEdit ? '(leave blank to keep old)' : ''}
                            </Text>
                            <TextInput
                                value={Farmer.password}
                                onChangeText={text => updateFarmer({ password: text })}
                                style={styles.input}
                                placeholder={isEdit ? 'Keep old password' : 'Enter password'}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {/* HISAB CYCLE */}
                    <View style={styles.fieldFull}>
                        <Text style={styles.label}>Hisab Cycle (Days)</Text>
                        <TextInput
                            value={Farmer.hisabCycleDays}
                            onChangeText={text =>
                                updateFarmer({
                                    hisabCycleDays: text.replace(/[^0-9]/g, ''),
                                })
                            }
                            style={styles.input}
                            placeholder="Leave blank for Monthly"
                            keyboardType="numeric"
                            maxLength={3}
                        />
                        <Text style={styles.helperText}>
                            Blank = Monthly
                        </Text>
                    </View>
                </View>

                {/* MILK TIMINGS */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Milk Collection Time</Text>

                    {/* BUFFALO MILK TIME */}
                    {Farmer?.buffaloMilk?.activeBuffaloMilk && (
                        <View style={styles.milkTimeRow}>
                            <View style={styles.milkTimeTitle}>
                                <Text style={styles.milkTimeText}>Buffalo Time</Text>
                                <FaIcon name="arrows-h" size={15} color="#000" />
                            </View>

                            <View style={styles.milkTimeOption}>
                                <BouncyCheckbox
                                    size={20}
                                    fillColor="#9C27B0"
                                    unFillColor="#F7F5FF"
                                    text="Morning"
                                    iconStyle={{ borderColor: '#9C27B0' }}
                                    innerIconStyle={{ borderWidth: 2 }}
                                    textContainerStyle={{ marginLeft: 5 }}
                                    textStyle={styles.oldCheckboxText}
                                    isChecked={Farmer?.buffaloMilk?.morningTimeMilk}
                                    onPress={isChecked =>
                                        updateFarmer({
                                            buffaloMilk: {
                                                ...Farmer.buffaloMilk,
                                                morningTimeMilk: isChecked,
                                            },
                                        })
                                    }
                                />
                            </View>

                            <View style={styles.milkTimeOption}>
                                <BouncyCheckbox
                                    size={20}
                                    fillColor="#9C27B0"
                                    unFillColor="#F7F5FF"
                                    text="Evening"
                                    iconStyle={{ borderColor: '#9C27B0' }}
                                    innerIconStyle={{ borderWidth: 2 }}
                                    textContainerStyle={{ marginLeft: 5 }}
                                    textStyle={styles.oldCheckboxText}
                                    isChecked={Farmer?.buffaloMilk?.eveningTimeMilk}
                                    onPress={isChecked =>
                                        updateFarmer({
                                            buffaloMilk: {
                                                ...Farmer.buffaloMilk,
                                                eveningTimeMilk: isChecked,
                                            },
                                        })
                                    }
                                />
                            </View>
                        </View>
                    )}

                    {/* COW MILK TIME */}
                    {Farmer?.cowMilk?.activeCowMilk && (
                        <View
                            style={[
                                styles.milkTimeRow,
                                Farmer?.buffaloMilk?.activeBuffaloMilk && {
                                    marginTop: 12,
                                },
                            ]}
                        >
                            <View style={styles.milkTimeTitle}>
                                <Text style={styles.milkTimeText}>Cow Time</Text>
                                <FaIcon name="arrows-h" size={15} color="#000" />
                            </View>

                            <View style={styles.milkTimeOption}>
                                <BouncyCheckbox
                                    size={20}
                                    fillColor="#9C27B0"
                                    unFillColor="#F7F5FF"
                                    text="Morning"
                                    iconStyle={{ borderColor: '#9C27B0' }}
                                    innerIconStyle={{ borderWidth: 2 }}
                                    textContainerStyle={{ marginLeft: 5 }}
                                    textStyle={styles.oldCheckboxText}
                                    isChecked={Farmer?.cowMilk?.morningTimeMilk}
                                    onPress={isChecked =>
                                        updateFarmer({
                                            cowMilk: {
                                                ...Farmer.cowMilk,
                                                morningTimeMilk: isChecked,
                                            },
                                        })
                                    }
                                />
                            </View>

                            <View style={styles.milkTimeOption}>
                                <BouncyCheckbox
                                    size={20}
                                    fillColor="#9C27B0"
                                    unFillColor="#F7F5FF"
                                    text="Evening"
                                    iconStyle={{ borderColor: '#9C27B0' }}
                                    innerIconStyle={{ borderWidth: 2 }}
                                    textContainerStyle={{ marginLeft: 5 }}
                                    textStyle={styles.oldCheckboxText}
                                    isChecked={Farmer?.cowMilk?.eveningTimeMilk}
                                    onPress={isChecked =>
                                        updateFarmer({
                                            cowMilk: {
                                                ...Farmer.cowMilk,
                                                eveningTimeMilk: isChecked,
                                            },
                                        })
                                    }
                                />
                            </View>
                        </View>
                    )}

                    {!Farmer?.buffaloMilk?.activeBuffaloMilk &&
                        !Farmer?.cowMilk?.activeCowMilk && (
                            <Text style={styles.noMilkText}>
                                Select Buffalo or Cow above to configure collection time.
                            </Text>
                        )}
                </View>

                {/* SAVE BUTTON */}
                <TouchableOpacity
                    disabled={isLoading}
                    style={[styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={CreateFarmer}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading
                            ? 'Saving...'
                            : isEdit
                                ? `Update ${isFarmer ? 'Farmer' : 'Customer'}`
                                : `Create ${isFarmer ? 'Farmer' : 'Customer'}`}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={isLoading}
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    milkTimeRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },

    milkTimeTitle: {
        width: '43%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 8,
    },

    milkTimeText: {
        fontSize: 17,
        color: '#000',
        fontWeight: '500',
    },

    milkTimeOption: {
        width: '28.5%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    milkTypeRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    milkTypeMain: {
        width: '30%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },

    oldCheckboxText: {
        color: '#000',
        fontSize: 17,
        textDecorationLine: 'none',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    header: {
        height: 64,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontSize: 21,
        fontWeight: '700',
        color: '#0F172A',
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },

    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 16,
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },

    typeColumn: {
        width: '100%',
        marginBottom: 4,
    },

    checkboxText: {
        color: '#000',
        fontSize: 16,
        textDecorationLine: 'none',
    },

    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },

    field: {
        flex: 1,
    },

    fieldFull: {
        width: '100%',
        marginTop: 4,
    },

    label: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
        marginBottom: 6,
    },

    input: {
        width: '100%',
        minHeight: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        paddingHorizontal: 13,
        fontSize: 17,
        color: '#0F172A',
    },

    helperText: {
        marginTop: 5,
        fontSize: 13,
        color: '#64748B',
    },

    timingSection: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#FAF7FF',
        marginBottom: 10,
    },

    timingTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#7B1FA2',
        marginBottom: 10,
    },

    timingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },

    noMilkText: {
        color: '#64748B',
        fontSize: 14,
        lineHeight: 20,
    },

    saveButton: {
        height: 52,
        borderRadius: 13,
        backgroundColor: '#5086E7',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },

    disabledButton: {
        opacity: 0.6,
    },

    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    cancelButton: {
        height: 50,
        borderRadius: 13,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },

    cancelButtonText: {
        color: '#334155',
        fontSize: 17,
        fontWeight: '600',
    },
});

export default FarmerForm;