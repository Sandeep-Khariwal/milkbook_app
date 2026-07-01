import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import DatePicker from 'react-native-date-picker';
import FeIcon from 'react-native-vector-icons/Feather';
import FaIcon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import { BASE_URL } from '../../../token/tokenStorage';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { formatDate } from '../../../utility/helperFunctions';

const EntriesTable = (props: {
  userId: string;
  isCustomer: boolean;
  customer: {
    _id: string;
    name: string;
    buffaloRate: number;
    cowRate: number;
    phoneNumber: string;
  };
  userType: string;
  findTotalWeight?: (
    wt: number,
    buffaloTotalWeight: number,
    cowTotalWeight: number,
    buffaloTotalAmount?: number,
    cowTotalAmount?: number,
  ) => void;
  dataUpdate: () => void;
  setTotalEarn?: (wt: number, amnt: number) => void;
  onContentReady?: () => void;
}) => {
  const firm = useSelector((state: any) => state.firm.value);

  const [isLoading, setIsLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [isBuffalo, setIsBuffalo] = useState<boolean>(true);
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const [allEntries, setAllEntries] = useState<any[]>([]);

  // Additional states for rendering local filtered separate amounts
  const [buffaloAmount, setBuffaloAmount] = useState<number>(0);
  const [cowAmount, setCowAmount] = useState<number>(0);
  const [buffaloWeight, setBuffaloWeight] = useState<number>(0);
  const [cowWeight, setCowWeight] = useState<number>(0);

  const [milkEntry, setMilkEntry] = useState<any>({
    _id: '',
    fat: '',
    weight: '',
    timeZone: '',
    date: new Date()
  });

  useEffect(() => {
    if (allEntries.length > 0 && props.onContentReady) {
      setTimeout(() => {
        props.onContentReady();
      }, 200);
    }
  }, [allEntries]);

  useEffect(() => {
    if (date) {
      const nowDate = new Date(date);
      const hours = nowDate.getHours();
      const timeOfDay = hours < 12 ? 'M' : 'E';
      setMilkEntry(prev => ({ ...prev, timeZone: timeOfDay }));
    }
  }, [date]);

  useEffect(() => {
    if (props.userId) {
      getAllEntries(props.userId);
    }
  }, [props.userId]);

  const getAllEntries = async (id: string) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        ...(fromDate ? { fromDate: fromDate.toISOString() } : {}),
        ...(toDate ? { toDate: toDate.toISOString() } : {}),
        userType: firm.role,
      }).toString();

      const res = await fetch(`${BASE_URL}/entry/${id}?${query}`);
      const { data } = await res.json();

      if (data && data.length) {
        let bWeight = 0;
        let cWeight = 0;
        let bAmount = 0;
        let cAmount = 0;

        data.forEach(item => {
          if (item.isBuffalo) {
            bWeight += Number(item.weight || 0);
            bAmount += Number(item.amount || 0);
          } else {
            cWeight += Number(item.weight || 0);
            cAmount += Number(item.amount || 0);
          }
        });

        setBuffaloWeight(bWeight);
        setCowWeight(cWeight);
        setBuffaloAmount(bAmount);
        setCowAmount(cAmount);

        const totalWeight = data.reduce(
          (acc: number, curr: any) => acc + Number(curr.weight || 0),
          0,
        );
        const totalAmount = data.reduce(
          (acc: number, curr: any) => acc + Number(curr.amount || 0),
          0,
        );

        if (props.findTotalWeight) {
          props.findTotalWeight(
            totalWeight,
            bWeight,
            cWeight,
            bAmount,
            cAmount,
          );
        }

        if (fromDate && toDate && props.setTotalEarn) {
          props.setTotalEarn(totalWeight, totalAmount);
        }
      } else {
        setBuffaloWeight(0);
        setCowWeight(0);
        setBuffaloAmount(0);
        setCowAmount(0);
      }
      setAllEntries(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const EditMilkEntry = async () => {
    setOpenEditModal(false);
    if (!milkEntry.weight) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: `All Fields Required!`,
      });
      return;
    }
    let amount;
    const rate = isBuffalo
      ? Number(props.customer.buffaloRate)
      : Number(props.customer.cowRate);

    if (Number(milkEntry.fat)) {
      amount = (Number(milkEntry.fat) * Number(milkEntry.weight) * rate) / 100;
    } else {
      amount = Number(milkEntry.weight) * rate;
    }

    const payload = {
      weight: milkEntry.weight,
      fat: milkEntry.fat,
      rate,
      timeZone: milkEntry.timeZone,
      amount,
      customer: props.customer._id,
      firm: firm.id,
      date: new Date(date),
      _id: milkEntry._id,
      isBuffalo,
    };

    try {
      const res = await fetch(`${BASE_URL}/entry/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await res.json();
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: `Milk Updated Successfully`,
      });
      getAllEntries(props.userId);
      props.dataUpdate();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const tableHead = [
    'Date & Time',
    'Animal',
    'Qty',
    ...(props.userType === 'farmer' ? ['FAT'] : []),
    'Amount',
    ...(firm.role === 'admin' ? ['Edit'] : []),
  ];

  const tableData = allEntries.map(ent => {
    const entryDate = new Date(ent.date);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - entryDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    const isEditable = dayDifference <= 20;

    return [
      `${formatDate(ent.date)} ${ent.timeZone}`,
      ent.isBuffalo ? 'BF' : 'CW',
      ent.weight,
      ...(props.userType === 'farmer' ? [ent.fat] : []),
      <View style={styles.amountContainer}>
        <Text style={styles.rowText}>₹{Number(ent.amount).toFixed(2)}</Text>
        {ent.isEdited && <Text style={styles.editedText}>edited</Text>}
      </View>,
      ...(firm.role === 'admin'
        ? [
            <TouchableOpacity
              disabled={!isEditable}
              onPress={() => {
                const editEntry = {
                  _id: ent._id,
                  fat: String(ent.fat),
                  weight: String(ent.weight),
                  timeZone: ent.timeZone,
                  date: ent.date
                };
                setIsBuffalo(ent.isBuffalo);
                setMilkEntry(editEntry);
                setDate(new Date(editEntry.date));
                setOpenEditModal(true);
              }}
              style={!isEditable && styles.disabledTouch}
            >
              <FeIcon
                name="edit-3"
                size={18}
                color={isEditable ? "#5086E7" : "#CBD5E1"}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>,
          ]
        : []),
    ];
  });

  if (isLoading) return <LoadingOverlay visible />;

  return (
    <View style={styles.container}>
      {/* FILTER SECTION */}
      <View style={styles.filterCard}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterInput}
            onPress={() => {
              setOpenFromDate(true);
              setFromDate(new Date());
            }}
          >
            <FeIcon name="calendar" size={14} color="#666" />
            <Text style={styles.filterText}>
              {fromDate ? formatDate(fromDate) : 'From'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterInput}
            onPress={() => {
              setOpenToDate(true);
              setToDate(new Date());
            }}
          >
            <FeIcon name="calendar" size={14} color="#666" />
            <Text style={styles.filterText}>
              {toDate ? formatDate(toDate) : 'To'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => getAllEntries(props.userId)}
          >
            <FaIcon name="search" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setFromDate(null);
              setToDate(null);
              getAllEntries(props.userId);
            }}
          >
            <FeIcon name="refresh-cw" size={20} color="#5086E7" />
          </TouchableOpacity>
        </View>

        {/* METRICS DISPLAYER SECTION FOR SEPARATE WEIGHTS AND AMOUNTS */}
        {/* {allEntries.length > 0 && (
          <View style={styles.statSplitWrapper}>
            <View style={[styles.statSplitBox, styles.buffaloBorder]}>
              <Text style={styles.statSplitHeader}>Buffalo (BF)</Text>
              <Text style={styles.statSplitSub}>Weight: <Text style={styles.boldText}>{buffaloWeight.toFixed(2)} kg</Text></Text>
              <Text style={styles.statSplitSub}>Amount: <Text style={styles.boldText}>₹{buffaloAmount.toFixed(2)}</Text></Text>
            </View>
            <View style={[styles.statSplitBox, styles.cowBorder]}>
              <Text style={styles.statSplitHeader}>Cow (CW)</Text>
              <Text style={styles.statSplitSub}>Weight: <Text style={styles.boldText}>{cowWeight.toFixed(2)} kg</Text></Text>
              <Text style={styles.statSplitSub}>Amount: <Text style={styles.boldText}>₹{cowAmount.toFixed(2)}</Text></Text>
            </View>
          </View>
        )} */}
      </View>

      {/* TABLE */}
      <View style={styles.tableWrapper}>
        <Table borderStyle={{ borderWidth: 0 }}>
          <Row
            data={tableHead}
            style={styles.head}
            textStyle={styles.headText}
          />
          <Rows
            data={tableData}
            style={styles.rowStyle}
            textStyle={styles.rowText}
          />
        </Table>
      </View>

      {/* DATE MODALS */}
      <DatePickerModal
        visible={openFromDate}
        date={fromDate ?? new Date()}
        onDateChange={setFromDate}
        onClose={() => setOpenFromDate(false)}
      />
      <DatePickerModal
        visible={openToDate}
        date={toDate ?? new Date()}
        onDateChange={setToDate}
        onClose={() => setOpenToDate(false)}
      />

      {/* EDIT MODAL */}
      <Modal visible={openEditModal} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Entry</Text>
              <TouchableOpacity onPress={() => setOpenEditModal(false)}>
                <FeIcon name="x-circle" size={24} color="#ff5e5e" />
              </TouchableOpacity>
            </View>

            <View style={styles.animalSelector}>
              <TouchableOpacity
                style={[styles.animalBtn, isBuffalo && styles.selectedBtn]}
                onPress={() => setIsBuffalo(true)}
              >
                <Image
                  source={require('../../assets/buffalo.png')}
                  style={styles.animalIcon}
                />
                <Text
                  style={[
                    styles.animalLabel,
                    isBuffalo && styles.selectedLabel,
                  ]}
                >
                  Buffalo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.animalBtn, !isBuffalo && styles.selectedBtn]}
                onPress={() => setIsBuffalo(false)}
              >
                <Image
                  source={require('../../assets/cow.png')}
                  style={styles.animalIcon}
                />
                <Text
                  style={[
                    styles.animalLabel,
                    !isBuffalo && styles.selectedLabel,
                  ]}
                >
                  Cow
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.modalInputBox}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={milkEntry.weight}
                  onChangeText={t => setMilkEntry(p => ({ ...p, weight: t }))}
                  style={styles.modalInput}
                  placeholder="0.0"
                />
              </View>
              {props.userType !== 'customer' && (
                <View style={styles.modalInputBox}>
                  <Text style={styles.inputLabel}>Fat %</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={milkEntry.fat}
                    onChangeText={t => setMilkEntry(p => ({ ...p, fat: t }))}
                    style={styles.modalInput}
                    placeholder="0.0"
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setOpen(true)}
            >
              <FeIcon name="clock" size={18} color="#5086E7" />
              <Text style={styles.dateSelectorText}>
                {date.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveActionBtn}
              onPress={EditMilkEntry}
            >
              <Text style={styles.saveActionText}>Update Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* INNER DATE PICKER */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.datePickerBox}>
            <DatePicker date={date} onDateChange={setDate} mode="datetime" />
            <TouchableOpacity
              style={styles.doneActionBtn}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.doneActionText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DatePickerModal = ({ visible, date, onDateChange, onClose }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.centeredView}>
      <View style={styles.datePickerBox}>
        <DatePicker date={date} onDateChange={onDateChange} mode="date" />
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.doneBtn}>Set Date</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filterCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 15,
    elevation: 4,
  },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    gap: 5,
  },
  filterText: { color: '#475569', fontSize: 13, fontWeight: '500' },
  searchBtn: { backgroundColor: '#5086E7', padding: 10, borderRadius: 10 },
  clearBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editedText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: 'bold',
    marginTop: 2,
  },
  statSplitWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  statSplitBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
  },
  buffaloBorder: { borderLeftColor: '#8B5CF6' },
  cowBorder: { borderLeftColor: '#F59E0B' },
  statSplitHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statSplitSub: {
    fontSize: 11,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '600',
    color: '#334155',
  },
  tableWrapper: {
    marginHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  head: { height: 48, backgroundColor: '#5086E7' },
  headText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  rowStyle: { height: 50, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowText: {
    textAlign: 'center',
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  animalSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  animalBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 100,
  },
  selectedBtn: { borderColor: '#5086E7', backgroundColor: '#EFF6FF' },
  animalIcon: { width: 50, height: 50, resizeMode: 'contain' },
  animalLabel: { fontSize: 12, marginTop: 5, color: '#64748B' },
  selectedLabel: { color: '#5086E7', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  modalInputBox: { flex: 1 },
  inputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 5,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#1E293B',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  dateSelectorText: { color: '#475569', fontWeight: '500' },
  saveActionBtn: {
    backgroundColor: '#5086E7',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  saveActionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  datePickerBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  doneBtn: {
    color: '#5086E7',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  doneActionBtn: {
    backgroundColor: '#5086E7',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  doneActionText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  disabledTouch: {
    opacity: 0.6,
  },
});

export default EntriesTable;