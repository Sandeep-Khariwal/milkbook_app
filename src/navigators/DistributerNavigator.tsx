import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Feather'; // Using Feather for a cleaner look

// Components
import Customers from '../screens/admin/Customers';
import CustomerHome from '../screens/customers/CustomerHome';
import { deleteToken } from '../../token/tokenStorage';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import ShowHistory from '../screens/commonScreen/ShowHistory';
import AllFarmers from '../screens/farmers/AllFarmers';
import FarmerHome from '../screens/farmers/FarmerHome';
import ShowAllHistory from '../screens/commonScreen/AllHistory';

const Stack = createStackNavigator();

export default function DistributerNavigator() {
  return (
    <Stack.Navigator
      id="distributer-stack"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AdminHome" component={DistributerHome} />
      <Stack.Screen name="CustomerPage" component={CustomerHome} />
      <Stack.Screen name="FarmerPage" component={FarmerHome} />
      <Stack.Screen name="History" component={ShowHistory} />
      <Stack.Screen name="AllHistory" component={ShowAllHistory} />
    </Stack.Navigator>
  );
}

const AllCustomers = () => (
  <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
    <Customers />
  </View>
);

const routes = [
  { key: 'first', title: 'Customers' },
  { key: 'second', title: 'Farmers' },
];

const DistributerHome = () => {
  const [index, setIndex] = useState<number>(0);
  const [showLogout, setShowLogout] = useState<boolean>(false);
  
  const distributer = useSelector((state: any) => state.distributer.value);
  const firm = useSelector((state: any) => state.firm.value);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await deleteToken();
    dispatch(setFirmDetails({ name: '', id: '', role: '' }));
    setShowLogout(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#5086E7" barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.firmName}>{firm?.name?.toUpperCase() || 'MY FARM'}</Text>
            <Text style={styles.distributerName}>
              Welcome, {distributer?.name || 'Distributer'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutIconBtn}
            onPress={() => setShowLogout(true)}
          >
            <Icon name="log-out" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Section */}
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
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            activeColor="#5086E7"
            inactiveColor="#94A3B8"
            // labelStyle={styles.tabLabel}
          />
        )}
      />

      {/* Modern Logout Modal */}
      <Modal animationType="fade" transparent visible={showLogout}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.logoutIconCircle}>
                <Icon name="alert-circle" size={30} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubTitle}>
              Are you sure you want to exit? You will need to login again.
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowLogout(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={handleLogout}
              >
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#5086E7',
    paddingBottom: 25,
    paddingTop: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
  },
  firmName: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  distributerName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  logoutIconBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    marginTop: 5, // Creates an overlap effect
    marginHorizontal: 20,
    borderRadius: 15,
    height: 50,
    // Add shadow to the tab bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabIndicator: {
    backgroundColor: '#5086E7',
    height: 3,
    borderRadius: 10,
    width: '30%',
    marginLeft: '10%',
  },
  tabLabel: {
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});