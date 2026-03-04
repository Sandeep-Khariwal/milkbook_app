import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../../token/tokenStorage';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../utility/helperFunctions';
import FeIcon from 'react-native-vector-icons/Feather';

const ShowHistory = ({ route }: { route: any }) => {
  const firm = useSelector((state: any) => state.firm.value);
  const customerId = route.params.customerId;
  const firmId = route.params.firmId;
  const userType = route.params.userType;
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [stocks, setStocks] = useState<
    {
      item: string;
      quantity: number;
      price: string;
      _id: string;
    }[]
  >([]);
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [stockCountMap, setStockCountMap] = useState<Map<string, number>>(
    new Map(),
  );

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

  const [allHistory, setAllHistory] = useState<
    {
      _id: string;
      user: { _id: string; name: string };
      firm: string;
      productName: string;
      description: string;
      amount: number;
      quantity: number;
      date: string;
    }[]
  >([]);

  const [showHistory, setShowHistory] = useState<
    {
      _id: string;
      user: { _id: string; name: string };
      firm: string;
      productName: string;
      description: string;
      amount: number;
      quantity: number;
      date: string;
    }[]
  >([]);

  const [selectedHistory, setSelectedHistory] = useState<{
    _id: string;
    user: { _id: string; name: string };
    firm: string;
    productName: string;
    description: string;
    amount: number;
    quantity: number;
    date: string;
  }>({
    _id: '',
    user: { _id: '', name: '' },
    firm: '',
    productName: '',
    description: '',
    amount: 0,
    quantity: 0,
    date: '',
  });

  const [isEditHistory, setIsEditHistory] = useState<boolean>(false);

  useEffect(() => {
    if (selectedStock !== 'all' && selectedStock) {
      const filteredHistory = allHistory.filter(
        (hist: any) => hist.productName === selectedStock,
      );
      setShowHistory(filteredHistory);
    } else if (selectedStock === 'all') {
      setShowHistory(allHistory);
    }
  }, [selectedStock]);

  useEffect(() => {
    if (firmId) {
      getAllHistory(firmId);
      setIsLoading(true);
    }
    if (customerId) {
      getUserHistory(customerId);
      setIsLoading(true);
    }
  }, [firmId, customerId]);

  const getAllHistory = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/history/all/${id}?month=1`);
      const { data } = await res.json();

      setAllHistory(data);
      setShowHistory(data);
      setIsLoading(false);

      const newMap = new Map();

      data.forEach((stk: any) => {
        if (!newMap.has(stk.productName)) {
          newMap.set(stk.productName, 1);
        } else {
          newMap.set(stk.productName, newMap.get(stk.productName)! + 1);
        }
      });
      setStockCountMap(newMap);
    } catch (e) {
      console.log(e);
    }
  };
  const getUserHistory = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/history/user/${id}`);
      const { data } = await res.json();

      setAllHistory(data);
      setShowHistory(data);

      setIsLoading(false);
      const newMap = new Map();

      data.forEach((stk: any) => {
        if (!newMap.has(stk.productName)) {
          newMap.set(stk.productName, 1);
        } else {
          newMap.set(stk.productName, newMap.get(stk.productName)! + 1);
        }
      });
      setStockCountMap(newMap);
    } catch (e) {
      console.log(e);
    }
  };

  const SeeAllHistory = () => {
    let payload;
    if (firmId) {
      payload = {
        firmId: firmId,
        userType: userType,
      };
    } else {
      payload = {
        customerId: customerId,
        userType: userType,
      };
    }
    navigation.navigate('AllHistory', payload);
  };

  const deleteHistory = async (history: any) => {
    try {
      const payload = {
        userId: customerId,
        amount: history.amount,
        userType: userType,
      };

      const res = await fetch(`${BASE_URL}/history/delete/${history._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (firmId) {
        getAllHistory(firmId);
        setIsLoading(true);
      }
      if (customerId) {
        getUserHistory(customerId);
        setIsLoading(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const editHistory = async () => {
    try {
      const foundSigleHist = showHistory.find(
        (hist: any) => hist.productName === selectedHistory.productName,
      );

      const rate =
        Number(foundSigleHist.amount) / Number(foundSigleHist.quantity);

      const payload = {
        userId: customerId,
        amount: rate * selectedHistory.quantity,
        quantity: selectedHistory.quantity,
      };

      await fetch(`${BASE_URL}/history/update/${selectedHistory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then(async (res: any) => {
          const data = await res.json();
          setIsEditHistory(false);
          if (firmId) {
            getAllHistory(firmId);
            setIsLoading(true);
          }
          if (customerId) {
            getUserHistory(customerId);
            setIsLoading(true);
          }
        })
        .catch((e: any) => {
          console.log(e);
        });

      setIsEditHistory(false);
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
       
          <View style={styles.row}>
            <Text style={styles.productName}>{item.productName}</Text>

            <View
              style={{
                width: '40%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
               {item.productName && (

              <FeIcon
                name="edit"
                size={20}
                color="#5086E7"
                style={{ alignSelf: 'center' }}
                onPress={() => {
                  setIsEditHistory(true);
                  setSelectedHistory(item);
                }}
              />
               )}

              <FeIcon
                name="trash-2"
                size={24}
                color="#FF0000"
                onPress={() => {
                  deleteHistory(item);
                }}
              />
            </View>
          </View>


        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.user?.name || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{item.quantity}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>

          <Text
            style={[
              styles.value,
              {
                color: item.amount < 0 ? 'red' : 'green',
              },
            ]}
          >
            ₹ {item.amount < 0 ? '-' : '+'}
            {Math.abs(item.amount)}
          </Text>
        </View>

        <Text style={styles.date}>{formatDate(new Date(item.date))}</Text>
        {item.description && (
          <View style={styles.row}>
            <Text style={styles.value}>{item.description}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            style={[styles.backBox, { alignSelf: 'flex-start' }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={32} color="#FFF" />
            <Text style={styles.historyText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.backBox,
              { alignSelf: 'flex-end', justifyContent: 'flex-end' },
            ]}
            onPress={SeeAllHistory}
          >
            <Text style={styles.historyText}>See all</Text>
            <Icon name="chevron-forward" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>1 Month History</Text>
      </View>

      {/* show filter buttons */}
      <View
        style={{
          width: '100%',
          padding: 10,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {stocks.map(stk => {
          const isSelected = selectedStock === stk.item;

          return (
            <TouchableOpacity
              key={stk._id}
              onPress={() => setSelectedStock(stk.item)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? '#5086E7' : '#ccc',
                backgroundColor: isSelected ? '#5086E7' : '#fff',
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#fff' : '#111',
                  fontWeight: '500',
                }}
              >
                {stk.item} ({stockCountMap.get(stk.item)})
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => setSelectedStock('all')}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: selectedStock === 'all' ? '#5086E7' : '#ccc',
            backgroundColor: selectedStock === 'all' ? '#5086E7' : '#fff',
          }}
        >
          <Text
            style={{
              color: selectedStock === 'all' ? '#fff' : '#111',
              fontWeight: '500',
            }}
          >
            all
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <FlatList
        data={showHistory}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history found</Text>
        }
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditHistory}
        onRequestClose={() => {}}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
              <Text style={{ color: '#333', fontSize: 24 }}>Edit History</Text>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => setIsEditHistory(false)}
              />
            </View>

            <View style={[styles.stockContainer, { height: 50 }]}>
              <View
                style={[
                  styles.inputBox,
                  // { width: props.userType === 'farmer' ? '45%' : '95%' },
                ]}
              >
                <TextInput
                  // editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  // onChangeText={text => {
                  //   setSelectedHistory((prev:any)=>({...prev,}))
                  // }}
                  value={selectedHistory.productName}
                  style={styles.textInput}
                  placeholder="Weight"
                />
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text => {
                    setSelectedHistory((prev: any) => ({
                      ...prev,
                      quantity: Number(text),
                    }));
                  }}
                  value={String(selectedHistory.quantity)}
                  style={styles.textInput}
                  placeholder="Fat"
                />
              </View>
            </View>

            <View style={[styles.stockContainer, { height: 50 }]}>
              <TouchableOpacity
                onPress={() => {
                  editHistory();
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  backgroundColor: '#5086E7',
                  width: '100%',
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
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShowHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    // paddingTop: 2,
    paddingBottom: 25,
  },
  heroContainer: {
    width: '100%',
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    alignItems: 'center',
    backgroundColor: '#5086E7',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backBox: {
    width: '50%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  historyText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: '600',
    marginTop: 10,
  },

  /* Card styles */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: '500',
  },
  date: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
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
  },
});
