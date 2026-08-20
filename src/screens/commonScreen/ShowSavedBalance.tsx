import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FeIcon from 'react-native-vector-icons/Feather';
import { BASE_URL, getToken } from '../../../token/tokenStorage';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import { formatDate } from '../../../utility/helperFunctions';

const ShowSavedBalance = ({ route }: { route: any }) => {
  const customerId = route.params.userId;
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balanceList, setBalanceList] = useState<any[]>([]);

  useEffect(() => {
    const getSavedBalance = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${BASE_URL}/user/getUserBookings/${customerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        // Safely map the incoming data array
        if (data && data.data) {
          setBalanceList(data.data);
        }
      } catch (e) {
        console.log("Error fetching balance list: ", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (customerId) getSavedBalance();
  }, [customerId]);

  // Premium value formatter matching your explicit decimal format requirement (e.g. 66.77)
  const formatValue = (value: number | undefined) => {
    if (value === undefined || value === null) return '0.00';
    return value.toFixed(2);
  };

  // Render block for individual statement cards in the list
  const renderBalanceItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.ledgerCard}>
        {/* Top Header Row of Card */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.idLabel}>STATEMENT ID</Text>
            <Text style={styles.idValue} numberOfLines={1}>{item._id}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.totalLabel}>NET ASSET</Text>
            <Text style={styles.totalValue}>₹{formatValue(item.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Breakdown Metric Columns */}
        <View style={styles.gridRow}>
          {/* Cow Sub-card */}
          <View style={styles.subMetricBox}>
            <View style={styles.metricRow}>
              <FeIcon name="activity" size={12} color="#6366f1" />
              <Text style={styles.subLabel}>Cow Metrics</Text>
            </View>
            <Text style={styles.subValue}>{formatValue(item.cowWeight)} kg</Text>
            <Text style={styles.subValueCurrency}>₹{formatValue(item.cowAmount)}</Text>
          </View>

          {/* Buffalo Sub-card */}
          <View style={styles.subMetricBox}>
            <View style={styles.metricRow}>
              <FeIcon name="shield" size={12} color="#f59e0b" />
              <Text style={styles.subLabel}>Buffalo Metrics</Text>
            </View>
            <Text style={styles.subValue}>{formatValue(item.buffalowWeight)} kg</Text>
            <Text style={styles.subValueCurrency}>₹{formatValue(item.buffaloAmount)}</Text>
          </View>
        </View>

        {/* Footer Sync Date */}
        <View style={styles.cardFooter}>
          <FeIcon name="clock" size={11} color="#475569" />
          <Text style={styles.footerDateText}>
            Logged: {item.createdAt ? formatDate(new Date(item.createdAt)) : 'N/A'}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Premium Screen Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Balance Ledger</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{balanceList.length}</Text>
        </View>
      </View>

      {/* Modern High-Performance List */}
      <FlatList
        data={balanceList}
        keyExtractor={(item) => item._id}
        renderItem={renderBalanceItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FeIcon name="layers" size={40} color="#334155" />
            <Text style={styles.emptyText}>No premium ledger statements found.</Text>
          </View>
        }
      />
    </View>
  );
};

export default ShowSavedBalance;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#070a13' // Ultra-Premium Deep Dark Canvas
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#070a13',
  },
  backButton: {
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  badgeCount: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  badgeCountText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ledgerCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 1,
  },
  idValue: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
    maxWidth: 150,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  subMetricBox: {
    flex: 1,
    backgroundColor: '#0b0f19',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  subValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  subValueCurrency: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  footerDateText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 140,
  },
  emptyText: { 
    color: '#475569', 
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
});