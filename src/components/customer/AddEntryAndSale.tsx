import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../token/tokenStorage';
import FeIcon from 'react-native-vector-icons/Feather';
import { SelectList } from 'react-native-dropdown-select-list';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import DatePicker from 'react-native-date-picker';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const AddEntryAndSale = (props: {
  customer: {
    _id: string;
    name: string;
    buffaloRate: number;
    cowRate: number;
    phoneNumber: string;
    cowMilk?: { activeCowMilk: boolean; fatAmount: boolean; snfAmount: boolean; };
    buffaloMilk?: { activeBuffaloMilk: boolean; fatAmount: boolean; snfAmount: boolean; };
  };
  userType: string;
  dataUpdate: () => void;
}) => {
  const firm = useSelector((state: any) => state.firm.value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bottomSheetAdd, setBottomSheetAdd] = useState<boolean>(false);
  const [bottomSheetSale, setBottomSheetSale] = useState<boolean>(false);

  const [milkEntry, setMilkEntry] = useState({ fat: '', clr: '', weight: '', timeZone: '', _id: '' });
  const [stocks, setStocks] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const [isBuffalo, setIsBuffalo] = useState<boolean>(true);
  const clickedRef = useRef<any>(0);

  useEffect(() => {
    const hours = date.getHours();
    setMilkEntry(prev => ({ ...prev, timeZone: hours < 12 ? 'Morning' : 'Evening' }));
  }, [date]);

  useEffect(() => {
    if (props.customer.buffaloMilk?.activeBuffaloMilk) setIsBuffalo(true);
    else if (props.customer.cowMilk?.activeCowMilk) setIsBuffalo(false);
  }, [props.customer]);

  useEffect(() => { getAllItems(); }, []);

  const getAllItems = async () => {
    try {
      const res = await fetch(`${BASE_URL}/firm/stocks/${firm.id}`);
      const data = await res.json();
      setStocks(data.stocks || []);
    } catch (e) { console.log(e); }
  };

  const activeMilkConfig = isBuffalo ? props.customer.buffaloMilk : props.customer.cowMilk;

  const addEntry = async () => {
    console.log("clickedRef.current : ",clickedRef.current);
    
    if(clickedRef.current){
      return
    }
    clickedRef.current += 1;
    if (!milkEntry.weight) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Warning', textBody: `Weight is required!` });
      clickedRef.current = 0;
      return;
    }
    if (activeMilkConfig?.snfAmount && (!milkEntry.fat || !milkEntry.clr)) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Warning', textBody: `Fat and CLR are required!` });
      clickedRef.current = 0;
      return;
    }

    setIsLoading(true);
    let amount = 0;
    let calculatedSnf = 0;
    const rate = isBuffalo ? props.customer.buffaloRate : props.customer.cowRate;
    const fatVal = Number(milkEntry.fat) || 0;
    const clrVal = Number(milkEntry.clr) || 0;
    const weightVal = Number(milkEntry.weight) || 0;
    const rateVal = Number(rate) || 0;

    if (activeMilkConfig?.snfAmount) {
      calculatedSnf = (clrVal / 4) + (0.21 * fatVal) + 0.36;
      amount = (calculatedSnf * weightVal * rateVal) / 100;
    } else if (activeMilkConfig?.fatAmount && milkEntry.fat) {
      amount = (fatVal * weightVal * rateVal) / 100;
    } else {
      amount = weightVal * rateVal;
    }

    const payload = {
      weight: milkEntry.weight,
      fat: fatVal,
      clr: clrVal,
      snf: Number(calculatedSnf.toFixed(2)),
      rate: rateVal,
      timeZone: milkEntry.timeZone === 'Morning' ? 'M' : 'E',
      amount: Number(amount.toFixed(2)),
      customer: props.customer._id,
      firm: firm.id,
      date: new Date(date),
      isBuffalo,
    };

    try {
      await fetch(`${BASE_URL}/entry/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setBottomSheetAdd(false);
      setMilkEntry({ fat: '', clr: '', weight: '', timeZone: '', _id: '' });
      Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Success', textBody: `Milk Added` });
      props.dataUpdate();
      clickedRef.current = 0;
    } catch (e) { console.log(e); } finally { setIsLoading(false); clickedRef.current = 0; }
  };

  const saleProduct = async () => {
    if (!selectedQuantity || !selected) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Warning', textBody: `All Fields Required!` });
      return;
    }
    setIsLoading(true);
    const selectedStock = stocks.find(stock => stock._id === selected);
    const amount = Number(selectedQuantity) * (selectedStock?.price ?? 0);

    const payload = {
      firm: firm.id,
      stockId: selected,
      quantity: Number(selectedQuantity),
      amount,
      user: props.customer._id,
      userType: props.userType,
      productName: selectedStock.item,
      date: saleDate,
    };

    try {
      await fetch(`${BASE_URL}/history/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setBottomSheetSale(false);
      Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Success', textBody: `Product Sold` });
      props.dataUpdate();
    } catch (e) { console.log(e); } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.minBtn} onPress={() => setBottomSheetAdd(true)}>
        <FeIcon name="plus-circle" size={18} color="#FFF" />
        <Text style={styles.minBtnText}>Add Milk</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.minBtn, styles.saleBtn]} onPress={() => setBottomSheetSale(true)}>
        <FeIcon name="shopping-bag" size={18} color="#10B981" />
        <Text style={[styles.minBtnText, { color: '#10B981' }]}>Sale</Text>
      </TouchableOpacity>

      {/* --- ADD MILK MODAL --- */}
      <Modal animationType="slide" transparent visible={bottomSheetAdd}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled" scrollEnabled={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Entry ({milkEntry.timeZone})</Text>
                <TouchableOpacity onPress={() => setBottomSheetAdd(false)}><FeIcon name="x-circle" size={28} color="#999" /></TouchableOpacity>
              </View>

              <View style={styles.animalSelector}>
                {props.customer.buffaloMilk?.activeBuffaloMilk && (
                  <TouchableOpacity style={[styles.animalCard, isBuffalo && styles.animalSelected]} onPress={() => setIsBuffalo(true)}>
                    <Image source={require('../../assets/buffalo.png')} style={styles.animalIcon} />
                    <Text style={[styles.animalText, isBuffalo && styles.animalTextActive]}>Buffalo</Text>
                  </TouchableOpacity>
                )}
                {props.customer.cowMilk?.activeCowMilk && (
                  <TouchableOpacity style={[styles.animalCard, !isBuffalo && styles.animalSelected]} onPress={() => setIsBuffalo(false)}>
                    <Image source={require('../../assets/cow.png')} style={styles.animalIcon} />
                    <Text style={[styles.animalText, !isBuffalo && styles.animalTextActive]}>Cow</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="0.0" value={milkEntry.weight} onChangeText={t => setMilkEntry(p => ({ ...p, weight: t }))} />
                </View>
                {(activeMilkConfig?.fatAmount || activeMilkConfig?.snfAmount) && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Fat (%)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0.0" value={milkEntry.fat} onChangeText={t => setMilkEntry(p => ({ ...p, fat: t }))} />
                  </View>
                )}
                {activeMilkConfig?.snfAmount && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>CLR</Text>
                        <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={milkEntry.clr} onChangeText={t => setMilkEntry(p => ({ ...p, clr: t }))} />
                    </View>
                )}
              </View>

              <TouchableOpacity style={styles.dateSelector} onPress={() => setOpen(true)}>
                <FeIcon name="calendar" size={20} color="#5086E7" />
                <Text style={styles.dateSelectorText}>{date.toLocaleString()}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={addEntry}><Text style={styles.submitBtnText}>Confirm Entry</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- SALE MODAL --- */}
      <Modal animationType="slide" transparent visible={bottomSheetSale}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sale Product</Text>
                <TouchableOpacity onPress={() => setBottomSheetSale(false)}><FeIcon name="x-circle" size={28} color="#999" /></TouchableOpacity>
             </View>
             <SelectList setSelected={(val: string) => setSelected(val)} data={stocks.map((stk: any) => ({ key: stk._id, value: stk.item }))} save="key" boxStyles={styles.dropdownBox} placeholder="Select Stock" />
             <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="Enter quantity" value={selectedQuantity} onChangeText={setSelectedQuantity} />
             </View>
             <TouchableOpacity style={[styles.dateSelector, { marginTop: 15 }]} onPress={() => setOpen(true)}><FeIcon name="calendar" size={20} color="#5086E7" /><Text style={styles.dateSelectorText}>{saleDate.toDateString()}</Text></TouchableOpacity>
             <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#5086E7' }]} onPress={saleProduct}><Text style={styles.submitBtnText}>Complete Sale</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DatePicker modal open={open} date={bottomSheetAdd ? date : saleDate} onConfirm={d => { setOpen(false); bottomSheetAdd ? setDate(d) : setSaleDate(d); }} onCancel={() => setOpen(false)} />
      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 18, marginTop: 12, gap: 12 },
  minBtn: { flex: 1, backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saleBtn: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#10B981' },
  minBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#333' },
  label: { fontSize: 14, color: '#555', marginBottom: 8, fontWeight: '600' },
  animalSelector: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  animalCard: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 15, borderWidth: 1.5, borderColor: '#eee' },
  animalSelected: { borderColor: '#5086E7', backgroundColor: '#eaf2ff' },
  animalIcon: { width: 45, height: 45, marginBottom: 5, resizeMode: 'contain' },
  animalText: { fontSize: 13, color: '#999', fontWeight: 'bold' },
  animalTextActive: { color: '#5086E7' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  inputContainer: { flex: 1 },
  input: { backgroundColor: '#F3F6F9', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#E8ECF0' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4ff', padding: 12, borderRadius: 12, gap: 10, marginBottom: 20 },
  dateSelectorText: { color: '#5086E7', fontWeight: '600' },
  submitBtn: { backgroundColor: '#2ecc71', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  dropdownBox: { borderRadius: 12, borderColor: '#E8ECF0', backgroundColor: '#F3F6F9' },
});

export default AddEntryAndSale;