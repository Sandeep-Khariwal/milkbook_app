import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import AntDIcon from 'react-native-vector-icons/AntDesign';
import FeIcon from 'react-native-vector-icons/Feather';
import { BASE_URL } from '../../token/tokenStorage';
import LoadingOverlay from '../HelperFunction/LoadingOverlay';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import LogoutButton from '../components/LogoutButton';

// Screens
import Home from '../screens/admin/Home';
import Stocks from '../screens/admin/Stocks';
import Distributers from '../screens/admin/Distributers';
import Customers from '../screens/admin/Customers';
import Farmers from '../screens/admin/Farmer';
import DeletedUsers from '../screens/admin/DeletedUsers';
import SubscriptionPlan from '../screens/admin/SubscriptionPlan';
import DairyBusinessList from '../screens/admin/DiaryBussinessList';
import FarmerHome from '../screens/farmers/FarmerHome';
import CustomerHome from '../screens/customers/CustomerHome';
import ShowHistory from '../screens/commonScreen/ShowHistory';
import ShowAllHistory from '../screens/commonScreen/AllHistory';
import { createStackNavigator } from '@react-navigation/stack';
import ShowSavedBalance from '../screens/commonScreen/ShowSavedBalance';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const firm = useSelector((state: any) => state.firm.value);
  const admin = useSelector((state: any) => state.admin.value);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [firmDetails, setFirmDetail] = useState({ name: '', password: '' });

  const activeRoute = props.state.routeNames[props.state.index];

  useEffect(() => {
    setFirmDetail((prev) => ({ ...prev, name: firm.name }));
  }, [firm]);

  const EditFirm = async () => {
    setIsLoading(true);
    try {
      await fetch(`${BASE_URL}/user/updateAdmin/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: firmDetails.name, password: firmDetails.password }),
      });
      dispatch(setFirmDetails({ id: firm.id, name: firmDetails.name, role: firm.role }));
      setOpenModal(false);
    } catch (e) { console.log(e); }
    finally { setIsLoading(false); }
  };

  const NavItem = ({ label, icon, route, iconType = 'Ionicons' }: any) => {
    const isActive = activeRoute === route;
    return (
      <TouchableOpacity
        style={[styles.navItem, isActive && styles.activeNavItem]}
        onPress={() => props.navigation.navigate(route)}
      >
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
          {iconType === 'Ionicons' ? 
            <Icon name={icon} size={20} color={isActive ? '#fff' : '#64748b'} /> :
            <AntDIcon name={icon} size={20} color={isActive ? '#fff' : '#64748b'} />
          }
        </View>
        <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      {isLoading && <LoadingOverlay visible />}
      
      {/* Header Profile Section - Improved Spacing */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firm.name?.charAt(0) || 'D'}</Text>
          </View>
          <View style={styles.firmInfo}>
            <Text style={styles.firmName} numberOfLines={1}>{firm.name}</Text>
            <Text style={styles.adminRole}>Administrator</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setOpenModal(true)}>
          <AntDIcon name="setting" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>OPERATIONS</Text>
          <NavItem label="Dashboard" icon="home-outline" route="HomePage" />
          <NavItem label="Inventory / Stocks" icon="cube-outline" route="Stocks" />
          <NavItem label="Distributers" icon="bus-outline" route="Distributers" />
          <NavItem label="Farmers" icon="leaf-outline" route="Farmers" />
          <NavItem label="Customers" icon="people-outline" route="Customers" />
        </View>

        <View style={styles.divider} />

        <View style={styles.drawerSection}>
          <Text style={styles.sectionTitle}>ACCOUNT & SYSTEM</Text>
          <NavItem label="Subscription Plans" icon="card-outline" route="Plans" />
          <NavItem label="Archived Users" icon="trash-outline" route="Deletedusers" />
          {(firm.id === 'FIRM-4cb29350-6863-4ad7-bb17-d1f885ba34c7' || firm.id === "FIRM-8bab3f1a-c031-42df-b836-91ed29e6d743") && (
             <NavItem label="Dairy Network" icon="globe-outline" route="business" />
          )}
        </View>
      </DrawerContentScrollView>

      {/* Footer Logout - Moved Higher */}
      <View style={styles.drawerFooter}>
        <LogoutButton showText={true} />
        <Text style={styles.versionText}>v1.2.0 Professional</Text>
      </View>

      {/* ... Modal remains same ... */}
      <Modal visible={openModal} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Firm Settings</Text>
              <TouchableOpacity onPress={() => setOpenModal(false)}>
                <FeIcon name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Business Name</Text>
            <TextInput
              style={styles.modalInput}
              onChangeText={t => setFirmDetail(p => ({ ...p, name: t }))}
              value={firmDetails.name}
              placeholder="Enter firm name"
            />

            <Text style={styles.inputLabel}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              onChangeText={t => setFirmDetail(p => ({ ...p, password: t }))}
              value={firmDetails.password}
              placeholder="Leave blank to keep current"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={EditFirm}>
              <Text style={styles.saveBtnText}>Update Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const AdminDrawer = () => {
  const firm = useSelector((state: any) => state.firm.value);
  const initialScreen = firm.subscriptionExp ? 'Plans' : 'HomePage';

  return (
    <Drawer.Navigator
      id="admin-drawer" 
      initialRouteName={initialScreen}
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: '#5086E7', fontWeight: 'bold', fontSize: 18 },
        headerTintColor: '#5086E7',
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="HomePage" component={Home} options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Stocks" component={Stocks} options={{ title: 'Stock Management' }} />
      <Drawer.Screen name="Distributers" component={Distributers} options={{ title: 'Distributers' }} />
      <Drawer.Screen name="Farmers" component={Farmers} options={{ title: 'Farmers List' }} />
      <Drawer.Screen name="Customers" component={Customers} options={{ title: 'Customers List' }} />
      <Drawer.Screen name="Deletedusers" component={DeletedUsers} options={{ title: 'Archived Records' }} />
      <Drawer.Screen name="Plans" component={SubscriptionPlan} options={{ title: 'Subscription' }} />
      <Drawer.Screen name="business" component={DairyBusinessList} options={{ title: 'Network' }} />
    </Drawer.Navigator>
  );
};

export default function AdminNavigator() {
  return (
    <Stack.Navigator id="admin-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDrawer} />
      <Stack.Screen name="FarmerPage" component={FarmerHome} />
      <Stack.Screen name="CustomerPage" component={CustomerHome} />
      <Stack.Screen name="History" component={ShowHistory} />
      <Stack.Screen name="AllHistory" component={ShowAllHistory} />
      <Stack.Screen name="SavedBalance" component={ShowSavedBalance} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: '#5086E7',
    padding: 20,
    // Adjusted padding and margin for safe areas
    paddingTop: Platform.OS === 'ios' ? 20 : 40, 
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomRightRadius: 30,
  },
  avatarSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  firmInfo: { marginLeft: 12 },
  firmName: { color: '#fff', fontSize: 18, fontWeight: 'bold', width: 140 },
  adminRole: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  settingsBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  drawerSection: { paddingHorizontal: 15, marginTop: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 5,
  },
  activeNavItem: { backgroundColor: '#f1f5f9' },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: { backgroundColor: '#5086E7' },
  navLabel: { fontSize: 15, color: '#475569', marginLeft: 12, fontWeight: '600' },
  activeNavLabel: { color: '#1e293b', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10, marginHorizontal: 25 },
  
  drawerFooter: { 
    padding: 20, 
    // Increased padding bottom to move button up away from phone buttons
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9' 
  },
  versionText: { textAlign: 'center', fontSize: 10, color: '#cbd5e1', marginTop: 10 },
  
  centeredView: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  inputLabel: { fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: '600', marginLeft: 4 },
  modalInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  saveBtn: { backgroundColor: '#5086E7', padding: 15, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});