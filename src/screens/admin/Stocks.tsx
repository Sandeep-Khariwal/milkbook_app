import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL, getToken } from '../../../token/tokenStorage';
import { useSelector } from 'react-redux';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import { useNavigation } from '@react-navigation/native';
import { SelectList } from 'react-native-dropdown-select-list';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const Stocks = () => {
  const firm = useSelector((state: any) => state.firm.value);
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.customer.value);
  console.log('user : ', user.id, firm.id);
  const [stockName, setStockName] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('');
  const [stockPrice, setStockPrice] = useState<string>('');
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefDelete = useRef<BottomSheet>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState<boolean>(false);
  const [bottomSheetDeleteIndex, setBottomSheetDeleteIndex] =
    useState<boolean>(false);

  const [showSaleModal, setShowSaleModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<string>('');

  const [stocks, setStocks] = useState<
    {
      item: string;
      quantity: number;
      price: string;
      _id: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedStock, setSelectedStock] = useState<{
    item: string;
    quantity: number;
    price: number;
    _id: string;
  }>({ item: '', quantity: 0, _id: '', price: 0 });

  const [isEditStock, setIsEditStock] = useState<boolean>(false);

  // callbacks
  // const handleSheetChanges = useCallback((index: number) => {
  //   setBottomSheetIndex(index);
  // }, []);
  // const handleSheetChangesDelete = useCallback((index: number) => {
  //   setBottomSheetDeleteIndex(index);
  // }, []);

  useEffect(() => {
    const getStocks = async () => {
      setIsLoading(true);
      await fetch(`${BASE_URL}/firm/stocks/${firm.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (res: any) => {
          const { stocks } = await res.json();
          setStocks(stocks);
          setIsLoading(false);
        })
        .catch((e: any) => {
          console.log(e);
          setIsLoading(false);
        });
    };
    getStocks();
  }, []);

  const CreateStock = async () => {
    if (!stockName || !stockQuantity || !stockPrice) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'All Fields Required!!',
      });
      return;
    }
    setIsLoading(true);
    await fetch(`${BASE_URL}/firm/addNewProduct/${firm.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: stockName,
        quantity: stockQuantity,
        price: Number(stockPrice),
        _id: selectedStock._id ?? '',
      }),
    })
      .then(async (res: any) => {
        const { stocks } = await res.json();

        setStocks(stocks);
        setStockName('');
        setStockQuantity('');
        setStockPrice('');
        setIsLoading(false);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Congrats',
          textBody: 'New Stock added',
        });
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });

    setBottomSheetIndex(false);
    bottomSheetRef.current?.close();
  };

  const DeleteStock = async () => {
    setIsLoading(true);
    const token = (await getToken()) ?? '';
    await fetch(`${BASE_URL}/firm/delete/${firm.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stockId: selectedStock._id }),
    })
      .then(async (res: any) => {
        const { stocks } = await res.json();
        // console.log('stocks data : ', data);

        setStocks(stocks);
        setIsLoading(false);
        setSelectedStock({ item: '', quantity: 0, _id: '', price: 0 });
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });

    setBottomSheetDeleteIndex(false);
    bottomSheetRefDelete.current?.close();
  };
  if (isLoading) {
    return (
      <LoadingOverlay visible={isLoading} />
    );
  }

  const saleProduct = async () => {
    console.log('selected : ', selected, selectedQuantity);

    if (!selected || !selectedQuantity) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'All Fields Required!!',
      });
      return;
    }
    setShowSaleModal(false);

    const productName = stocks.find((stk: any) => stk._id === selected)?.item;
    const rate = stocks.find((stk: any) => stk._id === selected)?.price;


    console.log("Number(selectedQuantity) : ",Number(selectedQuantity));
    
    await fetch(`${BASE_URL}/history/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: '',
        firm: firm.id,
        productName: productName,
        amount: Number(selectedQuantity) * Number(rate),
        quantity: Number(selectedQuantity),
        stockId:selected
      }),
    })
      .then(async (res: any) => {
        const { data } = await res.json();
        setIsLoading(false);
        setSelected('');
        setSelectedQuantity('');
        setStocks((prev:any)=>(prev.map((stk:any)=>{
                  if(stk._id === selected){
            stk.quantity = stk.quantity - Number(selectedQuantity)
            return stk
          }
          return stk
        })))
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Stocks updated!!',
        });
      })
      .catch((e: any) => {
        console.log(e);
      });
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          width: '100%',
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          style={[styles.button, { width: '30%' }]}
          onPress={() => setShowSaleModal(true)}
        >
          <Text style={styles.text}>Sale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { width: '30%' }]}
          onPress={() => navigation.navigate('History',{firmId:firm.id})}
        >
          <Text style={styles.text}>History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stocksContainer}>
        {stocks && stocks.length > 0 ? (
          stocks.map((stock: any) => (
            <View key={stock._id} style={styles.cardContainer}>
              <View style={styles.cardOne}>
                <Text
                  style={{ fontSize: 20, fontWeight: 700, color: '#3b613cff' }}
                >
                  {stock.item}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: stock.quantity < 5 ? '#cf3434ff' : '#3b613cff',
                  }}
                >
                  {stock.quantity} available
                </Text>
              </View>
              <View style={styles.cardTwo}>
                <Icon
                  name="edit"
                  size={26}
                  color="#333"
                  onPress={() => {
                    setIsEditStock(true);
                    setBottomSheetIndex(true);
                    setStockName(stock.item);

                    setStockPrice(String(stock.price));
                    setStockQuantity(String(stock.quantity));
                    setSelectedStock(stock);
                  }}
                />
                <Icon
                  name="trash-2"
                  size={24}
                  color="#FF0000"
                  onPress={() => {
                    setBottomSheetDeleteIndex(true), setSelectedStock(stock);
                  }}
                />
              </View>
            </View>
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
              No stocks created yet
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ButtonBox}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setBottomSheetIndex(true)}
        >
          <Text style={styles.text}>Create Stock</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={bottomSheetIndex}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          // setModalVisible(!modalVisible);
        }}
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
                  setIsEditStock(false);
                  setStockName('');
                  setStockPrice('');
                  setStockQuantity('');
                  setSelectedStock({
                    item: '',
                    quantity: 0,
                    _id: '',
                    price: 0,
                  });
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
                  onChangeText={text => setStockName(text)}
                  value={stockName}
                  style={styles.textInput}
                  placeholder="Stock Name"
                />
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text => setStockQuantity(text)}
                  value={stockQuantity}
                  style={styles.textInput}
                  placeholder="Stock Quantity"
                />
              </View>
            </View>

            <View
              style={{
                ...styles.stockContainer,
                marginTop: 10,
                marginBottom: 15,
              }}
            >
              <View style={{ ...styles.inputBox }}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text => setStockPrice(text)}
                  value={stockPrice}
                  style={styles.textInput}
                  placeholder="Price"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  { width: !bottomSheetIndex ? '50%' : '50%' },
                ]}
                onPress={CreateStock}
              >
                <Text style={styles.text}>
                  {isEditStock ? 'Edit' : 'Create'}
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
        onRequestClose={() => {
          setBottomSheetDeleteIndex(false);
        }}
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
            {/* <View style={{ width: '100%', alignSelf: 'flex-end', padding: 10 }}>
              <Icon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setBottomSheetIndex(false);
                }}
              />
            </View> */}
            <View>
              <Text
                style={{
                  fontSize: 18,
                  color: '#8e8e98ff',
                  textAlign: 'center',
                }}
              >
                Are you sure?. you want to delete this stock
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
                  onPress={DeleteStock}
                >
                  <Text style={{ color: '#fff' }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showSaleModal}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          // setModalVisible(!modalVisible);
        }}
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
              <Icon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setShowSaleModal(false);
                }}
              />
            </View>
            <View
              style={{
                width: '90%',
                padding: 10,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-around',
                gap: 10,
              }}
            >
              <View style={{ width: '50%' }}>
                <SelectList
                  setSelected={(val: any) => {
                    setSelected(val);
                  }}
                  data={stocks.map((stk: any) => ({
                    key: stk._id,
                    value: stk.item,
                  }))}
                  save="key"
                  dropdownStyles={{
                    maxHeight: 150,
                    minWidth: '50%',
                    // maxWidth: '40%',
                  }}
                  // defaultOption={}
                />
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
              <MaIcon
                name="add-circle-outline"
                size={34}
                color="#5086E7"
                onPress={saleProduct}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Stocks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stocksContainer: {
    height: '195%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  cardContainer: {
    width: '95%',
    backgroundColor: '#fff', //e7e7eeff
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
    justifyContent: 'center',
    paddingLeft: 10,
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
    height: 200,
    padding: 36,
    // alignItems: 'center',
    // paddingBottom:50
  },
  ButtonBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    margin: 10,
    position: 'absolute',
    top: '85%',
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
