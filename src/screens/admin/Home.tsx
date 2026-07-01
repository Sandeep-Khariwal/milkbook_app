import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../token/tokenStorage';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import { formatDate } from '../../../utility/helperFunctions';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';

const Home = ({ navigation }) => {
  const firm = useSelector((state: any) => state.firm.value);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [avgFat, setAvgFat] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();

  const [firmInfo, setFirmInfo] = useState<{
    customers: number,
    farmers: number,
    stocks: number,
    distributers: number
  }>({
    customers: 0,
    farmers: 0,
    stocks: 0,
    distributers: 0
  });

  useEffect(() => {
    if (firm.subscriptionExp) {
      navigation.navigate('Plans');
    }
    if (firm.id) {
      getTodayEntry(firm.id);
    }
  }, [firm.id, isFocused]);

  const getTodayEntry = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/entry/all/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const { data, firmInfo } = await res.json();
      
      const filteredData = data
        .filter((ent: any) => ent.customer.userType === 'farmer')
        .map((ent: any) => ({
          name: ent.customer.name,
          fat: ent.fat,
          userCode: ent.customer.userCode,
          weight: ent.weight,
          timeZone: ent.timeZone,
          amount: ent.amount,
          date: ent.date,
        }));

      setAllEntries(filteredData);
      if (firmInfo) {
        setFirmInfo(firmInfo);
      }

      const todayTotalWeight = filteredData.reduce((acc: number, curr: any) => acc + curr.weight, 0);
      setTotalWeight(todayTotalWeight);

      const todayTotalCream = filteredData.reduce((acc: number, curr: any) => acc + (curr.fat * curr.weight), 0);
      const todayAvgFat = todayTotalWeight > 0 ? todayTotalCream / todayTotalWeight : 0;
      setAvgFat(Number(todayAvgFat.toFixed(2)));

    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <View style={styles.headerSection}>
        <Text style={styles.welcomeLabel}>Welcome Back,</Text>
        <Text style={styles.firmNameLabel}>{firm.name || 'Dashboard'}</Text>
        
        <View style={styles.summaryContainer}>
          <View style={[styles.infoCard, { borderLeftColor: '#3b82f6' }]}>
            <View style={styles.iconBoxBlue}>
              <Icon name="scale-bathroom" size={22} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Total Weight</Text>
              <Text style={styles.infoValue}>{totalWeight.toFixed(2)} <Text style={styles.smallUnit}>L</Text></Text>
            </View>
          </View>

          <View style={[styles.infoCard, { borderLeftColor: '#10b981' }]}>
            <View style={styles.iconBoxGreen}>
              <FontAwesome name="percentage" size={18} color="#10b981" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Average Fat</Text>
              <Text style={styles.infoValue}>{avgFat}%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.listSection}>
        {/* PREMIUM STATS GRID SECTION */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.statCard, { borderTopColor: '#6366f1' }]} 
              onPress={() => navigation.navigate('Farmers')}
            >
              <View style={[styles.statIconWrapper, { backgroundColor: '#e0e7ff' }]}>
                <FontAwesome name="tractor" size={16} color="#6366f1" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCardValue}>{firmInfo?.farmers || 0}</Text>
                <Text style={styles.statCardLabel}>Farmers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.statCard, { borderTopColor: '#ec4899' }]} 
              onPress={() => navigation.navigate('Customers')}
            >
              <View style={[styles.statIconWrapper, { backgroundColor: '#fce7f3' }]}>
                <FontAwesome name="users" size={14} color="#ec4899" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCardValue}>{firmInfo?.customers || 0}</Text>
                <Text style={styles.statCardLabel}>Customers</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.gridRow}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.statCard, { borderTopColor: '#f59e0b' }]} 
              onPress={() => navigation.navigate('Stocks')}
            >
              <View style={[styles.statIconWrapper, { backgroundColor: '#fef3c7' }]}>
                <Icon name="storefront" size={18} color="#f59e0b" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCardValue}>{firmInfo?.stocks || 0}</Text>
                <Text style={styles.statCardLabel}>Stocks</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.statCard, { borderTopColor: '#14b8a6' }]} 
              onPress={() => navigation.navigate('Distributers')}
            >
              <View style={[styles.statIconWrapper, { backgroundColor: '#ccfbf1' }]}>
                <FontAwesome name="truck" size={14} color="#14b8a6" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statCardValue}>{firmInfo?.distributers || 0}</Text>
                <Text style={styles.statCardLabel}>Distributors</Text>
              </View>
            </TouchableOpacity>
          </View> */}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Entries</Text>
          <View style={styles.entryCountBadge}>
            <Text style={styles.entryCountText}>{allEntries.length} Items</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {allEntries.map((ent, i) => (
            <View key={i} style={styles.entryRow}>
              <View style={styles.dateCol}>
                <Text style={styles.dateMain}>{formatDate(new Date(ent.date))}</Text>
                <View style={[styles.shiftTag, { backgroundColor: ent.timeZone === 'Morning' ? '#fff7ed' : '#f0f9ff' }]}>
                  <Text style={[styles.shiftText, { color: ent.timeZone === 'Morning' ? '#c2410c' : '#0369a1' }]}>
                    {ent.timeZone}
                  </Text>
                </View>
              </View>

              <View style={styles.nameCol}>
                <Text style={styles.userName} numberOfLines={1}>{ent.name}</Text>
                <Text style={styles.userCode}>Code: {ent.userCode}</Text>
              </View>

              <View style={styles.dataCol}>
                <View style={styles.statBadgeBlue}>
                  <Text style={styles.statLabel}>W</Text>
                  <Text style={styles.statValueBlue}>{ent.weight}L</Text>
                </View>
                <View style={styles.statBadgeGreen}>
                  <Text style={styles.statLabel}>F</Text>
                  <Text style={styles.statValueGreen}>{ent.fat}%</Text>
                </View>
              </View>

              <View style={styles.amountCol}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Text style={styles.amountValue}>{Number(ent.amount).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  firmNameLabel: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconBoxBlue: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  smallUnit: {
    fontSize: 12,
    color: '#64748b',
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  /* NEW: Premium Grid Layout Styles */
  gridContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  statIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statContent: {
    justifyContent: 'center',
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statCardLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  entryCountBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  entryCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateCol: {
    flex: 1,
  },
  dateMain: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  shiftTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  shiftText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nameCol: {
    flex: 1.5,
    paddingHorizontal: 5,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  userCode: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  dataCol: {
    flex: 0.8,
    gap: 4
  },
  amountCol: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
    marginRight: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  statBadgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 4,
  },
  statValueBlue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  statValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  }
});

export default Home;