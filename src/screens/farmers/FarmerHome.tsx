import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconLogout from 'react-native-vector-icons/AntDesign';
import FaIcon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import AddEntryAndSale from '../../components/customer/AddEntryAndSale';
import { BASE_URL, deleteToken } from '../../../token/tokenStorage';
import { setFirmDetails } from '../../../redux/slices/firmSlice';
import FeIcon from 'react-native-vector-icons/Feather';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import EntriesTable from '../customers/EntriesTable';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import DatePicker from 'react-native-date-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const FarmerHome = ({ route }: { route: any }) => {
  const id = route.params.id;
  const userType = route.params.userType;
  const firm = useSelector((state: any) => state.firm.value);
  const isFarmer = firm.role === 'farmer';
  const isAdmin = firm.role === 'admin';

  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [earnings, setEarnings] = useState<number>(0);
  const [totalBufallowWeight, setBuffalowTotalWeight] = useState<number>(0);
  const [totalCowWeight, setCowTotalWeight] = useState<number>(0);

  const [totalBuffaloAmount, setBuffaloTotalAmount] = useState<number>(0);
  const [totalCowAmount, setCowTotalAmount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const [scrollNow, setScrollNow] = useState<boolean>(false);

  const [showAddPaymentModal, setShowAddPaymentModal] =
    useState<boolean>(false);
  const [customer, setCustomer] = useState<any>({
    name: '',
    phoneNumber: '',
    _id: '',
    userCode: '',
  });
  const [cashPayment, setCashPayment] = useState<string>('');
  const [cashPaymentDescription, setCashPaymentDescription] =
    useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());

  const scrollRef = useRef<any>(null);
  const [tablePosition, setTablePosition] = useState(0);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (!isLoading && customer._id && scrollNow) {
      setTimeout(() => {
        scrollToBottom();
      }, 700);
    }
  }, [isLoading, customer._id, scrollNow]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/getUser/${id}`);
      const { user } = await response.json();

      console.log("============== GET USER ==============");
      console.log("Backend Earnings:", user.earnings);

      setEarnings(user.earnings);
      setCustomer(user);
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
        textBody: `Payment Required!!`,
      });
      return;
    }
    const payload = {
      firmId: firm.id,
      amount: -Number(cashPayment),
      user: customer._id,
      userType: 'farmer',
      description: cashPaymentDescription,
      date: new Date(date),
    };

    setIsLoading(true);
    try {
      await fetch(`${BASE_URL}/user/setPayment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((res: any) => {

      }).catch((e: any) => {
        console.log(e);
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
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!isFarmer && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Icon name="chevron-back" size={30} color="#FFF" />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.welcome}>Welcome Back 👋</Text>
              <Text style={styles.company}>
                {String(firm?.name).toUpperCase()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => isFarmer && setShowLogout(true)}
          >
            {isFarmer ? (
              <IconLogout name="logout" size={22} color="#fff" />
            ) : (
              <Icon name="person" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{customer.name || 'Loading...'}</Text>
            <Text style={styles.subText}>Code: {customer.userCode}</Text>
            <Text style={styles.subText}>{customer.phoneNumber}</Text>
          </View>
        </View>

        <View
          style={[
            styles.balanceCard,
            earnings < 0 && { backgroundColor: '#EF4444' },
          ]}
        >
          <Text style={styles.balanceTitle}>Total Earnings</Text>
          <View style={styles.rowCenter}>
            <FaIcon name="rupee" size={26} color="#fff" />
            <Text style={styles.balanceAmount}>
              {earnings?.toFixed(2) ?? 0}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Buffalo</Text>
              <View style={styles.metaMetricRow}>
                <Text style={styles.metaMetricLabel}>Wt:</Text>
                <Text style={styles.statValue}>
                  {parseFloat(totalBufallowWeight.toFixed(2))} KG
                </Text>
              </View>
              <View style={styles.metaMetricRow}>
                <Text style={styles.metaMetricLabel}>Amt:</Text>
                <Text style={styles.statValue}>
                  ₹{totalBuffaloAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Cow</Text>
              <View style={styles.metaMetricRow}>
                <Text style={styles.metaMetricLabel}>Wt:</Text>
                <Text style={styles.statValue}>
                  {parseFloat(totalCowWeight.toFixed(2))} KG
                </Text>
              </View>
              <View style={styles.metaMetricRow}>
                <Text style={styles.metaMetricLabel}>Amt:</Text>
                <Text style={styles.statValue}>
                  ₹{totalCowAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.secondaryActionRow}>
            <TouchableOpacity
              style={styles.minBtn}
              onPress={() => navigation.navigate('SavedBalance', { userId: customer._id, userType: 'farmer' })}
            >
              <Icon name="wallet-outline" size={16} color="#475569" />
              <Text style={styles.minBtnText}>Saved Balance</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity style={[styles.minBtn, styles.saveBtnActive]} onPress={handleSaveCurrentBalance}>
                <Icon name="checkmark-circle-outline" size={16} color="#FFF" />
                <Text style={styles.minBtnTextActive}>Save Balance</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() =>
              navigation.navigate('History', {
                customerId: customer._id,
                userType: 'farmer',
              })
            }
          >
            <Icon name="time" size={20} color="#fff" />
            <Text style={styles.btnText}>History</Text>
          </TouchableOpacity>
          {!isFarmer && (
            <TouchableOpacity
              style={styles.paymentBtn}
              onPress={() => setShowAddPaymentModal(true)}
            >
              <MaterialIcon name="payments" size={22} color="#fff" />
              <Text style={styles.btnText}>Add Payment</Text>
            </TouchableOpacity>
          )}
        </View>



        {/* MINIMIZED BUTTONS CONTAINER */}
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
            navigation.navigate('SavedBalance', {
              userId: customer._id,
              userType: 'farmer',
            })
          }
        >
          <Icon name="wallet-outline" size={20} color="#1E293B" />
          <Text style={styles.viewBalancesBtnText}>View Saved Balances</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.saveBalanceBtn}
            onPress={handleSaveCurrentBalance}
          >
            <Icon name="checkmark-done-circle" size={22} color="#fff" />
            <Text style={styles.btnText}>Save Current Balance</Text>
          </TouchableOpacity>
        )}
          */}

        {!isFarmer && (
          <AddEntryAndSale
            customer={customer}
            userType={userType}
            dataUpdate={() => {
              getUser();
              setScrollNow(true);
            }}
          />
        )}

        <View onLayout={event => setTablePosition(event.nativeEvent.layout.y)}>
          <EntriesTable
            userId={customer._id}
            isCustomer={isFarmer}
            customer={customer}
            userType={userType}
            dataUpdate={() => {
              getUser();
              setScrollNow(true);
            }}
            findTotalWeight={(wt, bW, cW, bAmt = 0, cAmt = 0) => {
              setBuffalowTotalWeight(bW);
              setCowTotalWeight(cW);
              setBuffaloTotalAmount(bAmt);
              setCowTotalAmount(cAmt);
            }}
            setTotalEarn={(wt, amnt) => {
              console.log("============== ENTRIES TABLE ==============");
              console.log("Calculated Earnings:", amnt);
            }}
          />
        </View>
      </ScrollView>

      {/* MODALS */}
      <Modal
        visible={showAddPaymentModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Add Payment</Text>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => setShowAddPaymentModal(false)}
              />
            </View>
            <View style={styles.modalInputWrapper}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={setCashPayment}
                value={cashPayment}
                style={styles.modalTextInput}
                placeholder="Enter amount"
              />
            </View>
            <View style={styles.modalInputWrapper}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <TouchableOpacity
                style={styles.datePickerToggle}
                onPress={() => setOpen(true)}
              >
                <Text style={{ color: '#333' }}>{date.toDateString()}</Text>
                <FeIcon name="calendar" size={20} color="#5086E7" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalInputWrapper}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                multiline
                numberOfLines={3}
                onChangeText={setCashPaymentDescription}
                value={cashPaymentDescription}
                style={[
                  styles.modalTextInput,
                  { height: 80, textAlignVertical: 'top' },
                ]}
                placeholder="Note (optional)"
              />
            </View>
            <TouchableOpacity
              style={styles.submitPaymentBtn}
              onPress={AddPayment}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                Confirm Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="datetime"
        onConfirm={selectedDate => {
          setOpen(false);
          setDate(selectedDate);
        }}
        onCancel={() => setOpen(false)}
      />

      <Modal animationType="fade" transparent visible={showLogout}>
        <View style={styles.centeredView}>
          <View style={styles.logoutModalView}>
            <Text style={styles.logoutTitle}>Logout?</Text>
            <Text style={styles.logoutSub}>
              Are you sure you want to logout from the farm portal?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogout(false)}
              >
                <Text style={{ color: '#0F172A', fontWeight: '600' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={Logout}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: { marginRight: 15, padding: 5 },
  welcome: { color: '#94A3B8', fontSize: 14 },
  company: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileCard: {
    margin: 18,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  name: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  subText: { color: '#64748B', marginTop: 4, fontSize: 14 },
  balanceCard: {
    marginHorizontal: 18,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
  },
  balanceTitle: { color: '#BFDBFE', fontSize: 16, fontWeight: '600' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: '48%',
    borderRadius: 16,
    padding: 14,
  },
  statLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaMetricLabel: { color: '#DBEAFE', fontSize: 12, fontWeight: '500' },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  actionButtonContainer: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 20,
    gap: 12,
  },
  historyBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  paymentBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  viewBalancesBtn: {
    backgroundColor: '#FFF',
    marginHorizontal: 18,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  viewBalancesBtnText: { color: '#1E293B', fontWeight: '700', fontSize: 15 },
  saveBalanceBtn: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 18,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContentCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 25,
    width: '90%',
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryCard: {
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 25,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  summarySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },

  summaryAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  summaryAmount: {
    marginLeft: 6,
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
  },
  modalHeaderTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  modalInputWrapper: { marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalTextInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#0F172A',
  },
  datePickerToggle: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitPaymentBtn: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutModalView: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '85%',
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  logoutSub: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  cancelBtn: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
    alignItems: 'center',
  },
  confirmBtn: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    flex: 1,
    alignItems: 'center',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 12,
    gap: 12,
  },
  minBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  minBtnText: { color: '#1E293B', fontWeight: '600', fontSize: 13 },
  saveBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  minBtnTextActive: { color: '#FFF', fontWeight: '600', fontSize: 13 },
});

export default FarmerHome;
