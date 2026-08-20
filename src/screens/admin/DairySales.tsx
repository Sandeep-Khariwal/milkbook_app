import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Modal,
    TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { BASE_URL, getToken } from "../../../token/tokenStorage";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useEffect } from "react";

const DairySales = ({ navigation }: any) => {
    const [saleModal, setSaleModal] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [saleWeight, setSaleWeight] = useState("");
    const [saleRate, setSaleRate] = useState("");

    const [dairySales, setDairySales] = useState<any[]>([]);
    const [todaySaleWeight, setTodaySaleWeight] = useState(0);
    const [todaySaleAmount, setTodaySaleAmount] = useState(0);
    const [todayEntries, setTodayEntries] = useState(0);
    
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
const [filter, setFilter] = useState("Today");
    const firm = useSelector((state: any) => state.firm.value);
    const totalSale =
        (Number(saleWeight) || 0) *
        (Number(saleRate) || 0);

useEffect(() => {
    setPageLoading(true);
    getTodaySales();
}, []);

    const saveSale = async () => {
        if (!saleWeight || !saleRate) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Warning",
                textBody: "Weight and Rate are required.",
            });
            return;
        }

        const token = await getToken();

        setLoading(true);

        try {
            const res = await fetch(
                `${BASE_URL}/dairy-sale/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        firm: firm.id,
                        customerName,
                        weight: Number(saleWeight),
                        rate: Number(saleRate),
                        date: new Date(),
                    })
                }
            );

            const result = await res.json();

            console.log("TODAY API RESPONSE:", result);

            const data = result.data || [];


            if (res.ok) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Success",
                    textBody: "Dairy Sale Added Successfully",
                });

                // Modal close
                setSaleModal(false);

                // Clear fields
                setCustomerName("");
                setSaleWeight("");
                setSaleRate("");

                // Refresh list
                getTodaySales();
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody: result.message || "Unable to create dairy sale.",
                });
            }
        } catch (e) {
            console.log(e);

            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Error",
                textBody: "Something went wrong.",
            });
        }
        finally {
            setLoading(false);
        }
    };

    const getTodaySales = async () => {
      
        const token = await getToken();

        try {
            const res = await fetch(
                `${BASE_URL}/dairy-sale/today/${firm.id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await res.json();

            console.log(result);

            const sales = result.sales || [];
            const summary = result.summary || {
                weight: 0,
                amount: 0,
                count: 0,
            };

            setDairySales(sales);

            setTodaySaleWeight(summary.weight);
            setTodaySaleAmount(summary.amount);
            setTodayEntries(summary.count);
        } catch (e) {
            console.log(e);
        }
        finally {
            setPageLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#f8fafc"
                barStyle="dark-content"
            />

           {pageLoading ? (

    <View style={{ padding: 20 }}>

        {/* Header Placeholder */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <View
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "#E5E7EB",
                }}
            />

            <View style={{ marginLeft: 14 }}>
                <View
                    style={{
                        width: 160,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: "#E5E7EB",
                    }}
                />

                <View
                    style={{
                        width: 120,
                        height: 14,
                        borderRadius: 6,
                        backgroundColor: "#E5E7EB",
                        marginTop: 8,
                    }}
                />
            </View>
        </View>

        {/* Total Card */}
        <View
            style={{
                height: 110,
                backgroundColor: "#E5E7EB",
                borderRadius: 20,
            }}
        />

        {/* Small Cards */}
        <View style={{ flexDirection: "row", marginTop: 15, gap: 12 }}>
            <View style={{ flex: 1, height: 90, backgroundColor: "#E5E7EB", borderRadius: 16 }} />
            <View style={{ flex: 1, height: 90, backgroundColor: "#E5E7EB", borderRadius: 16 }} />
        </View>

        {/* List */}
        {[1,2,3,4,5].map((item) => (
            <View
                key={item}
                style={{
                    height: 75,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 16,
                    marginTop: 15,
                }}
            />
        ))}

    </View>

) : (

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <View style={styles.header}>

                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon
                                name="arrow-left"
                                size={24}
                                color="#0f172a"
                            />
                        </TouchableOpacity>

                        <View style={{ marginLeft: 14 }}>
                            <Text style={styles.title}>
                                Dairy Sales
                            </Text>

                            <Text style={styles.subtitle}>
                                Today's Dairy Sale Report
                            </Text>
                        </View>

                    </View>

                    {/* <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 15,
    }}
>

    {["Today", "Yesterday", "Week", "Month", "All"].map((item) => (

        <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 25,
                marginRight: 10,
                backgroundColor:
                    filter === item ? "#2563eb" : "#fff",
                elevation: 2,
            }}
        >
            <Text
                style={{
                    color:
                        filter === item ? "#fff" : "#334155",
                    fontWeight: "600",
                }}
            >
                {item}
            </Text>
        </TouchableOpacity>

    ))}

</ScrollView> */}

                    <View style={styles.totalCard}>
                        <Text style={styles.totalTitle}>
                            Today's Sold Milk
                        </Text>

                        <Text style={styles.totalValue}>
                            {todaySaleWeight.toFixed(2)} L
                        </Text>
                    </View>

                    

                    <View style={styles.row}>
                        <View style={styles.smallCard}>
                            <Text style={styles.smallTitle}>
                                Revenue
                            </Text>

                            <Text style={styles.smallValue}>
                                ₹ {todaySaleAmount.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.smallCard}>
                            <Text style={styles.smallTitle}>
                                Entries
                            </Text>

                            <Text style={styles.smallValue}>
                                {todayEntries}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.listHeading}>
                        Today's Dairy Sales
                    </Text>

                    {dairySales.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Icon
                                name="cup-water"
                                size={60}
                                color="#94a3b8"
                            />

                            <Text style={styles.emptyTitle}>
                                No Dairy Sales Today
                            </Text>

                            <Text style={styles.emptySub}>
                                Tap + button to add your first dairy sale.
                            </Text>
                        </View>
                    ) : (
                        dairySales.map((item: any, index) => (
                            <View
                                key={index}
                                style={styles.saleCard}
                            >
                                <View>
                                    <Text style={styles.customerName}>
                                        {item.customerName || "Customer"}
                                    </Text>

                                    <Text style={styles.saleInfo}>
                                        {item.weight} L × ₹{item.rate}
                                    </Text>
                                </View>

                                <Text style={styles.amount}>
                                    ₹{item.amount}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

           {!pageLoading && (
    <TouchableOpacity
        style={styles.fab}
        onPress={() => setSaleModal(true)}
    >
        <Icon
            name="plus"
            size={30}
            color="#fff"
        />
    </TouchableOpacity>
)}

            <Modal
                visible={saleModal}
                transparent
                animationType="slide"
                onRequestClose={() => setSaleModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            Add Dairy Sale
                        </Text>

                        <TextInput
                            placeholder="Customer Name (Optional)"
                            value={customerName}
                            onChangeText={setCustomerName}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Milk Quantity"
                            keyboardType="decimal-pad"
                            value={saleWeight}
                            onChangeText={setSaleWeight}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Rate"
                            keyboardType="decimal-pad"
                            value={saleRate}
                            onChangeText={setSaleRate}
                            style={styles.input}
                        />

                        <View style={styles.totalBox}>
                            <Text style={styles.totalLabel}>
                                Total
                            </Text>

                            <Text style={styles.totalAmount}>
                                ₹ {totalSale.toFixed(2)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={saveSale}
                            disabled={loading}
                        >
                            <Text style={styles.saveText}>
                                {loading ? "Saving..." : "Save Sale"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setSaleModal(false)}
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

export default DairySales;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0f172a",
    },

    subtitle: {
        fontSize: 16,
        color: "#64748b",
        marginTop: 4,
    },

    totalCard: {
        marginHorizontal: 20,
        backgroundColor: "#2563eb",
        borderRadius: 20,
        padding: 22,
        elevation: 5,
    },

    totalTitle: {
        color: "#dbeafe",
        fontSize: 16,
        fontWeight: "600",
    },

    totalValue: {
        color: "#fff",
        fontSize: 34,
        fontWeight: "bold",
        marginTop: 8,
    },

    row: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginTop: 15,
        gap: 12,
    },

    smallCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        elevation: 3,
    },

    smallTitle: {
        color: "#94a3b8",
        fontSize: 14,
        textTransform: "uppercase",
    },

    smallValue: {
        color: "#0f172a",
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 8,
    },

    listHeading: {
        marginTop: 25,
        marginHorizontal: 20,
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 12,
    },

    emptyCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 18,
        paddingVertical: 45,
        alignItems: "center",
        elevation: 2,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#334155",
        marginTop: 16,
    },

    emptySub: {
        fontSize: 15,
        color: "#94a3b8",
        marginTop: 6,
        textAlign: "center",
        paddingHorizontal: 30,
    },

    saleCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
    },

    customerName: {
        fontSize: 19,
        fontWeight: "700",
        color: "#0f172a",
    },

    saleInfo: {
        fontSize: 15,
        color: "#64748b",
        marginTop: 5,
    },

    amount: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#16a34a",
    },

    fab: {
        position: "absolute",
        bottom: 30,
        right: 25,
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
    },

    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.35)",
    },

    modalBox: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },

    modalTitle: {
        fontSize: 22,
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
        marginBottom: 14,
        fontSize: 17,
        color: "#0f172a",
    },

    totalBox: {
        backgroundColor: "#eff6ff",
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
        alignItems: "center",
    },

    totalLabel: {
        fontSize: 18,
        color: "#334155",
        fontWeight: "600",
    },

    totalAmount: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2563eb",
    },

    saveBtn: {
        backgroundColor: "#2563eb",
        height: 52,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },

    saveText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
    },

    cancelBtn: {
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },

    cancelText: {
        color: "#64748b",
        fontWeight: "600",
        fontSize: 17,
    },
});