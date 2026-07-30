import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  ScrollView,
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
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import DatePicker from 'react-native-date-picker';

const CustomerHome = ({ route }: { route: any }) => {
  const id = route.params.id;
  const firm = useSelector((state: any) => state.firm.value);
  const userType = route.params.userType;
  const isCustomer = firm.role === 'customer';
  const isFarmer = firm.role === 'farmer';
  const isAdmin = firm.role === 'admin';

  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();

  const [earnings, setEarnings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddPaymentModal, setShowAddPaymentModal] =
    useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const navigation = useNavigation<any>();
  const scrollRef = useRef<any>(null);

  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [totalBufallowWeight, setBuffalowTotalWeight] = useState<number>(0);
  const [totalCowWeight, setCowTotalWeight] = useState<number>(0);

  const [totalBuffaloAmount, setBuffaloTotalAmount] = useState<number>(0);
  const [totalCowAmount, setCowTotalAmount] = useState<number>(0);

  const [customer, setCustomer] = useState<{
    _id: string;
    name: string;
    userCode: string;
    cowRate: number;
    buffaloRate: number;
    phoneNumber: string;
    cowMilk?: any;
    buffaloMilk?: any;
  }>({
    name: '',
    phoneNumber: '',
    _id: '',
    userCode: '',
    cowRate: 0,
    buffaloRate: 0,
  });

  const [cashPayment, setCashPayment] = useState<string>('');
  const [cashPaymentDescription, setCashPaymentDescription] =
    useState<string>('');

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/getUser/${id}`);
      const { user } = await response.json();
      setEarnings(user.earnings);
      setCustomer({
        _id: user._id,
        name: user.name,
        userCode: user.userCode,
        buffaloRate: user.buffaloRate,
        cowRate: user.cowRate,
        phoneNumber: user.phoneNumber,
        cowMilk: user?.cowMilk,
        buffaloMilk: user?.buffaloMilk,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const Logout = async () => {
    await deleteToken();
    dispatch(setFirmDetails({ name: '', id: '', role: '' }));
  };

  const SeeHistory = () => {
    navigation.navigate('History', {
      customerId: customer._id,
      userType: 'customer',
    });
  };

  const handleSaveCurrentBalance = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/createBooking/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cowWeight: totalCowWeight,
        buffalowWeight: totalBufallowWeight,
        cowAmount: totalCowAmount,
        buffaloAmount: totalBuffaloAmount,
        totalAmount: earnings,
      }),
    })
      .then((res: any) => {
        setIsLoading(false);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Balance Saved',
          textBody: `Current balance of ₹${earnings.toFixed(
            2,
          )} recorded successfully!`,
        });
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const AddPayment = async () => {
    if (!cashPayment) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Warning',
        textBody: 'Payment Required!!',
      });
      return;
    }
    const payload = {
      firmId: firm.id,
      amount: -Number(cashPayment),
      user: customer._id,
      userType: 'customer',
      description: cashPaymentDescription,
      date: new Date(date),
    };
    setIsLoading(true);
    try {
      await fetch(`${BASE_URL}/user/setPayment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowAddPaymentModal(false);
      setCashPayment('');
      setCashPaymentDescription('');
      getUser();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        onContentSizeChange={() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        <View style={styles.headerContainer}>
          <View style={styles.topNav}>
            {!isCustomer ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.iconCircle}
              >
                <Icon name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}

            <Text style={styles.firmName}>
              {String(firm?.name).toUpperCase()}
            </Text>

            {isCustomer ? (
              <TouchableOpacity
                onPress={() => setShowLogout(true)}
                style={styles.iconCircleRed}
              >
                <IconLogout name="logout" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          <View style={styles.customerMeta}>
            <Text style={styles.customerNameMain}>{customer.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>ID: {customer.userCode}</Text>
              </View>
              <Text style={styles.phoneText}>{customer.phoneNumber}</Text>
            </View>
          </View>
        </View>

<View style={styles.statsCard}>
  <Text style={styles.statsLabel}>CURRENT BALANCE</Text>
  <View style={styles.balanceRow}>
    <FaIcon
      name="rupee"
      size={28}
      color={earnings < 0 ? '#ef4444' : '#10b981'}
    />
    <Text
      style={[
        styles.balanceAmount,
        { color: earnings < 0 ? '#ef4444' : '#10b981' },
      ]}
    >
      {earnings?.toFixed(2) ?? 0}
    </Text>
  </View>
  
  <View style={styles.divider} />

  <View style={styles.weightStatsContainer}>
    <View style={styles.weightBox}>
      <Text style={styles.weightLabel}>Buffalo Milk</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Wt:</Text>
        <Text style={styles.weightValue}>{parseFloat(totalBufallowWeight?.toFixed(1))} <Text style={styles.unit}>Kg</Text></Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Amt:</Text>
        <Text style={styles.amountValue}>₹{totalBuffaloAmount.toFixed(2)}</Text>
      </View>
    </View>

    <View style={styles.verticalDivider} />

    <View style={styles.weightBox}>
      <Text style={styles.weightLabel}>Cow Milk</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Wt:</Text>
        <Text style={styles.weightValue}>{parseFloat(totalCowWeight?.toFixed(1))} <Text style={styles.unit}>Kg</Text></Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Amt:</Text>
        <Text style={styles.amountValue}>₹{totalCowAmount.toFixed(2)}</Text>
      </View>
    </View>
  </View>

  {/* INTEGRATED ACTION BUTTONS */}
  <View style={styles.integratedActionRow}>
    <TouchableOpacity
      style={styles.minBtn}
      onPress={() => navigation.navigate('SavedBalance', { userId: customer._id, userType: 'farmer' })}
    >
      <Icon name="wallet-outline" size={16} color="#475569" />
      <Text style={styles.minBtnText}>Saved</Text>
    </TouchableOpacity>

    {isAdmin && (
      <TouchableOpacity
        style={[styles.minBtn, styles.saveBtnActive]}
        onPress={handleSaveCurrentBalance}
      >
        <Icon name="checkmark-circle-outline" size={16} color="#FFF" />
        <Text style={styles.minBtnTextActive}>Save</Text>
      </TouchableOpacity>
    )}
  </View>
</View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={SeeHistory}>
            <FeIcon name="calendar" size={18} color="#1e293b" />
            <Text style={styles.secondaryBtnText}>History</Text>
          </TouchableOpacity>

          {!isCustomer && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowAddPaymentModal(true)}
            >
              <FeIcon name="plus-circle" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Collection</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* <View style={styles.secondaryActionRow}>
          <TouchableOpacity
            style={styles.minBtn}
            onPress={() =>
              navigation.navigate('SavedBalance', {
                userId: customer._id,
                userType: 'farmer',
              })
            }
          >
            <Icon name="wallet-outline" size={18} color="#1E293B" />
            <Text style={styles.minBtnText}>Saved Balance</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={[styles.minBtn, styles.saveBtnActive]}
              onPress={handleSaveCurrentBalance}
            >
              <Icon name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={styles.minBtnTextActive}>Save Balance</Text>
            </TouchableOpacity>
          )}
        </View> */}

        {/* VIEW SAVED BALANCES BUTTON (VISIBLE TO ALL ROLES) */}
        {/* <TouchableOpacity
          style={styles.viewBalancesBtn}
          onPress={() =>
            navigation.navigate('SavedBalancesHistory', {
              userId: customer._id,
              userType: 'customer',
            })
          }
        >
          <Icon name="wallet-outline" size={20} color="#1E293B" />
          <Text style={styles.viewBalancesBtnText}>View Saved Balances</Text>
        </TouchableOpacity> */}

        {/* ADMIN ONLY SAVING CONTROL TRIGGER GRID LINK */}
        {/* {isAdmin && (
          <TouchableOpacity
            style={styles.saveBalanceBtn}
            onPress={handleSaveCurrentBalance}
          >
            <Icon name="checkmark-done-circle" size={22} color="#fff" />
            <Text style={styles.saveBalanceBtnText}>Save Current Balance</Text>
          </TouchableOpacity>
        )} */}

        {!isCustomer && !isFarmer && (
          <View style={styles.entryComponentWrapper}>
            <AddEntryAndSale
              customer={customer}
              userType={userType}
              dataUpdate={getUser}
            />
          </View>
        )}

        <View style={styles.tableContainer}>
          <EntriesTable
            userId={customer._id}
            isCustomer={isCustomer}
            customer={customer}
            userType={userType}
            findTotalWeight={(wt, bW, cW, bAmt = 0, cAmt = 0) => {
              setTotalWeight(wt);
              setBuffalowTotalWeight(bW);
              setCowTotalWeight(cW);
              setBuffaloTotalAmount(bAmt);
              setCowTotalAmount(cAmt);
            }}
            dataUpdate={() => getUser()}
            setTotalEarn={(wt, amnt) => {
              setTotalWeight(wt);
              setEarnings(amnt);
            }}
          />
        </View>

        {/* MODALS */}
        <Modal animationType="fade" transparent visible={showLogout}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmBox}>
              <View style={styles.warnIcon}>
                <IconLogout name="warning" size={30} color="#ef4444" />
              </View>
              <Text style={styles.confirmTitle}>Confirm Logout</Text>
              <Text style={styles.confirmSub}>
                Are you sure you want to exit?
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowLogout(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={Logout}>
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showAddPaymentModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>New Payment</Text>
                <TouchableOpacity onPress={() => setShowAddPaymentModal(false)}>
                  <FeIcon name="x" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount to Receive</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="₹ 0.00"
                  keyboardType="numeric"
                  onChangeText={setCashPayment}
                  value={cashPayment}
                />
              </View>
              <TouchableOpacity
                style={styles.inputGroup}
                onPress={() => setOpen(true)}
              >
                <Text style={styles.inputLabel}>Transaction Date</Text>
                <View style={styles.datePickerDisplay}>
                  <Text style={styles.dateValueText}>
                    {date.toDateString()}
                  </Text>
                  <FeIcon name="calendar" size={18} color="#1e293b" />
                </View>
              </TouchableOpacity>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { height: 80, textAlignVertical: 'top' },
                  ]}
                  placeholder="Enter description..."
                  multiline
                  onChangeText={setCashPaymentDescription}
                  value={cashPaymentDescription}
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={AddPayment}>
                <Text style={styles.saveBtnText}>Save Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <DatePicker
          modal
          open={open}
          date={date}
          onConfirm={date => {
            setOpen(false);
            setDate(date);
          }}
          onCancel={() => setOpen(false)}
          mode="datetime"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerContainer: {
    backgroundColor: '#1e293b',
    paddingTop: Platform.OS === 'android' ? 45 : 60,
    paddingBottom: 70,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleRed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firmName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  customerMeta: { marginTop: 20, alignItems: 'center' },
  customerNameMain: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  idBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  phoneText: { color: '#94a3b8', fontSize: 14 },
  statsCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    marginTop: -50,
    elevation: 8,
  },
  statsLabel: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  balanceAmount: { fontSize: 34, fontWeight: '800', marginLeft: 10 },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginVertical: 15,
  },
  weightStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightBox: { flex: 1, paddingHorizontal: 4 },
  verticalDivider: { width: 1, height: 45, backgroundColor: '#e2e8f0' },
  weightLabel: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  metaLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  weightValue: { fontSize: 14, fontWeight: '700', color: '#334155' },
  amountValue: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  unit: { fontSize: 11, color: '#64748b', fontWeight: '400' },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  secondaryBtnText: { color: '#1e293b', fontWeight: 'bold', fontSize: 15 },
  viewBalancesBtn: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  viewBalancesBtnText: { color: '#1E293B', fontWeight: 'bold', fontSize: 15 },
  saveBalanceBtn: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    marginTop: 12,
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
  },
  saveBalanceBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  entryComponentWrapper: { paddingHorizontal: 10, marginTop: 5 },
  tableContainer: { flex: 1, marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
  },
  warnIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  confirmSub: { color: '#64748b', marginTop: 8, marginBottom: 20 },
  confirmActions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  logoutBtn: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#ef4444',
  },
  logoutBtnText: { color: '#fff', fontWeight: '600' },
  sheetContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  datePickerDisplay: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateValueText: { fontSize: 16, color: '#1e293b' },
  saveBtn: {
    backgroundColor: '#1e293b',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryActionRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 12,
    gap: 12,
  },
  minBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  minBtnText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  saveBtnActive: { backgroundColor: '#334155' },
  minBtnTextActive: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  integratedActionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  }
});

export default CustomerHome;
