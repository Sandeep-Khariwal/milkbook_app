import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../token/tokenStorage';
import BottomSheet from '@gorhom/bottom-sheet';
import FeIcon from 'react-native-vector-icons/Feather';
import { SelectList } from 'react-native-dropdown-select-list';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import DatePicker from 'react-native-date-picker';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const AddEntryAndSale = (props: {
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
  const firm = useSelector((state: any) => state.firm.value);
  const bottomSheetRefAdd = useRef<BottomSheet>(null);
  const [bottomSheetAdd, setBottomSheetAdd] = useState<boolean>(false);
  const [bottomSheetSale, setBottomSheetSale] = useState<boolean>(false);

  const weightRef = useRef(null);
  const fatRef = useRef(null);
  const snfRef = useRef(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [milkEntry, setMilkEntry] = useState<{
    fat: string;
    weight: string;
    timeZone: string;
    _id: string;
  }>({
    fat: '',
    weight: '',
    timeZone: '',
    _id: '',
  });

  const [stocks, setStocks] = useState<
    { item: string; quantity: number; _id: string; price: number }[]
  >([]);

  const [selected, setSelected] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const [isBuffalo, setIsBuffalo] = useState<boolean>(true);

  useEffect(() => {
    if (date) {
      const nowDate = new Date(date);
      const hours = nowDate.getHours();
      const timeOfDay = hours < 12 ? 'M' : 'E';
      setMilkEntry(prev => ({ ...prev, timeZone: timeOfDay }));
    }
  }, [date]);

  useEffect(() => {
    getAllItems();
  }, []);

  const getAllItems = async () => {
    await fetch(`${BASE_URL}/firm/stocks/${firm.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { stocks } = await res.json();
        setStocks(stocks);
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  const addEntry = async () => {
    setBottomSheetAdd(false);
    if (!milkEntry.weight) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: `All Fields Required!`,
      });

      return;
    }
    let amount;

    if (milkEntry.fat) {
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
      fat: Number(milkEntry.fat) ?? 0,
      rate: isBuffalo
        ? Number(props.customer.buffaloRate)
        : Number(props.customer.cowRate),
      timeZone: milkEntry.timeZone,
      amount: amount,
      customer: props.customer._id,
      firm: firm.id,
      date: date,
      _id: milkEntry._id,
      isBuffalo: isBuffalo,
    };

    setIsLoading(true);

    await fetch(`${BASE_URL}/entry/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res: any) => {
        setIsLoading(false);

        setMilkEntry({
          fat: '',
          weight: '',
          timeZone: '',
          _id: '',
        });
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `Milk Added`,
        });
        props.dataUpdate();
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
    bottomSheetRefAdd.current?.close();
  };

  const saleProduct = async () => {
    setBottomSheetSale(false);
    if (!selectedQuantity || !selected) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: `All Fields Required!`,
      });
      return;
    }
    setIsLoading(true);

    const selectedStock = stocks.find((stock: any) => stock._id === selected);
    let amount = Number(selectedQuantity) * (selectedStock?.price ?? 1);
    const payload = {
      firm: firm.id,
      stockId: selected,
      quantity: Number(selectedQuantity),
      amount: amount,
      user: props.customer._id,
      userType: props.userType,
      productName: selectedStock.item,
      date: saleDate,
    };

    await fetch(`${BASE_URL}/history/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res: any) => {
        const data = await res.json();
        setSelected('');
        setSelectedQuantity('');
        setIsLoading(false);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `Product saled`,
        });
        props.dataUpdate();
      })
      .catch(e => {
        console.log(e);
        setIsLoading(false);
      });
  };
  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }
  return (
    <View style={{ ...styles.container }}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          setBottomSheetAdd(true);
        }}
      >
        <Text style={{ color: '#5086E7', fontWeight: 600 }}>Add Milk</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          setBottomSheetSale(true);
        }}
      >
        <Text style={{ color: '#5086E7', fontWeight: 600 }}>Sale</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={bottomSheetAdd}
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
              <Text style={{ color: '#333', fontSize: 24 }}>
                Add Milk ({milkEntry.timeZone})
              </Text>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setBottomSheetAdd(false);
                }}
              />
            </View>

            <View style={styles.IconContainer}>
              <TouchableOpacity
                style={[styles.iconWrapper, isBuffalo && styles.selected]}
                onPress={() => setIsBuffalo(true)}
              >
                <Image
                  source={require('../../assets/buffalo.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconWrapper, !isBuffalo && styles.selected]}
                onPress={() => setIsBuffalo(false)}
              >
                <Image
                  source={require('../../assets/cow.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.stockContainer, { height: 50, marginTop: 10 }]}
            >
              <TouchableOpacity
                onPress={() => weightRef.current?.focus()}
                style={[
                  styles.inputBox,
                  { width: props.userType === 'farmer' ? '45%' : '95%' },
                ]}
              >
                <TextInput
                  editable
                  ref={weightRef}
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
              </TouchableOpacity>
              {props.userType === 'farmer' && (
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
            </View>

            <View style={[styles.stockContainer, { height: 50 }]}>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setOpen(true)}
              >
                <View>
                  <TextInput
                    editable={false}
                    value={date.toDateString()}
                    onChangeText={() => {}} // ❌ ignores input
                    style={styles.textInput}
                    placeholder="pick Date"
                  />
                  <Modal visible={open} transparent animationType="fade">
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
                          date={date}
                          onDateChange={setDate}
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
                            onPress={() => setOpen(false)}
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
                            onPress={() => setOpen(false)}
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
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: '#5086E7', width: '45%' },
                ]}
              >
                <TouchableOpacity onPress={addEntry}>
                  <Text
                    style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}
                  >
                    Add Milk
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={bottomSheetSale}
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
          <View style={[styles.modalView, { padding: 20 }]}>
            <View style={{ width: '100%', alignSelf: 'flex-end', padding: 10 }}>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setBottomSheetSale(false);
                }}
              />
            </View>
            <View
              style={{
                width: '100%',
                padding: 10,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-around',
                gap: 10,
              }}
            >
              <View style={{ width: '50%' }}>
                <View style={{ zIndex: 1000 }}>
                  <SelectList
                    setSelected={(val: string) => setSelected(val)}
                    data={stocks.map((stk: any) => ({
                      key: stk._id,
                      value: stk.item,
                    }))}
                    save="key"
                    boxStyles={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#5086E7',
                      backgroundColor: '#fff',
                      height: 42,
                    }}
                    dropdownStyles={{
                      width: '100%',
                      maxHeight: 100,
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#5086E7',
                      elevation: 6,
                    }}
                    dropdownItemStyles={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                    }}
                  />
                </View>
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text => setSelectedQuantity(text)}
                  value={selectedQuantity}
                  style={styles.textInput}
                  placeholder="Quantity"
                />
              </View>
            </View>
            <View style={[styles.stockContainer, { height: 50 }]}>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setOpen(true)}
              >
                <View>
                  <TextInput
                    editable={false}
                    value={saleDate.toDateString()}
                    onChangeText={() => {}} // ❌ ignores input
                    style={styles.textInput}
                    placeholder="sale Date"
                  />
                  <Modal visible={open} transparent animationType="fade">
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
                          date={saleDate}
                          onDateChange={setSaleDate}
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
                            onPress={() => setOpen(false)}
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
                            onPress={() => setOpen(false)}
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
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: '#5086E7',
                    width: '45%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <TouchableOpacity onPress={saleProduct}>
                  <Text
                    style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}
                  >
                    Sale
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddEntryAndSale;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: '30%',
    height: 30,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#5086E7',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockContainer: {
    width: '100%',
    height: 100,
    display: 'flex',
    flexDirection: 'row',
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
  textInput: {
    padding: 10,
    flex: 1,
    width: '100%',
  },
  bottomSheetAdd: {},
  button: {
    width: '30%',
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
  bottomView: {
    height: 500,
  },
  bottomViewSale: {
    height: 500,
  },
  dropdownStyle: {
    borderRadius: 10, // Optional, to give it a nice rounded corner
    height: 300, // Ensure the height of the dropdown is large enough
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

  IconContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    gap: 15,
    marginLeft: 12,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  selected: {
    borderColor: '#2e86de',
    backgroundColor: '#eaf2ff',
  },
});
