import React, { Component, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { BASE_URL } from '../../../token/tokenStorage';
import AntIcon from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-date-picker';
import FeIcon from 'react-native-vector-icons/Feather';
import FaIcon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useSelector } from 'react-redux';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const EntriesTable = (props: {
  userId: string;
  isCustomer: boolean;
  customer: {
    name: string;
    buffaloRate: number;
    cowRate: number;
    phoneNumber: string;
    _id: string;
  };
  userType: string;
  dataUpdate: () => void;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const firm = useSelector((state: any) => state.firm.value);
  const [openFromDate, setOpenFromDate] = useState<boolean>(false);
  const [openToDate, setOpenToDate] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [isBuffalo, setIsBuffalo] = useState<boolean>(false);
  const [allEntries, setAllEntries] = useState<
    {
      _id: String;
      fat: number;
      weight: number;
      amount: number;
      timeZone: string;
      date: Date;
    }[]
  >([]);

  const [milkEntry, setMilkEntry] = useState<{
    _id: String;
    fat: string;
    weight: string;
    amount: number;
    timeZone: string;
    date: Date;
  }>({
    _id: '',
    fat: '',
    weight: '',
    amount: 0,
    timeZone: '',
    date: new Date(),
  });

  const state = {
    tableHead: [
      <Text style={{ textAlign: 'center' }}>Date</Text>,
      <Text style={{ textAlign: 'center' }}>Wieght</Text>,
      <Text style={{ textAlign: 'center' }}>
        {props.userType === 'farmer' ? 'FAT' : 'Amount'}
      </Text>,
      <Text style={{ textAlign: 'center' }}>Time</Text>,
      <Text style={{ textAlign: 'center' }}>
        {props.isCustomer ? 'Amount' : 'Action'}
      </Text>,
    ],
    tableData: allEntries.map((ent: any, i: number) => {
      return [
        <Text style={{ textAlign: 'center', padding: 3 }}>
          {new Date(ent.date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
          })}
        </Text>,
        <Text style={{ textAlign: 'center' }}>{ent.weight}</Text>,
        <Text style={{ textAlign: 'center' }}>
          {props.userType === 'farmer' ? ent.fat : ent.amount}
        </Text>,
        <Text style={{ textAlign: 'center' }}>{ent.timeZone}</Text>,
        <Text style={{ textAlign: 'center' }}>
          {props.isCustomer ? (
            ent.amount
          ) : (
            <FeIcon
              name="edit"
              size={24}
              color="#5086E7"
              style={{ textAlign: 'center' }}
              onPress={() => {
                setOpenEditModal(true);

                setMilkEntry({
                  _id: ent._id,
                  fat: String(ent.fat),
                  weight: String(ent.weight),
                  amount: 0,
                  timeZone: ent.timeZone,
                  date: new Date(ent.date),
                });
              }}
            />
          )}
        </Text>,
      ];
    }),
  };

  useEffect(() => {
    if (!fromDate && !toDate && props.userId) {
      getAllEntries(props.userId);
    }
  }, [props.userId, fromDate, toDate]);

  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }

  const getAllEntries = async (id: string) => {
    setIsLoading(true);

    let query;
    if (fromDate === toDate) {
      query = new URLSearchParams({
        skip: String(skip),
      }).toString();
    } else {
      query = new URLSearchParams({
        fromDate: (fromDate ?? new Date()).toISOString(),
        toDate: (toDate ?? new Date()).toISOString(),
        skip: String(skip),
      }).toString();
    }

    await fetch(`${BASE_URL}/entry/${id}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { data } = await res.json();
        const filteredData = data.map((ent: any) => {
          return {
            _id: ent._id,
            fat: ent.fat,
            weight: ent.weight,
            amount: ent.amount,
            timeZone: ent.timeZone,
            date: ent.date,
          };
        });

        setAllEntries(filteredData);
        setIsLoading(false);
      })
      .catch(e => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const EditMilkEntry = async () => {
    setOpenEditModal(false);
    if (!milkEntry.weight) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: `All Fields Required!`,
      });

      return;
    }
    let amount;

    if (Number(milkEntry.fat)) {
      if (isBuffalo) {
        amount =
          (Number(milkEntry.fat) *
            Number(milkEntry.weight) *
            Number(props.customer.buffaloRate)) /
          100;
      } else {
        amount =
          (Number(milkEntry.fat) *
            Number(milkEntry.weight) *
            Number(props.customer.cowRate)) /
          100;
      }
    } else {
      if (isBuffalo) {
        amount = Number(milkEntry.weight) * Number(props.customer.buffaloRate);
      } else {
        amount = Number(milkEntry.weight) * Number(props.customer.cowRate);
      }
    }

    const payload = {
      weight: milkEntry.weight,
      fat: milkEntry.fat,
      rate: isBuffalo
        ? Number(props.customer.buffaloRate)
        : Number(props.customer.cowRate),
      timeZone: milkEntry.timeZone,
      amount: amount,
      customer: props.customer._id,
      firm: firm.id,
      date: milkEntry.date,
      _id: milkEntry._id,
    };

    // return

    await fetch(`${BASE_URL}/entry/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res: any) => {
        const { data } = await res.json();
        setIsLoading(false);

        setMilkEntry({
          _id: '',
          fat: '',
          weight: '',
          amount: 0,
          timeZone: '',
          date: new Date(),
        });
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `Milk Added`,
        });
        getAllEntries(props.userId);
        props.dataUpdate();
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopEndRadius: 15,
          borderTopStartRadius: 15,
        }}
      >
        <View style={[styles.stockContainer, { width: '40%', height: 50 }]}>
          <TouchableOpacity
            style={[styles.inputBox, { width: '90%' }]}
            onPress={() => setOpenFromDate(true)}
          >
            <View style={{ width: '100%' }}>
              <TextInput
                editable={false}
                value={fromDate?.toDateString() || ''}
                style={[styles.textInput, { width: '100%' }]}
                placeholder="From Date"
              />
              <Modal visible={openFromDate} transparent animationType="fade">
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 16,
                      width: '90%',
                    }}
                  >
                    <DatePicker
                      date={fromDate ?? new Date()}
                      onDateChange={setFromDate}
                      mode="datetime"
                    />

                    {/* Buttons */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginTop: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setOpenFromDate(false)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: '#5086E7',
                          width: '30%',
                          borderRadius: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: '#999',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setOpenFromDate(false)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          backgroundColor: '#5086E7',
                          width: '30%',
                          borderRadius: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* <ConfirmButton disabled={state === "spinning"} /> */}
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.stockContainer, { width: '40%', height: 50 }]}>
          <TouchableOpacity
            style={[styles.inputBox, { width: '90%' }]}
            onPress={() => setOpenToDate(true)}
          >
            <View>
              <TextInput
                editable={false}
                value={toDate?.toDateString() || ''}
                style={styles.textInput}
                placeholder="To Date"
              />
              <Modal visible={openToDate} transparent animationType="fade">
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 16,
                      width: '90%',
                    }}
                  >
                    <DatePicker
                      date={toDate ?? new Date()}
                      onDateChange={setToDate}
                      mode="datetime"
                    />

                    {/* Buttons */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginTop: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setOpenToDate(false)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: '#5086E7',
                          width: '30%',
                          borderRadius: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: '#999',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setOpenToDate(false)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          backgroundColor: '#5086E7',
                          width: '30%',
                          borderRadius: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* <ConfirmButton disabled={state === "spinning"} /> */}
            </View>
          </TouchableOpacity>

          <FaIcon
            name="search"
            size={30}
            color={'#5086E7'}
            style={{ marginLeft: 10 }}
            onPress={() => getAllEntries(props.userId)}
          />
          <FeIcon
            name="delete"
            size={30}
            color={'#5086E7'}
            style={{ marginLeft: 10 }}
            onPress={() => {
              setFromDate(null);
              setToDate(null);
            }}
          />
        </View>
      </View>

      <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
        <Row
          data={state.tableHead}
          style={styles.head}
          textStyle={styles.text}
        />
        <Rows data={state.tableData} textStyle={styles.text} />
      </Table>
      <Modal
        visible={openEditModal}
        transparent
        animationType="fade"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
          alignSelf: 'center',
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
              }}
            >
              <Text style={{ color: '#333', fontSize: 24 }}>Edit Milk</Text>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setOpenEditModal(false);
                  // setBottomSheetAdd(false);

                  // setBottomSheetIndex(false);
                  // setIsEditStock(false);
                  // setStockName('');
                  // setStockPrice('');
                  // setStockQuantity('');
                  // setSelectedStock({
                  //   item: '',
                  //   quantity: 0,
                  //   _id: '',
                  //   price: 0,
                  // });
                }}
              />
            </View>
            <View style={styles.IconContainer}>
              <TouchableOpacity
                style={[styles.iconWrapper, !isBuffalo && styles.selected]}
                onPress={() => setIsBuffalo(false)}
              >
                <Image
                  source={require('../../assets/cow.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconWrapper, isBuffalo && styles.selected]}
                onPress={() => setIsBuffalo(true)}
              >
                <Image
                  source={require('../../assets/buffalo.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.stockContainer, { height: 50 }]}>
              {props.userType !== 'customer' && (
                <View style={styles.inputBox}>
                  <TextInput
                    editable
                    multiline
                    numberOfLines={4}
                    maxLength={40}
                    onChangeText={text =>
                      setMilkEntry(prev => ({ ...prev, fat: text }))
                    }
                    value={milkEntry.fat}
                    style={styles.textInput}
                    placeholder="Fat"
                  />
                </View>
              )}
              <View
                style={[
                  styles.inputBox,
                  { width: props.userType !== 'customer' ? '50%' : '95%' },
                ]}
              >
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setMilkEntry(prev => ({ ...prev, weight: text }))
                  }
                  value={milkEntry.weight}
                  style={styles.textInput}
                  placeholder="Weight"
                />
              </View>
            </View>

            <View style={[styles.stockContainer, { height: 50 }]}>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: '#5086E7', width: '95%' },
                ]}
              >
                <TouchableOpacity onPress={EditMilkEntry}>
                  <Text
                    style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}
                  >
                    Edit Milk
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* </View> */}
      </Modal>
    </ScrollView>
  );
};

export default EntriesTable;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6, backgroundColor: '#fff' },
  tData: { backgroundColor: '#fff' },
  stockContainer: {
    width: '100%',
    height: 100,
    display: 'flex',
    flexDirection: 'row',
    // gap: 10,
    // margin: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inputBox: {
    width: '45%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    padding: 10,
  },
  IconContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    // alignItems: "center",
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    gap: 10,
    marginLeft: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  selected: {
    borderColor: '#2e86de',
    backgroundColor: '#eaf2ff',
  },
});
