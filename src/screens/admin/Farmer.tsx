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
import { BASE_URL, getToken } from '../../../token/tokenStorage';
import { useSelector } from 'react-redux';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FaIcon from 'react-native-vector-icons/Ionicons';
import {
  ALERT_TYPE,
  Toast,
} from 'react-native-alert-notification';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const Farmers = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState<string>('');
  const firm = useSelector((state: any) => state.firm.value);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Farmer, setFarmer] = useState<{
    name: string;
    phoneNumber: string;
    password: string;
    cowRate: string;
    buffaloRate: string;
    userCode: string;
    _id: string;
  }>({
    name: '',
    phoneNumber: '',
    password: '',
    buffaloRate: '',
    cowRate: '',
    userCode: '',
    _id: '',
  });
  const [allFarmer, setAllFarmer] = useState<
    {
      name: string;
      buffaloRate: string;
      cowRate: string;
      phoneNumber: string;
      userCode: string;
      _id: string;
    }[]
  >([]);
  const [allShowFarmer, setAllShowFarmer] = useState<
    {
      name: string;
      buffaloRate: string;
      cowRate: string;
      phoneNumber: string;
      userCode: string;
      _id: string;
    }[]
  >([]);
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefDelete = useRef<BottomSheet>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState<boolean>(false);
  const [bottomSheetDeleteIndex, setBottomSheetDeleteIndex] =
    useState<boolean>(false);

  const [selectedFarmer, setSelectedFarmer] = useState<{
    name: string;
    phoneNumber: string;
    userCode: string;
    buffaloRate: number;
    cowRate: number;
    _id: string;
  }>({
    name: '',
    phoneNumber: '',
    _id: '',
    buffaloRate: 0,
    cowRate: 0,
    userCode: '',
  });
  

  const [isEditFarmer, setIsEditFarmer] = useState<boolean>(false);

  useEffect(() => {
    getFarmers();
  }, []);
  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }
  const getFarmers = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/getAllFarmers/${firm.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { users } = await res.json();
        const data =  users.map((u:any)=>{
          return {
            ...u,
            cowRate:String(u.cowRate),
            buffaloRate: String(u.buffaloRate)
          }
        });
        setAllFarmer(data);
        setAllShowFarmer(data);
        setIsLoading(false);
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const CreateFarmer = async () => {
    if (
      (!Farmer.name ||
        !Farmer.phoneNumber ||
        !Farmer.password ||
        !Farmer.userCode ||
        !Farmer.cowRate ||
        !Farmer.buffaloRate) &&
      !isEditFarmer
    ) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: `All Fields Required`,
      });
      return;
    }
    setBottomSheetIndex(false);

    const payload = {
      ...Farmer,
      buffaloRate: Number(Farmer.buffaloRate),
      cowRate: Number(Farmer.cowRate),
      userType: 'farmer',
      firmId: firm.id,
    };

    await fetch(`${BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res: any) => {
        const user = await res.json();
        console.log('user : ', user);
        const newUser = {
          name: user.name,
          buffaloRate: user.buffaloRate,
          cowRate: user.cowRate,
          phoneNumber: user.phoneNumber,
          userCode: user.userCode,
          _id: user._id,
        };
        if (isEditFarmer) {
          getFarmers();
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: `${Farmer.name} Farmer updated!!`,
          });
        } else {
          setAllFarmer(prev => [...prev, newUser]);
          setAllShowFarmer(prev => [...prev, newUser]);
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: `${Farmer.name} Farmer created!!`,
          });
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    setBottomSheetIndex(false);
    bottomSheetRef.current?.close();
  };

  const DeleteFarmers = async () => {
    await fetch(`${BASE_URL}/user/delete/${selectedFarmer._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        await res.json();
        setAllFarmer(prev => prev.filter(c => c._id !== selectedFarmer._id));
      })
      .catch((e: any) => {
        console.log(e);
      });

    setBottomSheetDeleteIndex(false);
    bottomSheetRefDelete.current?.close();
  };

  // useEffect(()=>{
  //       if (!query) {
  //     setAllShowFarmer(allFarmer);
  //   }
  // },[query])

  const filterFarmer = () => {
    if (!query) {
      setAllShowFarmer(allFarmer);
    } else {
      const filteredData = allShowFarmer.filter((cust: any) =>
        String(cust.name)
          .toLocaleLowerCase()
          .includes(String(query).toLocaleLowerCase()) ||     String(cust.userCode)
          .toLocaleLowerCase()
          .includes(String(query).toLocaleLowerCase()) ,
      );
      setAllShowFarmer(filteredData);
    }
  };

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
            // numberOfLines={4}
            maxLength={40}
            onChangeText={text => setQuery(text)}
            value={query}
            style={styles.textInput}
            placeholder="Search farmers..."
          />
        </View>
        <FaIcon
          name="search"
          size={30}
          // color={earnings < 0 ? '#713333ff' : '#3b613cff'}
          onPress={filterFarmer}
        />
      </View>
      <View style={styles.stocksContainer}>
        {allShowFarmer.length > 0 ? (
          allShowFarmer.map((Farmer: any) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FarmerPage', {
                  id: Farmer._id,
                  userType: 'farmer',
                })
              }
              key={Farmer._id}
              style={styles.cardContainer}
            >
              <View style={styles.cardOne}>
                <Text
                  style={{ fontSize: 17, fontWeight: 700, color: '#5086E7' }}
                >
                  {Farmer.name}
                </Text>
              </View>
              <View style={styles.cardTwo}>
                <Icon
                  name="edit"
                  size={26}
                  color="#333"
                  onPress={() => {
                    setIsEditFarmer(true);
                    setBottomSheetIndex(true);
    
                    setSelectedFarmer(Farmer);
                    setFarmer(Farmer);
                  }}
                />
                <Icon
                  name="trash-2"
                  size={24}
                  color="#FF0000"
                  onPress={() => {
                    setBottomSheetDeleteIndex(true), setSelectedFarmer(Farmer);
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
              No Farmers created yet
            </Text>
          </View>
        )}
        {/* <SafeAreaView> */}
        {/* <FlatList
            data={stocks}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>

              </View>
            )}
            keyExtractor={item => item._id}
          /> */}
        {/* </SafeAreaView> */}
      </View>

      <View style={styles.ButtonBox}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsEditFarmer(false),
              setFarmer({
                name: '',
                phoneNumber: '',
                password: '',
                buffaloRate: '',
                cowRate: '',
                userCode: '',
                _id: '',
              });
            setSelectedFarmer({
              name: '',
              phoneNumber: '',
              userCode: '',
              _id: '',
              buffaloRate: 0,
              cowRate: 0,
            });
            setBottomSheetIndex(true);
          }}
        >
          <Text style={styles.text}>Create Farmer</Text>
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
            <View style={styles.stockContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setFarmer(prev => ({ ...prev, name: text }))
                  }
                  value={Farmer.name}
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
                    setFarmer(prev => ({ ...prev, phoneNumber: text }))
                  }
                  value={Farmer.phoneNumber}
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
                  onChangeText={text =>
                    setFarmer(prev => ({ ...prev, cowRate: text }))
                  }
                  value={Farmer.cowRate}
                  style={styles.textInput}
                  placeholder="Cow Rate"
                />
              </View>
              <View style={[styles.inputBox]}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  onChangeText={text =>
                    setFarmer(prev => ({ ...prev, buffaloRate: text }))
                  }
                  value={Farmer.buffaloRate}
                  style={styles.textInput}
                  placeholder="Buffalo Rate"
                />
              </View>
            </View>
            <View style={styles.stockContainer}>
              <View style={[styles.inputBox,{width:isEditFarmer?"100%":"50%"}]}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setFarmer(prev => ({ ...prev, userCode: text }))
                  }
                  value={String(Farmer.userCode)}
                  style={styles.textInput}
                  placeholder="Code"
                />
              </View>
              {!isEditFarmer && (
                <View style={styles.inputBox}>
                  <TextInput
                    editable
                    multiline
                    numberOfLines={4}
                    maxLength={40}
                    onChangeText={text =>
                      setFarmer(prev => ({ ...prev, password: text }))
                    }
                    value={Farmer.password}
                    style={styles.textInput}
                    placeholder="Enter Password"
                  />
                </View>
              )}
            </View>

            <View style={styles.stockContainer}>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={CreateFarmer}
              >
                <Text style={styles.text}>
                  {isEditFarmer ? 'Edit' : 'Create'}
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
            <View>
              <Text
                style={{
                  fontSize: 18,
                  color: '#8e8e98ff',
                  textAlign: 'center',
                }}
              >
                Are you sure?. you want to delete this Farmer
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
                  onPress={DeleteFarmers}
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

export default Farmers;

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
});
