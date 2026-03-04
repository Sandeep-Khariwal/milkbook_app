import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Customers from '../screens/admin/Customers';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerHome from '../screens/customers/CustomerHome';
import { useDispatch, useSelector } from 'react-redux';
import { deleteToken } from '../../token/tokenStorage';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import IconLogout from 'react-native-vector-icons/AntDesign';
import ShowHistory from '../screens/commonScreen/ShowHistory';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import AllFarmers from '../screens/farmers/AllFarmers';
import FarmerHome from '../screens/farmers/FarmerHome';
import ShowAllHistory from '../screens/commonScreen/AllHistory';

const Stack = createStackNavigator();

export default function DistributerNavigator() {
  return (
    <Stack.Navigator
       id="distributer-stack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminHome" component={DistributerHome} />
      <Stack.Screen name="CustomerPage" component={CustomerHome} />
      <Stack.Screen name="FarmerPage" component={FarmerHome} />
      <Stack.Screen name="History" component={ShowHistory} />
            <Stack.Screen
        name="AllHistory"
        component={ShowAllHistory}
      />
    </Stack.Navigator>
  );
}

const AllCustomers = () => {
  const distributer = useSelector((state: any) => state.distributer.value);
  const firm = useSelector((state: any) => state.firm.value);
  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();

  const Logout = async () => {
    await deleteToken();
    const firmData = {
      name: '',
      id: '',
      role: '',
    };
    dispatch(setFirmDetails(firmData));
  };

  return (
    <View style={{ flex: 1 }}>
      <Customers />
    </View>
  );
};

const routes = [
  { key: 'first', title: 'Customers' },
  { key: 'second', title: 'Farmers' },
];

const DistributerHome = () => {
  const distributer = useSelector((state: any) => state.distributer.value);
  const [index, setIndex] = useState<number>(0);

  const firm = useSelector((state: any) => state.firm.value);
  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();

  const Logout = async () => {
    await deleteToken();
    const firmData = {
      name: '',
      id: '',
      role: '',
    };
    dispatch(setFirmDetails(firmData));
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.heroContainer}>
        <Text style={{ ...styles.milkFarmText, marginTop: 30 }}>
          {String(firm?.name).toUpperCase()}
        </Text>
        <Text style={{ fontSize: 18, color: '#fff' }}>
          {String(distributer?.name).toUpperCase()}
        </Text>
        <View style={{ height: 49, width: '100%', paddingLeft: 10 }}>
          <IconLogout
            name="logout"
            size={30}
            color="#f4f0f0ff"
            onPress={() => {
              setShowLogout(true);
            }}
          />
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={SceneMap({
          first: AllCustomers,
          second: AllFarmers,
        })}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: '#5086E7', // active underline color
              height: 3,
              borderRadius: 10,
            }}
            style={{
              backgroundColor: '#fff',
              elevation: 0, // remove android shadow
            }}
            activeColor="#5086E7"
            inactiveColor="#999"
          />
        )}
      />
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
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: '15%',
    width: '100%',
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    display: 'flex',
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#5086E7',
    paddingTop: 20,
  },
  milkFarmText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 500,
    fontFamily: 'sans-serif',
  },
  inputBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
  },
  textInput: {
    padding: 10,
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
});
