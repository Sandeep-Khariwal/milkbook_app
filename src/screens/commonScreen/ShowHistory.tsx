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
  Platform,
  StatusBar,
  ScrollView,
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

  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('all');
  const [historyType, setHistoryType] = useState<'entries' | 'payments'>(
    'entries',
  );

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [selectedPaymentMonth, setSelectedPaymentMonth] =
    useState(new Date());

  const [paymentFromDate, setPaymentFromDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [paymentToDate, setPaymentToDate] = useState(() => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  });

  const isFarmer = userType === 'farmer';
  const [stockCountMap, setStockCountMap] = useState<Map<string, number>>(
    new Map(),
  );

 useEffect(() => {
  if (!isFarmer) {
    const getStocks = async () => {
      setIsLoading(true);

      await fetch(`${BASE_URL}/firm/stocks/${firm.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
  }
}, []);

  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any>({
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
    }

    if (customerId) {
      if (isFarmer && historyType === 'payments') {
        getPaymentHistory(customerId);
      } else {
        getUserHistory(customerId);
      }
    }
  }, [firmId, customerId, historyType]);

  const getAllHistory = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/history/all/${id}?month=1`);
      const { data } = await res.json();
      setAllHistory(data);
      setShowHistory(data);
      setIsLoading(false);

      const newMap = new Map();
      data.forEach((stk: any) => {
        newMap.set(stk.productName, (newMap.get(stk.productName) || 0) + 1);
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
        newMap.set(stk.productName, (newMap.get(stk.productName) || 0) + 1);
      });
      setStockCountMap(newMap);
    } catch (e) {
      console.log(e);
    }
  };

  const getPaymentHistory = async (
    id: string,
    from: Date = paymentFromDate,
    to: Date = paymentToDate,
  ) => {
    try {
      setIsLoading(true);

      const query = new URLSearchParams({
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
      }).toString();

      const res = await fetch(
        `${BASE_URL}/history/user/payment/${id}?${query}`,
      );

      const result = await res.json();

      setPaymentHistory(result.history || []);
    } catch (e) {
      console.log(e);
      setPaymentHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const changePaymentMonth = (direction: 'prev' | 'next') => {
    const currentMonth = new Date();

    const newMonth = new Date(selectedPaymentMonth);

    if (
      direction === 'next' &&
      selectedPaymentMonth.getMonth() === currentMonth.getMonth() &&
      selectedPaymentMonth.getFullYear() === currentMonth.getFullYear()
    ) {
      return;
    }

    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }

    setSelectedPaymentMonth(newMonth);

    const start = new Date(
      newMonth.getFullYear(),
      newMonth.getMonth(),
      1,
    );

    const end = new Date(
      newMonth.getFullYear(),
      newMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    setPaymentFromDate(start);
    setPaymentToDate(end);

    if (customerId) {
      getPaymentHistory(customerId, start, end);
    }
  };

  const SeeAllHistory = () => {
    let payload = firmId ? { firmId, userType } : { customerId, userType };
    navigation.navigate('AllHistory', payload);
  };

  const deleteHistory = async (history: any) => {
    setIsLoading(true);
    try {
      const payload = { userId: customerId, amount: history.amount, userType };
      await fetch(`${BASE_URL}/history/delete/${history._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (firmId) getAllHistory(firmId);
      if (customerId) getUserHistory(customerId);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const editHistory = async () => {
    try {
      const foundSigleHist = showHistory.find(
        hist => hist.productName === selectedHistory.productName,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsEditHistory(false);
      if (firmId) getAllHistory(firmId);
      if (customerId) getUserHistory(customerId);
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem = ({ item }: any) => {
    const isNegative = item.amount < 0;
    return (
      <View style={styles.card}>
        <View
          style={[
            styles.statusStrip,
            { backgroundColor: isNegative ? '#ef4444' : '#10b981' },
          ]}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.customerName}>
                {item.user?.name || 'N/A'}
              </Text>
            </View>
            <View style={styles.actionRow}>
              {item.productName && (
                <TouchableOpacity
                  onPress={() => {
                    setIsEditHistory(true);
                    setSelectedHistory(item);
                  }}
                  style={styles.iconBtn}
                >
                  <FeIcon name="edit-3" size={18} color="#6366f1" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => deleteHistory(item)}
                style={styles.iconBtn}
              >
                <FeIcon name="trash-2" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{item.quantity}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text
                style={[
                  styles.amountValue,
                  { color: isNegative ? '#ef4444' : '#10b981' },
                ]}
              >
                {isNegative ? '-' : '+'} ₹{Math.abs(item.amount)}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.descriptionText} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(new Date(item.date))}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentItem = ({ item }: any) => {
    const amount = Math.abs(Number(item.amount || 0));

    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentIcon}>
          <FeIcon name="arrow-up-right" size={22} color="#EF4444" />
        </View>

        <View style={styles.paymentContent}>
          <View style={styles.paymentTopRow}>
            <View>
              <Text style={styles.paymentTitle}>Payment</Text>

              <Text style={styles.paymentDate}>
                {formatDate(new Date(item.date))}
              </Text>
            </View>

            <Text style={styles.paymentAmount}>
              - ₹{amount.toFixed(2)}
            </Text>
          </View>

          {item.description ? (
            <Text style={styles.paymentDescription}>
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };





  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  const PaymentHistoryList = () => {
    const currentMonth = new Date();

    const isCurrentPaymentMonth =
      selectedPaymentMonth.getMonth() === currentMonth.getMonth() &&
      selectedPaymentMonth.getFullYear() === currentMonth.getFullYear();

    const monthlyPaymentTotal = paymentHistory.reduce(
      (total, item) => total + Math.abs(Number(item.amount || 0)),
      0,
    );

    return (
      <View style={{ flex: 1 }}>
        {/* MONTH SELECTOR */}
        <View style={styles.paymentMonthCard}>
          <TouchableOpacity
            style={styles.paymentMonthBtn}
            onPress={() => changePaymentMonth('prev')}
          >
            <FeIcon name="chevron-left" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.paymentMonthCenter}>
            <Text style={styles.paymentMonthText}>
              {selectedPaymentMonth.toLocaleString('default', {
                month: 'long',
              })}
            </Text>

            <Text style={styles.paymentYearText}>
              {selectedPaymentMonth.getFullYear()}
            </Text>
          </View>

          <TouchableOpacity
            disabled={isCurrentPaymentMonth}
            style={[
              styles.paymentMonthBtn,
              isCurrentPaymentMonth && styles.paymentMonthBtnDisabled,
            ]}
            onPress={() => changePaymentMonth('next')}
          >
            <FeIcon
              name="chevron-right"
              size={22}
              color={isCurrentPaymentMonth ? '#94A3B8' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* MONTHLY TOTAL */}
        <View style={styles.paymentTotalCard}>
          <View>
            <Text style={styles.paymentTotalLabel}>Total Paid</Text>

            <Text style={styles.paymentTotalMonth}>
              {selectedPaymentMonth.toLocaleString('default', {
                month: 'long',
              })}{' '}
              {selectedPaymentMonth.getFullYear()}
            </Text>
          </View>

          <Text style={styles.paymentTotalAmount}>
            ₹{monthlyPaymentTotal.toFixed(2)}
          </Text>
        </View>

        {/* PAYMENT LIST */}
        <FlatList
          data={paymentHistory}
          keyExtractor={item => item._id}
          renderItem={renderPaymentItem}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No payments found for this month
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.heroContainer}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.title}>History</Text>

          <TouchableOpacity style={styles.navBtn} onPress={SeeAllHistory}>
            <Text style={styles.seeAllText}>All</Text>
            <Icon name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subTitle}>Last 30 Days Transactions</Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >

          <TouchableOpacity
            onPress={() => {
              setHistoryType('entries');
              setSelectedStock('all');
            }}
            style={[
              styles.chip,
              historyType === 'entries' &&
              selectedStock === 'all' &&
              styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                historyType === 'entries' &&
                selectedStock === 'all' &&
                styles.chipTextActive,
              ]}
            >
              All Entries
            </Text>
          </TouchableOpacity>
          {isFarmer && (
            <TouchableOpacity
              onPress={() => {
                setHistoryType('payments');
                setSelectedStock('');
              }}
              style={[
                styles.chip,
                historyType === 'payments' && styles.chipActive,
              ]}
            >
              <FeIcon
                name="credit-card"
                size={16}
                color={historyType === 'payments' ? '#fff' : '#64748b'}
              />

              <Text
                style={[
                  styles.chipText,
                  historyType === 'payments' && styles.chipTextActive,
                  { marginLeft: 6 },
                ]}
              >
                Payment History
              </Text>
            </TouchableOpacity>
          )}
          {historyType === 'entries' &&
            stocks.map(stk => {
              const isSelected = selectedStock === stk.item;
              return (
                <TouchableOpacity
                  key={stk._id}
                  onPress={() => setSelectedStock(stk.item)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, isSelected && styles.chipTextActive]}
                  >
                    {stk.item}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      isSelected && styles.countBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        isSelected && styles.countTextActive,
                      ]}
                    >
                      {stockCountMap.get(stk.item) || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {historyType === 'entries' ? (
        <FlatList
          data={showHistory}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      ) : (
        <PaymentHistoryList />
      )}

      <Modal
        animationType="slide"
        transparent
        visible={isEditHistory}
        onRequestClose={() => setIsEditHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Entry</Text>
              <TouchableOpacity onPress={() => setIsEditHistory(false)}>
                <FeIcon name="x-circle" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                editable={false}
                value={selectedHistory.productName}
                style={[styles.modernInput, { backgroundColor: '#f8fafc' }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Quantity</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={text =>
                  setSelectedHistory((prev: any) => ({
                    ...prev,
                    quantity: Number(text),
                  }))
                }
                value={String(selectedHistory.quantity)}
                style={styles.modernInput}
                placeholder="Enter quantity"
              />
            </View>

            <TouchableOpacity onPress={editHistory} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Update History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShowHistory;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  heroContainer: {
    backgroundColor: '#6366f1',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    elevation: 10,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  paymentContent: {
    flex: 1,
  },

  paymentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },

  paymentDate: {
    marginTop: 4,
    fontSize: 13,
    color: '#94A3B8',
  },

  paymentAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
  },

  paymentDescription: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },

  paymentMonthCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  paymentMonthBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentMonthBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },

  paymentMonthCenter: {
    flex: 1,
    alignItems: 'center',
  },

  paymentMonthText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },

  paymentYearText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },

  paymentTotalCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentTotalLabel: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },

  paymentTotalMonth: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
  },

  paymentTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EF4444',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  seeAllText: { color: '#fff', fontWeight: 'bold', marginRight: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subTitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
  },

  filterWrapper: { marginTop: -20 },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#fff' },
  countBadge: {
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  countText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  countTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statusStrip: { width: 6 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  customerName: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: { fontSize: 17, fontWeight: 'bold', color: '#334155' },
  amountValue: { fontSize: 20, fontWeight: '900' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  dateText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94a3b8', fontWeight: '500' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  modernInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    color: '#1e293b',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
