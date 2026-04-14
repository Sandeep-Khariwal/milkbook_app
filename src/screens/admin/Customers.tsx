import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BASE_URL, getToken } from '../../../token/tokenStorage';
import { useDispatch, useSelector } from 'react-redux';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { Farmer } from '../../interface';
import { setAdminDetails } from '../../../redux/slices/adminSlice';
import { setFirmDetails } from '../../../redux/slices/firmSlice';

const Customers = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [query, setQuery] = useState<string>('');
  const firm = useSelector((state: any) => state.firm.value);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customer, setCustomer] = useState<Farmer>({
    name: '',
    phoneNumber: '',
    password: '',
    buffaloRate: '',
    cowRate: '',
    userCode: '',
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
  const [allCustomer, setAllCustomer] = useState<Farmer[]>([]);
  const [allShowCustomer, setAllShowCustomer] = useState<Farmer[]>([]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefDelete = useRef<BottomSheet>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState<boolean>(false);
  const [bottomSheetDeleteIndex, setBottomSheetDeleteIndex] =
    useState<boolean>(false);

  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    cowRate: string;
    buffaloRate: string;
    userCode: string;
    phoneNumber: string;
    cowMilk?: {
      activeCowMilk: boolean;
      fixedAmount: boolean;
      fatAmount: boolean;
      snfAmount: boolean;
      morningTimeMilk: boolean;
      eveningTimeMilk: boolean;
    };
    buffaloMilk?: {
      activeBuffaloMilk: boolean;
      fixedAmount: boolean;
      fatAmount: boolean;
      snfAmount: boolean;
      morningTimeMilk: boolean;
      eveningTimeMilk: boolean;
    };
    _id: string;
  }>({
    name: '',
    phoneNumber: '',
    _id: '',
    buffaloRate: '',
    cowRate: '',
    userCode: '',
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
  });

  const [isEditCustomer, setIsEditCustomer] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (firm.subscriptionExp) {
      navigation.navigate('Plans');
    }
    getCustomers();
  }, [isFocused]);

  const getCustomers = async () => {
    setIsLoading(true);
    const token = await getToken();
    //  Authorization: `Bearer ${token}`,
    await fetch(`${BASE_URL}/user/getAllCustomers/${firm.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res: any) => {
        const { users } = await res.json();

        // if (status === 403) {
        //   console.log('subscription expired : ');
        //   Toast.show({
        //     type: ALERT_TYPE.DANGER,
        //     title: 'Error',
        //     textBody: `subscription expired!!`,
        //   });

        //   const userData = {
        //     id: data.user._id,
        //     name: data.user.name,
        //   };
        //   dispatch(setAdminDetails(userData));

        //   const firmData = {
        //     name: '',
        //     id: '',
        //     role: 'admin',
        //     subscriptionExp: true,
        //   };
        //   dispatch(setFirmDetails(firmData));

        //   return;
        // }
        const filterdUsers = users
          .filter((d: any) => d.userType === 'customer')
          .map((u: any) => {
            return {
              ...u,
              cowRate: String(u.cowRate),
              buffaloRate: String(u.buffaloRate),
            };
          })
          .sort((a, b) => Number(a.userCode) - Number(b.userCode));

        setAllCustomer(filterdUsers);
        setAllShowCustomer(filterdUsers);
        setIsLoading(false);
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const CreateCustomer = async () => {
    if (
      (!customer.name ||
        !customer.phoneNumber ||
        !customer.password ||
        !customer.userCode ||
        !customer.cowRate ||
        !customer.buffaloRate) &&
      !isEditCustomer
    ) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: `Fields Required!!`,
      });
      return;
    }
    setBottomSheetIndex(false);
    await fetch(`${BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...customer,
        buffaloRate: Number(customer.buffaloRate),
        cowRate: Number(customer.cowRate),
        userType: 'customer',
        firmId: firm.id,
      }),
    })
      .then(async (res: any) => {
        const { user, status } = await res.json();
        if (status === 401) {
          setIsLoading(false);

          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: `Customer Already Exist!!`,
          });

          return;
        }
        if (isEditCustomer) {
          getCustomers();
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: `${customer.name} customer updated!!`,
          });
        } else {
          setAllCustomer(prev => [...prev, user]);
          setAllShowCustomer(prev => [...prev, user]);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: `${customer.name} customer created!!`,
          });
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    setBottomSheetIndex(false);
    bottomSheetRef.current?.close();
  };

  const DeleteCustomers = async () => {
    await fetch(`${BASE_URL}/user/delete/${selectedCustomer._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        await res.json();
        setAllCustomer(prev =>
          prev.filter(c => c._id !== selectedCustomer._id),
        );
        getCustomers();
      })
      .catch((e: any) => {
        console.log(e);
      });

    setBottomSheetDeleteIndex(false);
    bottomSheetRefDelete.current?.close();
  };

  useEffect(() => {
    if (!query) {
      setAllShowCustomer(allCustomer);
    } else {
      const filteredData = allCustomer.filter(
        (cust: any) =>
          cust?.name?.toLowerCase().includes(query.toLowerCase()) ||
          cust?.userCode?.toLowerCase().includes(query.toLowerCase()),
      );

      setAllShowCustomer(filteredData);
    }
  }, [query, allCustomer]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View
        style={{
          width: '100%',
          padding: 10,
          marginTop: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{ ...styles.inputBox, width: '90%', backgroundColor: '#fff' }}
        >
          <TextInput
            editable
            multiline
            maxLength={40}
            onChangeText={text => setQuery(text)}
            value={query}
            style={styles.textInput}
            placeholder="Search customer..."
          />
        </View>
        {/* <FaIcon name="search" size={30} onPress={filterCustomer} /> */}
      </View>

      {isLoading && <LoadingOverlay visible />}

      {!isLoading && allShowCustomer.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No data</Text>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stocksContainer}>
          {allShowCustomer.length > 0 ? (
            allShowCustomer.map((customer: any, index: number) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CustomerPage', {
                    id: customer._id,
                    userType: 'customer',
                  })
                }
                key={customer._id ?? index}
                style={styles.cardContainer}
              >
                <View style={styles.cardOne}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: !customer.milkUpdated ? '#e54646' : '#0d8e1e',
                    }}
                  >
                    {customer.name} ({customer.userCode})
                  </Text>

                  <View style={styles.timeContainer}>
                    {(customer?.cowMilk?.morningTimeMilk ||
                      customer?.buffaloMilk?.morningTimeMilk) && (
                      <View style={styles.circle}>
                        <Text style={styles.timeText}>M</Text>
                      </View>
                    )}

                    {(customer?.cowMilk?.eveningTimeMilk ||
                      customer?.buffaloMilk?.eveningTimeMilk) && (
                      <View style={styles.circle}>
                        <Text style={styles.timeText}>E</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.cardTwo}>
                  <Icon
                    name="edit"
                    size={26}
                    color="#333"
                    onPress={() => {
                      setIsEditCustomer(true);
                      setBottomSheetIndex(true);

                      setSelectedCustomer(customer);
                      setCustomer(customer);
                    }}
                  />
                  <Icon
                    name="trash-2"
                    size={24}
                    color="#FF0000"
                    onPress={() => {
                      setBottomSheetDeleteIndex(true),
                        setSelectedCustomer(customer);
                    }}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, color: '#8e8e98ff' }}>
                No Customers created yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.ButtonBox}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsEditCustomer(false),
              setCustomer({
                name: '',
                phoneNumber: '',
                password: '',
                buffaloRate: '',
                cowRate: '',
                userCode: '',
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
            setSelectedCustomer({
              name: '',
              phoneNumber: '',
              _id: '',
              buffaloRate: '',
              cowRate: '',
              userCode: '',
            });
            setBottomSheetIndex(true);
          }}
        >
          <Text style={styles.text}>Create Customer</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={bottomSheetIndex}
        onRequestClose={() => {}}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          alignSelf: 'center',
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ width: '100%', alignSelf: 'flex-end', padding: 10 }}>
              <Icon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setBottomSheetIndex(false);
                }}
              />
            </View>
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  width: '30%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 10,
                }}
              >
                <BouncyCheckbox
                  size={20}
                  fillColor="#9C27B0"
                  unFillColor="#F7F5FF"
                  style={{ width: '70%' }}
                  text="Buffalo"
                  iconStyle={{ borderColor: '#9C27B0' }}
                  innerIconStyle={{ borderWidth: 2 }}
                  textContainerStyle={{ marginLeft: 4 }}
                  textStyle={{
                    color: '#000',
                    fontSize: 16,
                    textDecorationLine: 'none',
                  }}
                  isChecked={customer?.buffaloMilk?.activeBuffaloMilk}
                  onPress={isChecked => {
                    setCustomer(prev => ({
                      ...prev,
                      buffaloMilk: {
                        ...prev.buffaloMilk,
                        activeBuffaloMilk: isChecked,
                      },
                    }));

                    if (!isChecked) {
                      setCustomer(prev => ({
                        ...prev,
                        buffaloMilk: {
                          ...prev.buffaloMilk,
                          morningTimeMilk: isChecked,
                          eveningTimeMilk: isChecked,
                          fixedAmount: isChecked,
                          fatAmount: isChecked,
                          snfAmount: isChecked,
                        },
                      }));
                    }
                  }}
                />
                <FaIcon name="arrows-h" size={16} />
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
                textStyle={{
                  color: '#000',
                  fontSize: 16,
                  textDecorationLine: 'none',
                }}
                isChecked={customer?.buffaloMilk?.fixedAmount}
                onPress={isChecked => {
                  setCustomer(prev => ({
                    ...prev,
                    buffaloMilk: {
                      ...prev.buffaloMilk,
                      fixedAmount: isChecked,
                      fatAmount: false,
                      snfAmount: false,
                    },
                  }));
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
                textStyle={{
                  color: '#000',
                  fontSize: 16,
                  textDecorationLine: 'none',
                }}
                isChecked={customer?.buffaloMilk?.fatAmount}
                onPress={isChecked => {
                  setCustomer(prev => ({
                    ...prev,
                    buffaloMilk: {
                      ...prev.buffaloMilk,
                      fatAmount: isChecked,
                      fixedAmount: false,
                      snfAmount: false,
                    },
                  }));
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
                textStyle={{
                  color: '#000',
                  fontSize: 16,
                  textDecorationLine: 'none',
                }}
                isChecked={customer?.buffaloMilk?.snfAmount}
                onPress={isChecked => {
                  setCustomer(prev => ({
                    ...prev,
                    buffaloMilk: {
                      ...prev.buffaloMilk,
                      snfAmount: isChecked,
                      fixedAmount: false,
                      fatAmount: false,
                    },
                  }));
                }}
              />
            </View>

            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <View
                style={{
                  width: '30%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 10,
                }}
              >
                <BouncyCheckbox
                  size={20}
                  fillColor="#9C27B0"
                  unFillColor="#F7F5FF"
                  style={{ width: '70%' }}
                  text="Cow"
                  iconStyle={{ borderColor: '#9C27B0' }}
                  innerIconStyle={{ borderWidth: 2 }}
                  textContainerStyle={{ marginLeft: 4 }}
                  textStyle={{
                    color: '#000',
                    fontSize: 16,
                    textDecorationLine: 'none',
                  }}
                  isChecked={customer?.cowMilk?.activeCowMilk}
                  onPress={isChecked => {
                    setCustomer(prev => ({
                      ...prev,
                      cowMilk: {
                        ...prev.cowMilk,
                        activeCowMilk: isChecked,
                      },
                    }));
                    if (!isChecked) {
                      setCustomer(prev => ({
                        ...prev,
                        cowMilk: {
                          ...prev.cowMilk,
                          morningTimeMilk: isChecked,
                          eveningTimeMilk: isChecked,
                          fixedAmount: isChecked,
                          fatAmount: isChecked,
                          snfAmount: isChecked,
                        },
                      }));
                    }
                  }}
                />
                <FaIcon name="arrows-h" size={16} />
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
                textStyle={{
                  color: '#000',
                  fontSize: 16,
                  textDecorationLine: 'none',
                }}
                isChecked={customer?.cowMilk?.fixedAmount}
                onPress={isChecked => {
                  setCustomer(prev => ({
                    ...prev,
                    cowMilk: {
                      ...prev.cowMilk,
                      fixedAmount: isChecked,
                      fatAmount: false,
                      snfAmount: false,
                    },
                  }));
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
                textStyle={{
                  color: '#000',
                  fontSize: 16,
                  textDecorationLine: 'none',
                }}
                isChecked={customer?.cowMilk?.fatAmount}
                onPress={isChecked => {
                  setCustomer(prev => ({
                    ...prev,
                    cowMilk: {
                      ...prev.cowMilk,
                      fatAmount: isChecked,
                      fixedAmount: false,
                      snfAmount: false,
                    },
                  }));
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
                textStyle={{
                  color: '#000',
                  fontSize: 16,
                  textDecorationLine: 'none',
                }}
                isChecked={customer?.cowMilk?.snfAmount}
                onPress={isChecked => {
                  setCustomer(prev => ({
                    ...prev,
                    cowMilk: {
                      ...prev.cowMilk,
                      snfAmount: isChecked,
                      fixedAmount: false,
                      fatAmount: false,
                    },
                  }));
                }}
              />
            </View>
            <View style={styles.stockContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setCustomer(prev => ({ ...prev, name: text }))
                  }
                  value={customer.name}
                  style={styles.textInput}
                  placeholder="Name"
                />
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={10}
                  onChangeText={text =>
                    setCustomer(prev => ({ ...prev, phoneNumber: text }))
                  }
                  value={customer.phoneNumber}
                  style={styles.textInput}
                  placeholder="Phone"
                />
              </View>
            </View>
            <View style={styles.stockContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={10}
                  onChangeText={text =>
                    setCustomer(prev => ({
                      ...prev,
                      buffaloRate: text,
                    }))
                  }
                  value={customer.buffaloRate}
                  style={styles.textInput}
                  placeholder="Buffalo Rate"
                />
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setCustomer(prev => ({ ...prev, cowRate: text }))
                  }
                  value={customer.cowRate}
                  style={styles.textInput}
                  placeholder="Cow Rate"
                />
              </View>
            </View>

            <View style={styles.stockContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setCustomer(prev => ({ ...prev, password: text }))
                  }
                  value={customer.password}
                  style={styles.textInput}
                  placeholder="Enter Password"
                />
              </View>
              <View style={[styles.inputBox, { width: '50%' }]}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setCustomer(prev => ({ ...prev, userCode: text }))
                  }
                  value={customer.userCode}
                  style={styles.textInput}
                  placeholder="User Code"
                />
              </View>
            </View>

            {customer?.buffaloMilk?.activeBuffaloMilk && (
              <View style={styles.stockContainer}>
                <View
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: '40%',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <Text style={{ color: '#9C27B0', fontWeight: 700 }}>
                      Buffalo Milk Time
                    </Text>
                    <FaIcon name="arrows-h" size={16} />
                  </View>

                  <View
                    style={{
                      width: '60%',
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                    }}
                  >
                    <BouncyCheckbox
                      size={25}
                      fillColor="#9C27B0"
                      unFillColor="#F7F5FF"
                      style={{ width: '50%' }}
                      text="Morning"
                      iconStyle={{ borderColor: '#9C27B0' }}
                      innerIconStyle={{ borderWidth: 2 }}
                      textContainerStyle={{ marginLeft: 6 }}
                      textStyle={{
                        color: '#000',
                        fontSize: 16,
                        textDecorationLine: 'none',
                      }}
                      isChecked={customer?.buffaloMilk?.morningTimeMilk}
                      onPress={isChecked => {
                        setCustomer(prev => ({
                          ...prev,
                          buffaloMilk: {
                            ...prev.buffaloMilk,
                            morningTimeMilk: isChecked,
                          },
                        }));
                      }}
                    />
                    <BouncyCheckbox
                      size={25}
                      fillColor="#9C27B0"
                      unFillColor="#F7F5FF"
                      style={{ width: '50%' }}
                      text="Evening"
                      iconStyle={{ borderColor: '#9C27B0' }}
                      innerIconStyle={{ borderWidth: 2 }}
                      textContainerStyle={{ marginLeft: 6 }}
                      textStyle={{
                        color: '#000',
                        fontSize: 16,
                        textDecorationLine: 'none',
                      }}
                      isChecked={customer?.buffaloMilk?.eveningTimeMilk}
                      onPress={isChecked => {
                        setCustomer(prev => ({
                          ...prev,
                          buffaloMilk: {
                            ...prev.buffaloMilk,
                            eveningTimeMilk: isChecked,
                          },
                        }));
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
            {customer?.cowMilk?.activeCowMilk && (
              <View style={styles.stockContainer}>
                <View
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: '40%',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <Text style={{ color: '#9C27B0', fontWeight: 700 }}>
                      Cow Milk Time
                    </Text>
                    <FaIcon name="arrows-h" size={16} />
                  </View>
                  <View
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                    }}
                  >
                    <BouncyCheckbox
                      size={25}
                      fillColor="#9C27B0"
                      unFillColor="#F7F5FF"
                      style={{ width: '30%' }}
                      text="Morning"
                      iconStyle={{ borderColor: '#9C27B0' }}
                      innerIconStyle={{ borderWidth: 2 }}
                      textContainerStyle={{ marginLeft: 6 }}
                      textStyle={{
                        color: '#000',
                        fontSize: 16,
                        textDecorationLine: 'none',
                      }}
                      isChecked={customer?.cowMilk?.morningTimeMilk}
                      onPress={isChecked => {
                        setCustomer(prev => ({
                          ...prev,
                          cowMilk: {
                            ...prev.cowMilk,
                            morningTimeMilk: isChecked,
                          },
                        }));
                      }}
                    />
                    <BouncyCheckbox
                      size={25}
                      fillColor="#9C27B0"
                      unFillColor="#F7F5FF"
                      style={{ width: '30%' }}
                      text="Evening"
                      iconStyle={{ borderColor: '#9C27B0' }}
                      innerIconStyle={{ borderWidth: 2 }}
                      textContainerStyle={{ marginLeft: 6 }}
                      textStyle={{
                        color: '#000',
                        fontSize: 16,
                        textDecorationLine: 'none',
                      }}
                      isChecked={customer?.cowMilk?.eveningTimeMilk}
                      onPress={isChecked => {
                        setCustomer(prev => ({
                          ...prev,
                          cowMilk: {
                            ...prev.cowMilk,
                            eveningTimeMilk: isChecked,
                          },
                        }));
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.stockContainer}>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={CreateCustomer}
              >
                <Text style={styles.text}>
                  {isEditCustomer ? 'Edit' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={bottomSheetDeleteIndex}
        onRequestClose={() => {}}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          alignSelf: 'center',
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  color: '#8e8e98ff',
                  textAlign: 'center',
                }}
              >
                Are you sure?. you want to delete this Customer
              </Text>

              <View style={styles.formBox}>
                <TouchableOpacity
                  style={styles.deletebutton}
                  onPress={() => setBottomSheetDeleteIndex(false)}
                >
                  <Text style={{ color: '#5086E7' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deletebuttonYes}
                  onPress={DeleteCustomers}
                >
                  <Text style={{ color: '#fff' }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Customers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stocksContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
  },
  cardContainer: {
    width: '95%',
    backgroundColor: '#fff',
    height: 60,
    marginTop: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e7eeff',
    display: 'flex',
    flexDirection: 'row',
  },
  cardOne: {
    width: '50%',
    height: '100%',
    display: 'flex',
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTwo: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingRight: 10,
  },
  contentContainer: {
    height: 300,
    padding: 36,
    alignItems: 'center',
  },
  ButtonBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    position: 'absolute',
    top: '90%',
    width: '90%',
  },
  button: {
    width: '90%',
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#5086E7',
    backgroundColor: '#5086E7',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  stockContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  inputBox: {
    width: '50%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
  },
  textInput: {
    padding: 10,
  },
  formBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  deletebutton: {
    width: '40%',
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#5086E7',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  deletebuttonYes: {
    width: '40%',
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#5086E7',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  timeContainer: {
    marginLeft: 5,
    flexDirection: 'row',
    gap: 10, // spacing between circles (or use marginRight)
  },

  circle: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#5086E7',
    borderRadius: 20, // makes it a circle
    // backgroundColor: '#5086E7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeText: {
    color: '#5086E7',
    fontWeight: '700',
    fontSize: 12,
  },
});
