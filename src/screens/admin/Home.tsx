import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../token/tokenStorage';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import { formatDate } from '../../../utility/helperFunctions';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import {
  Modal,
  TextInput,
} from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { Keyboard } from 'react-native';

const Home = ({ navigation }) => {
  const firm = useSelector((state: any) => state.firm.value);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [avgFat, setAvgFat] = useState<number>(0);
  const [farmerWeight, setFarmerWeight] = useState<number>(0);
  const [customerWeight, setCustomerWeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const [customerAmount, setCustomerAmount] = useState<number>(0);
  const [saleModal, setSaleModal] = useState(false);

  const [customerName, setCustomerName] = useState("");

  const [saleWeight, setSaleWeight] = useState("");

  const [saleRate, setSaleRate] = useState("");

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

      const filteredData = data.map((ent: any) => ({
        name: ent.customer.name,
        fat: ent.fat,
        userCode: ent.customer.userCode,
        weight: ent.weight,
        timeZone: ent.timeZone,
        amount: ent.amount,
        date: ent.date,
        userType: ent.customer.userType,
      }));

      setAllEntries(filteredData);
      if (firmInfo) {
        setFirmInfo(firmInfo);
      }

      let fatMilk = 0;
      let farmerMilk = 0;
      let customerMilk = 0;
      let farmerCream = 0;
      let customerAmountTotal = 0;

      data.forEach((ent: any) => {

        if (ent.customer.userType === "farmer") {

          const weight = Number(ent.weight);
          const fat = Number(ent.fat);

          // Total Farmer Milk
          farmerMilk += weight;

          // Average Fat sirf valid fat entries se
          if (fat > 0) {
            fatMilk += weight;
            farmerCream += weight * fat;
          }
        }

        if (ent.customer.userType === "customer") {

          customerMilk += Number(ent.weight);
          customerAmountTotal += Number(ent.amount);

        }

      });

      setCustomerAmount(customerAmountTotal);
      setFarmerWeight(farmerMilk);
      setCustomerWeight(customerMilk);

      // Top Card
      setTotalWeight(farmerMilk);

      // Average Fat (Farmer only)
      const averageFat =
        fatMilk > 0 ? farmerCream / fatMilk : 0;

      setAvgFat(Number(averageFat.toFixed(2)));

    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDairySale = async () => {
    if (!saleWeight || !saleRate) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Please enter quantity and rate.",
      });

      return;
    }

    if (Number(saleWeight) <= 0) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Invalid quantity.",
      });
      return;
    }

    if (Number(saleRate) <= 0) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Invalid rate.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}/dairy-sale/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firm: firm.id,
          customerName: customerName.trim(),
          weight: Number(saleWeight),
          rate: Number(saleRate),
          date: new Date(),
        }),
      });

      const response = await res.json();

      if (response.status === 200) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Dairy Sale Added Successfully.",
        });

        Keyboard.dismiss();

        // Reset fields
        setCustomerName("");
        setSaleWeight("");
        setSaleRate("");
        setSaleModal(false);

        // Refresh Home
        getTodayEntry(firm.id);
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: response.message,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  const balance = farmerWeight - customerWeight;

  const totalSale =
    (Number(saleWeight) || 0) *
    (Number(saleRate) || 0);

  const formatAmount = (amount: number) => {
    return Number.isInteger(amount)
      ? amount.toString()
      : amount.toFixed(2);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.headerSection}>

        <View style={styles.headerTop}>

          <View>
            <Text style={styles.welcomeLabel}>
              Welcome Back,
            </Text>

            <Text style={styles.firmNameLabel}>
              {firm.name || "Dashboard"}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.saleBtn}
            onPress={() => navigation.navigate("DairySales")}
          >
            <Icon
              name="plus"
              color="#fff"
              size={18}
            />

            <Text style={styles.saleBtnText}>
              Dairy Sale
            </Text>
          </TouchableOpacity>

        </View>

        {/* <View style={styles.totalCard}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalTitle}>Today's Total Milk</Text>
            <Text style={styles.totalValue}>
              {totalWeight.toFixed(2)}
              <Text style={styles.totalUnit}> L</Text>
            </Text>
          </View>

          <View style={styles.totalIcon}>
            <Icon
              name="cup-water"
              size={38}
              color="#2563eb"
            />
          </View>
        </View>

        <View style={styles.summaryContainer}>

          <View style={[styles.infoCard, { borderLeftColor: "#10b981" }]}>
            <View style={styles.iconBoxGreen}>
              <FontAwesome
                name="percentage"
                size={18}
                color="#10b981"
              />
            </View>

            <View>
              <Text style={styles.infoLabel}>Average Fat</Text>
              <Text style={styles.infoValue}>{avgFat}%</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { borderLeftColor: "#f59e0b" }]}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#fef3c7",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}>
              <FontAwesome
                name="rupee-sign"
                size={18}
                color="#f59e0b"
              />
            </View>

            <View>
              <Text style={styles.infoLabel}>Collected ₹</Text>
              <Text style={styles.infoValue}>
                ₹{customerAmount.toFixed(2)}
              </Text>
            </View>
          </View>

        </View> */}
      </View>

      <View style={styles.listSection}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.summaryCard}>

            <Text style={styles.summaryTitle}>
              Today's Farmer Milk Summary
            </Text>

            <View>
              <View style={styles.summaryContainer}>

                <View style={[styles.infoCard, { borderLeftColor: "#2563eb" }]}>
                  <View style={styles.iconBoxBlue}>
                    <Icon
                      name="cup-water"
                      size={22}
                      color="#2563eb"
                    />
                  </View>

                  <View>
                    <Text style={styles.infoLabel}>
                      Total Milk
                    </Text>

                    <Text style={styles.infoValue}>
                      {totalWeight.toFixed(2)}L
                    </Text>
                  </View>
                </View>

                <View style={[styles.infoCard, { borderLeftColor: "#10b981" }]}>
                  <View style={styles.iconBoxGreen}>
                    <FontAwesome
                      name="percentage"
                      size={18}
                      color="#10b981"
                    />
                  </View>

                  <View>
                    <Text style={styles.infoLabel}>
                      Average Fat
                    </Text>

                    <Text style={styles.infoValue}>
                      {avgFat}%
                    </Text>
                  </View>
                </View>

              </View>





            </View>

          </View>

          <View style={styles.summaryCard}>

            <Text style={styles.summaryTitle}>
              Today's Customer Milk Summary
            </Text>

            <View>

              <View style={styles.summaryContainer}>

                <View style={[styles.infoCard, { borderLeftColor: "#0ea5e9" }]}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#e0f2fe",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome
                      name="truck"
                      size={16}
                      color="#0ea5e9"
                    />
                  </View>

                  <View>
                    <Text style={styles.infoLabel}>
                      Delivered
                    </Text>

                    <Text style={styles.infoValue}>
                      {customerWeight.toFixed(2)}L
                    </Text>
                  </View>
                </View>

                <View style={[styles.infoCard, { borderLeftColor: "#f59e0b" }]}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: "#fef3c7",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome
                      name="rupee-sign"
                      size={18}
                      color="#f59e0b"
                    />
                  </View>

                  <View>
                    <Text style={styles.infoLabel}>
                      Collected
                    </Text>

                    <Text style={styles.infoValue}>
                      ₹{formatAmount(customerAmount)}
                    </Text>
                  </View>
                </View>

              </View>



            </View>
          </View>
          {/* <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Milk Summary</Text>

            <View style={styles.summaryRow}>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Collected</Text>
                <Text style={styles.summaryValue}>
                  {farmerWeight.toFixed(2)}L
                </Text>
                <Text style={styles.summarySub}>
                  Farmer
                </Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Delivered</Text>
                <Text style={styles.summaryValue}>
                  {customerWeight.toFixed(2)}L
                </Text>
                <Text style={styles.summarySub}>
                  Customer
                </Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Balance</Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        balance >= 0
                          ? "#16a34a"
                          : "#dc2626",
                    },
                  ]}>
                  {balance.toFixed(2)}L
                </Text>

                <Text style={styles.summarySub}>
                  Remaining
                </Text>
              </View>

            </View>
          </View> */}
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
                <Text style={styles.userCode}>
                  {ent.userCode} • {ent.userType}
                </Text>

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
                <Text style={styles.amountValue}>
                  {formatAmount(Number(ent.amount))}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

      </View>
      <Modal
        visible={saleModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSaleModal(false);
        }}
      >
        <View style={styles.modalOverlay}>

          <View style={styles.saleModal}>

            <Text style={styles.modalTitle}>
              Dairy Sale
            </Text>

            <TextInput
              placeholder="Customer Name (Optional)"
              placeholderTextColor="#94a3b8"
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.input}
            />

            <TextInput
              placeholder="Milk Quantity (L)"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              value={saleWeight}
              onChangeText={setSaleWeight}
              style={styles.input}
            />

            <TextInput
              placeholder="Rate ₹/L"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
              value={saleRate}
              onChangeText={setSaleRate}
              style={styles.input}
            />

            <View style={styles.totalBox}>
              <Text style={styles.totalText}>
                Total
              </Text>

              <Text style={styles.totalAmount}>
                ₹ {totalSale.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              disabled={isLoading}
              style={[
                styles.saveBtn,
                { opacity: isLoading ? 0.6 : 1 }
              ]}
              onPress={saveDairySale}
            >
              <Text style={styles.saveBtnText}>
                Save Sale
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setSaleModal(false);
                setCustomerName("");
                setSaleWeight("");
                setSaleRate("");
              }}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  saleModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 17,
    marginBottom: 14,
    color: "#0f172a",
  },

  totalBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  totalText: {
    fontSize: 18,
    color: "#334155",
    fontWeight: "600",
  },

  totalAmount: {
    fontSize: 24,
    color: "#2563eb",
    fontWeight: "700",
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    marginTop: 22,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 46,
  },

  cancelText: {
    color: "#64748b",
    fontSize: 17,
    fontWeight: "600",
  },

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
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  firmNameLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },

  totalCard: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLeft: {
    flex: 1,
  },

  totalTitle: {
    color: "#dbeafe",
    fontSize: 16,
    fontWeight: "600",
  },

  totalValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 6,
  },

  totalUnit: {
    fontSize: 20,
    color: "#dbeafe",
  },

  totalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryContainer: {
    flexDirection: "row",
    marginTop: 14,
    gap: 12,
  },

infoCard: {
  flex: 1,
  backgroundColor: "#fff",
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 12,
  paddingRight: 14,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
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

  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  summaryText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
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
  fontSize: 14,
  color: '#94a3b8',
  fontWeight: '700',
  textTransform: 'none',
  marginBottom: 3,
  paddingRight: 6,
},

  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  smallUnit: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  statCardLabel: {
    fontSize: 13,
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
    fontSize: 20,
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
    fontSize: 14,
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
    fontSize: 15,
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
    fontSize: 12,
    fontWeight: '700',
  },

  nameCol: {
    flex: 1.5,
    paddingHorizontal: 5,
  },

  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },

  userCode: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },

  dataCol: {
    flex: 0.8,
    gap: 4,
  },

  amountCol: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  currencySymbol: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
    marginRight: 2,
  },

  amountValue: {
    fontSize: 20,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 4,
  },

  statValueBlue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },

  statValueGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },

  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },

  summaryValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 8,
  },

  summarySub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saleBtn: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    elevation: 4,
  },

  saleBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 15,
  },
});

export default Home;