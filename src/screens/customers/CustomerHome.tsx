import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FeIcon from 'react-native-vector-icons/Feather';
import IconLogout from 'react-native-vector-icons/AntDesign';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import AddEntryAndSale from '../../components/customer/AddEntryAndSale';
import { BASE_URL, deleteToken } from '../../../token/tokenStorage';
import EntriesTable from './EntriesTable';
import { setFirmDetails } from '../../../redux/slices/firmSlice';
import {
  ALERT_TYPE,
  Toast,
} from 'react-native-alert-notification';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const CustomerHome = ({ route }: { route: any }) => {
  const id = route.params.id;
  const firm = useSelector((state: any) => state.firm.value);
  const userType = route.params.userType;
  const isCustomer = firm.role === 'customer';
  const isFarmer = firm.role === 'farmer';
  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();

  const [earnings, setEarnings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddPaymentModal, setShowAddPaymentModal] =
    useState<boolean>(false);
  const navigation = useNavigation<any>();
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [customer, setCustomer] = useState<{
    name: string;
    userCode: string;
    cowRate: number;
    buffaloRate: number;
    phoneNumber: string;
    _id: string;
  }>({ name: '', phoneNumber: '', _id: '', userCode:'', cowRate: 0, buffaloRate: 0 });
  const [cashPayment, setCashPayment] = useState<string>('');
  const [cashPaymentDescription, setCashPaymentDescription] =
    useState<string>('');

  useEffect(() => {
    getUser();
  }, []);
  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }
  const getUser = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/getUser/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { user } = await res.json();
        setEarnings(user.earnings);

        const newUser = {
          _id: user._id,
          name: user.name,
          userCode: user.userCode,
          buffaloRate: user.buffaloRate,
          cowRate: user.cowRate,
          phoneNumber: user.phoneNumber,
        };
        setCustomer(newUser);
        setIsLoading(false);
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const Logout = async () => {
    await deleteToken();
    const firmData = {
      name: '',
      id: '',
      role: '',
    };
    dispatch(setFirmDetails(firmData));
  };

  const SeeHistory = () => {
    navigation.navigate('History', {
      customerId: customer._id,
      userType: 'customer',
    });
  };

  const AddPayment = async () => {
    if (!cashPayment) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Warning',
        textBody: `Payment Required!!`,
      });
      return;
    }

    const payload = {
      firmId: firm.id,
      amount: -Number(cashPayment),
      user: customer._id,
      userType: 'customer',
      description: cashPaymentDescription,
    };

    setIsLoading(true);
    await fetch(`${BASE_URL}/user/setPayment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (x: any) => {

        setShowAddPaymentModal(false);
        setCashPayment('');
        setCashPaymentDescription('');
        setIsLoading(false);
        getUser()
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  return (
    <View style={styles.container}>
      <View style={{ ...styles.heroContainer }}>
        {/* marginTop: 50 */}
        {!isCustomer && (
          <TouchableOpacity
            style={{ ...styles.backBox, marginTop: 20 }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Icon name="chevron-back" size={32} color="#FFF" />
            <Text style={[styles.milkFarmText, { fontSize: 20 }]}>Back</Text>
          </TouchableOpacity>
        )}

        <Text
          style={{ ...styles.milkFarmText, marginTop: isCustomer ? 30 : 15 }}
        >
          {String(firm?.name).toUpperCase()}
        </Text>
        {isCustomer && (
          <Text style={{ color: '#fff', fontSize: 16, marginTop: 5 }}>
           {customer.name}({customer.userCode}), {customer.phoneNumber}
          </Text>
        )}
      </View>

      <View style={styles.historyCont}>
        <View style={{ width: '50%' }}>
          <TouchableOpacity style={styles.deletebuttonYes} onPress={SeeHistory}>
            <Text style={{ color: '#fff' }}>See History</Text>
          </TouchableOpacity>
        </View>

        {!isCustomer && (
          <View style={{ width: '50%' }}>
            <TouchableOpacity
              style={styles.deletebuttonYes}
              onPress={() => setShowAddPaymentModal(true)}
            >
              <Text style={{ color: '#fff' }}>Add Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCustomer && (
          <View
            style={{
              height: 45,
              width: '50%',
              paddingLeft: 10,
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <IconLogout
              name="logout"
              size={32}
              color="#5086E7"
              onPress={() => {
                setShowLogout(true);
              }}
            />
          </View>
        )}
      </View>

      <View
        style={{
          ...styles.eraningBox,
          backgroundColor: earnings < 0 ? '#dccfcfff' : '#e1e6e2ff',
          borderColor: earnings < 0 ? '#dccfcfff' : '#e1e6e2ff'
        }}
      >
        <View style={{width:"100%",paddingLeft:4, paddingRight:4, display:"flex", flexDirection:"row", alignItems:"center"}} >
          <Text style={{fontSize:16, color:"#3b613cff"  }} >{customer.name} ({customer.userCode}) </Text>
        </View>
        <Text
          style={{
            ...styles.milkFarmText,
            color: earnings < 0 ? '#713333ff' : '#3b613cff',
          }}
        >
          Total Amount
        </Text>
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 10,
            gap: 5,
          }}
        >
          <FaIcon
            name="rupee"
            size={30}
            color={earnings < 0 ? '#713333ff' : '#3b613cff'}
            onPress={() => {
              navigation.goBack();
            }}
          />
          <Text
            style={{
              ...styles.milkFarmText,
              color: earnings < 0 ? '#713333ff' : '#3b613cff',
              marginTop: 4,
              fontSize:26
            }}
          >
            {earnings?.toFixed(2) ?? 0}
          </Text>
        </View>
        {/* {isCustomer && ( */}
          <View
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 10,
              gap: 5,
            }}
          >
            <Text
              style={{
                ...styles.milkFarmText,
                color: earnings < 0 ? '#713333ff' : '#3b613cff',
                marginTop: 4,
              }}
            >
              {totalWeight?.toFixed(1) ?? 0}Kg (Milk)
            </Text>
          </View>
        {/* )} */}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogout}
        onRequestClose={() => {
        }}
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
            <Text
              style={{
                fontSize: 18,
                color: '#727276ff',
                textAlign: 'center',
              }}
            >
              Are you sure?. you want to logout
            </Text>

            <View style={styles.formBox}>
              <TouchableOpacity
                style={styles.deletebutton}
                onPress={() => setShowLogout(false)}
              >
                <Text style={{ color: '#5086E7' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deletebuttonYes} onPress={Logout}>
                <Text style={{ color: '#fff' }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {!isCustomer && !isFarmer && (
        <AddEntryAndSale
          customer={customer}
          userType={userType}
          dataUpdate={() => {
            getUser();
          }}
        />
      )}
      <EntriesTable
        userId={customer._id}
        isCustomer={isCustomer}
        customer={customer}
        userType={userType}
        findTotalWeight={wt => {
          setTotalWeight(wt);
        }}
        dataUpdate={() => {
          getUser();
        }}
        setTotalEarn={(wt, amnt) => {
          setTotalWeight(wt);
          setEarnings(amnt);
        }}
      />

      <Modal
        visible={showAddPaymentModal}
        animationType="fade"
        transparent={true}
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
            <View style={{ width: '100%', alignSelf: 'flex-end' }}>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setShowAddPaymentModal(false);
                }}
              />
            </View>
            <View style={styles.stockContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={10}
                  onChangeText={text => setCashPayment(text)}
                  value={cashPayment}
                  style={styles.textInput}
                  placeholder="Set Payment"
                />
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  onChangeText={text => setCashPaymentDescription(text)}
                  value={cashPaymentDescription}
                  style={styles.textInput}
                  placeholder="Description"
                />
              </View>
            </View>

            <View style={styles.stockContainer}>
              <TouchableOpacity
                style={[styles.deletebuttonYes, { width: '100%' }]}
                onPress={AddPayment}
              >
                <Text style={{ color: '#fff' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#5086E7',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backBox: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  milkFarmText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 500,
    fontFamily: 'sans-serif',
  },
  eraningBox: {
    width: '90%',
    // height: 200,
    borderWidth: 1,
    paddingTop:20,
    paddingBottom:20,

    borderRadius: 20,
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    width: '100%',
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
    width: '60%',
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#5086E7',
  },
  stockContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  historyCont: {
    width: '100%',
    height: 70,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBox: {
    width: '50%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
    marginTop: 20,
  },
  textInput: {
    padding: 10,
  },
});

export default CustomerHome;
