import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
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
import { useDispatch, useSelector } from 'react-redux';
import Home from '../screens/admin/Home';
import Stocks from '../screens/admin/Stocks';
import Distributers from '../screens/admin/Distributers';
import Customers from '../screens/admin/Customers';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerHome from '../screens/customers/CustomerHome';
import LogoutButton from '../components/LogoutButton';
import Farmers from '../screens/admin/Farmer';
import FarmerHome from '../screens/farmers/FarmerHome';
import ShowHistory from '../screens/commonScreen/ShowHistory';
import ShowAllHistory from '../screens/commonScreen/AllHistory';
import DeletedUsers from '../screens/admin/DeletedUsers';
import AntDIcon from 'react-native-vector-icons/AntDesign';
import FeIcon from 'react-native-vector-icons/Feather';
import { BASE_URL } from '../../token/tokenStorage';
import LoadingOverlay from '../HelperFunction/LoadingOverlay';
import { setFirmDetails } from '../../redux/slices/firmSlice';

const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const firm = useSelector((state: any) => state.firm.value);
  const admin = useSelector((state: any) => state.admin.value);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [firmDetails, setFirmDetail] = useState<{
    name: string;
    password: string;
  }>({
    name: '',
    password: '',
  });
  useEffect(() => {
    setFirmDetail(prev => ({ ...prev, name: firm.name }));
  }, [firm]);

  // if (isLoading) return <LoadingOverlay visible />;

  const EditFirm = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/updateAdmin/${admin.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: firmDetails.name,
        password: firmDetails.password,
      }),
    })
      .then(async (res: any) => {
        setIsLoading(false);
        setOpenModal(false);
        setFirmDetail({
          name: '',
          password: '',
        });
        dispatch(
          setFirmDetails({
            id: firm.id,
            name: firmDetails.name,
            role: firm.role,
          }),
        );
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <>
      {isLoading && <LoadingOverlay visible />}
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
        <View
          style={{
            paddingTop: 10,
            paddingBottom: 20,
            height: 80,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: 24,
              color: '#5086E7',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {firm.name}
          </Text>
          <AntDIcon
            name="setting"
            size={26}
            onPress={() => setOpenModal(true)}
          />
        </View>
        <Modal
          visible={openModal}
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
                }}
              >
                <Text style={{ color: '#333', fontSize: 24 }}>Edit Firm</Text>
                <FeIcon
                  name="x"
                  size={26}
                  color="#333"
                  onPress={() => {
                    setOpenModal(false);
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
                  marginTop: 20,
                }}
              >
                <View style={styles.inputBox}>
                  <TextInput
                    editable
                    multiline
                    numberOfLines={4}
                    maxLength={40}
                    onChangeText={text =>
                      setFirmDetail(prev => ({ ...prev, name: text }))
                    }
                    value={firmDetails.name}
                    style={styles.textInput}
                    placeholder="Firm Name"
                  />
                </View>
                <View style={styles.inputBox}>
                  <TextInput
                    editable
                    multiline
                    numberOfLines={4}
                    maxLength={40}
                    onChangeText={text =>
                      setFirmDetail(prev => ({ ...prev, password: text }))
                    }
                    value={firmDetails.password}
                    style={styles.textInput}
                    placeholder="New Password"
                  />
                </View>
              </View>
              <View style={[styles.stockContainer, { height: 50 }]}>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: '#5086E7', width: '95%', marginTop: 10 },
                  ]}
                >
                  <TouchableOpacity onPress={EditFirm}>
                    <Text
                      style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}
                    >
                      Edit Firm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <DrawerItemList {...props} />
        <View style={{ width: '100%', flex: 1, marginTop: 20 }}>
          <LogoutButton showText={true} />
        </View>
      </DrawerContentScrollView>
    </>
  );
}

const AdminDrawer = () => {
  return (
    <Drawer.Navigator
      id="admin-drawer"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,

        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() => navigation.openDrawer()}
          >
            <Icon name="menu" size={32} color="#5086E7" />
          </TouchableOpacity>
        ),
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#5086E7',
        },
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
      })}
    >
      <Drawer.Screen
        name="HomePage"
        component={Home}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen
        name="Stocks"
        component={Stocks}
        options={{ title: 'Stocks' }}
      />
      <Drawer.Screen
        name="Distributers"
        component={Distributers}
        options={{ title: 'Distributers' }}
      />
      <Drawer.Screen
        name="Farmers"
        component={Farmers}
        options={{ title: 'Farmers' }}
      />
      <Drawer.Screen
        name="Customers"
        component={Customers}
        options={{ title: 'Customers' }}
      />
      <Drawer.Screen
        name="Deletedusers"
        component={DeletedUsers}
        options={{ title: 'Deleted Users' }}
      />
    </Drawer.Navigator>
  );
};

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      id="admin-stack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminDrawer} />
      <Stack.Screen name="FarmerPage" component={FarmerHome} />
      <Stack.Screen name="CustomerPage" component={CustomerHome} />
      <Stack.Screen name="History" component={ShowHistory} />
      <Stack.Screen name="AllHistory" component={ShowAllHistory} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
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
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  inputBox: {
    width: '48%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 40,
  },
});
