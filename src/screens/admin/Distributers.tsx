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
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const Distributers = () => {
  const firm = useSelector((state: any) => state.firm.value);
    const isDistributer = firm.role === 'distributer';
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [distributer, setDistributer] = useState<{
    name: string;
    phoneNumber: string;
    password: string;
  }>({
    name: '',
    phoneNumber: '',
    password: '',
  });

  const [allDistributers, setAllDistributers] = useState<
    {
      name: string;
      phoneNumber: string;
      _id: string;
    }[]
  >([]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefDelete = useRef<BottomSheet>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState<boolean>(false);
  const [bottomSheetDeleteIndex, setBottomSheetDeleteIndex] =
    useState<boolean>(false);

  const [selectedDistributer, setSelectedDistributer] = useState<{
    name: string;
    phoneNumber: string;
    _id: string;
  }>({ name: '', phoneNumber: '', _id: '' });

  const [isEditDistributer, setIsEditDistributer] = useState<boolean>(false);

  // const handleSheetChanges = useCallback((index: number) => {
  //   if (index === -1) {
  //     setIsEditDistributer(false);
  //   }
  //   setBottomSheetIndex(index);
  // }, []);

  // const handleSheetChangesDelete = useCallback((index: number) => {
  //   setBottomSheetDeleteIndex(index);
  // }, []);

  useEffect(() => {
    getDistributers();
  }, []);
  const getDistributers = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/getAllDistributers/${firm.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { users } = await res.json();
        console.log("users in dist : ", users);
        
        const filterdUsers = users.filter(
          (d: any) => d.userType === 'distributer',
        );
        setAllDistributers(filterdUsers);
        setIsLoading(false);
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const CreateDistributer = async () => {
    if (distributer.phoneNumber.length < 10) {
      console.log('enter valid phone number');
      return;
    }
    if (
      !distributer.name ||
      !distributer.phoneNumber ||
      !distributer.password
    ) {
      return;
    }
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...distributer,
        userType: 'distributer',
        firmId: firm.id,
      }),
    })
      .then(async (res: any) => {
        getDistributers();

        const {user} = await res.json();
        console.log("user : ",user);
        

        const newUser = {
          name: user.name,
          phoneNumber: user.phoneNumber,
          _id: user._id,
        };
        if (isEditDistributer) {
          getDistributers();
        } else {
          setAllDistributers(prev => [...prev, newUser]);
        }
        setIsLoading(false);
        setDistributer({
          name: '',
          phoneNumber: '',
          password: '',
        });
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });

    setBottomSheetIndex(false);
    setIsEditDistributer(false);
    // bottomSheetRef.current?.close();
  };

  const DeleteDistributer = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/delete/${selectedDistributer._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        await res.json();
        setAllDistributers(prev =>
          prev.filter(c => c._id !== selectedDistributer._id),
        );
        setIsLoading(false);
        setSelectedDistributer({ name: '', phoneNumber: '', _id: '' });
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
  return (
    <View style={styles.container}>
      <View style={styles.stocksContainer}>
        {allDistributers.length > 0 ? (
          allDistributers.map((distributer: any) => (
            <View key={distributer._id} style={styles.cardContainer}>
              <View style={styles.cardOne}>
                <Text
                  style={{ fontSize: 18, fontWeight: 600, color: '#5086E7' }}
                >
                  {distributer.name}
                </Text>
              </View>

              <View style={styles.cardTwo}>
                <Icon
                  name="edit"
                  size={26}
                  color="#333"
                  onPress={() => {
                    setIsEditDistributer(true);
                    setBottomSheetIndex(true);
                    setDistributer(distributer);
                  }}
                />
                <Icon
                  name="trash-2"
                  size={24}
                  color="#FF0000"
                  onPress={() => {
                    setBottomSheetDeleteIndex(true),
                      setSelectedDistributer(distributer);
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
              No Distributers created yet
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ButtonBox}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setBottomSheetIndex(true)}
        >
          <Text style={styles.text}>Create Distributer</Text>
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
                  setIsEditDistributer(false);
                  setDistributer({
                    name: '',
                    phoneNumber: '',
                    password: '',
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
                  onChangeText={text =>
                    setDistributer(prev => ({ ...prev, name: text }))
                  }
                  value={distributer.name}
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
                    setDistributer(prev => ({ ...prev, phoneNumber: text }))
                  }
                  value={distributer.phoneNumber}
                  style={styles.textInput}
                  placeholder="Phone"
                />
              </View>
            </View>

            <View style={styles.stockContainer}>
              <View style={styles.inputBoxPass}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setDistributer(prev => ({ ...prev, password: text }))
                  }
                  value={distributer.password}
                  style={styles.textInput}
                  placeholder="Enter Password"
                />
              </View>
            </View>
            <View style={styles.stockContainer}>
              <TouchableOpacity
                style={[styles.button, { marginTop: 20 }]}
                onPress={CreateDistributer}
              >
                <Text style={styles.text}>
                  {isEditDistributer ? 'Edit' : 'Create'}
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
                Are you sure? You want to delete this Distributer
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
                  onPress={DeleteDistributer}
                >
                  <Text style={{ color: '#fff' }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Distributers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stocksContainer: {
    height: '95%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
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
    // flex: 1,
    height: 300,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 20,
  },
  ButtonBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 30,
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
    marginTop: 10,
  },
  inputBoxPass: {
    width: '100%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    marginTop: 10,
    textAlign: 'center',
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
