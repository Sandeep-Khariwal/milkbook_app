import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
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
    name: string;
    buffaloRate: number;
    cowRate: number;
    phoneNumber: string;
    _id: string;
  };
  userType: string;
  findTotalWeight?: (wt: number) => void;
  dataUpdate: () => void;
  setTotalEarn?: (wt: number, amnt: number) => void;
}) => {
  const firm = useSelector((state: any) => state.firm.value);

  const [isLoading, setIsLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [isBuffalo, setIsBuffalo] = useState<boolean>(true);

  const [allEntries, setAllEntries] = useState<any[]>([]);

  const [milkEntry, setMilkEntry] = useState<any>({
    _id: '',
    fat: '',
    weight: '',
    timeZone: '',
    date: new Date(),
  });

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
      if (data.length) {
        const totalWeight = data.reduce((acc: number, curr: any) => {
          acc = acc + curr.weight;
          return acc;
        }, 0);
        const totalAmount = data.reduce((acc: number, curr: any) => {
          acc = acc + curr.amount;
          return acc;
        }, 0);
        props.findTotalWeight && props.findTotalWeight(totalWeight);

        if (fromDate && toDate) {
          props.setTotalEarn(totalWeight, totalAmount);
        }
      }
      setAllEntries(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= TABLE DATA ================= */

const tableHead = [
  'Date & Time',
  'Weight',
  ...(props.userType === 'farmer' ? ['FAT'] : []),
  'Amount',
  ...(firm.role === 'admin' ? ['Action'] : []),
];

const tableData = allEntries.map(ent => [
  // Date + Time together
  `${formatDate(new Date(ent.date))} ${ent.timeZone}`,

  ent.weight,

  // FAT only for farmer
  ...(props.userType === 'farmer' ? [ent.fat] : []),

  // Amount for ALL
  Number(ent.amount).toFixed(2),

  // Action only for admin
  ...(firm.role === 'admin'
    ? [
        <FeIcon
          name="edit"
          size={20}
          color="#5086E7"
          style={{ alignSelf: 'center' }}
          onPress={() => {
            const editEntry = {
              _id: ent._id,
              fat: String(ent.fat),
              weight: String(ent.weight),
              timeZone: ent.timeZone,
              date: new Date(ent.date),
            };
            if(ent.isBuffalo != undefined){
              setIsBuffalo(ent.isBuffalo)
            }
            setMilkEntry(editEntry);
            setOpenEditModal(true);
          }}
        />,
      ]
    : []),
]);




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

    if (Number(milkEntry.fat)) {
      if (isBuffalo) {
        amount =
          (Number(milkEntry.fat) *
            Number(milkEntry.weight) *
            Number(props.customer.buffaloRate)) /
          100;
      } else {
        amount =
          (Number(milkEntry.fat) *
            Number(milkEntry.weight) *
            Number(props.customer.cowRate)) /
          100;
      }
    } else {
      if (isBuffalo) {
        amount = Number(milkEntry.weight) * Number(props.customer.buffaloRate);
      } else {
        amount = Number(milkEntry.weight) * Number(props.customer.cowRate);
      }
    }

    const payload = {
      weight: milkEntry.weight,
      fat: milkEntry.fat,
      rate: isBuffalo
        ? Number(props.customer.buffaloRate)
        : Number(props.customer.cowRate),
      timeZone: milkEntry.timeZone,
      amount: amount,
      customer: props.customer._id,
      firm: firm.id,
      date: milkEntry.date,
      _id: milkEntry._id,
    };


    // return

    await fetch(`${BASE_URL}/entry/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res: any) => {
        const { data } = await res.json();
        setIsLoading(false);

        setMilkEntry({
          _id: '',
          fat: '',
          weight: '',
          amount: 0,
          timeZone: '',
          date: new Date(),
        });
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `Milk Added`,
        });
        getAllEntries(props.userId);
        props.dataUpdate();
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  if (isLoading) return <LoadingOverlay visible />;

  return (
    <ScrollView style={styles.container}>
      {/* ================= FILTER SECTION ================= */}
      <View style={styles.filterRow}>
        {/* FROM DATE */}
        <TouchableOpacity
          style={styles.filterInput}
          onPress={() => setOpenFromDate(true)}
        >
          <TextInput
            editable={false}
            placeholder="From Date"
            value={fromDate?.toDateString() || ''}
            style={styles.textInput}
          />
        </TouchableOpacity>

        {/* TO DATE */}
        <TouchableOpacity
          style={styles.filterInput}
          onPress={() => setOpenToDate(true)}
        >
          <TextInput
            editable={false}
            placeholder="To Date"
            value={toDate?.toDateString() || ''}
            style={styles.textInput}
          />
        </TouchableOpacity>

        {/* SEARCH */}
        <FaIcon
          name="search"
          size={26}
          color="#5086E7"
          onPress={() => getAllEntries(props.userId)}
        />

        {/* CLEAR */}
        <FeIcon
          name="delete"
          size={26}
          color="#5086E7"
          onPress={() => {
            setFromDate(null);
            setToDate(null);
            getAllEntries(props.userId);
            props.dataUpdate();
          }}
        />
      </View>

      {/* FROM DATE MODAL */}
      <Modal visible={openFromDate} transparent animationType="fade">
        <View style={styles.dateModal}>
          <View style={styles.datePickerBox}>
            <DatePicker
              date={fromDate ?? new Date()}
              onDateChange={setFromDate}
            />
            <TouchableOpacity onPress={() => setOpenFromDate(false)}>
              <Text style={styles.doneBtn}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TO DATE MODAL */}
      <Modal visible={openToDate} transparent animationType="fade">
        <View style={styles.dateModal}>
          <View style={styles.datePickerBox}>
            <DatePicker date={toDate ?? new Date()} onDateChange={setToDate} />
            <TouchableOpacity onPress={() => setOpenToDate(false)}>
              <Text style={styles.doneBtn}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= TABLE ================= */}
      <Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
        <Row data={tableHead} style={styles.head} textStyle={styles.text} />

        <View style={{ paddingBottom: 100 }}>
          <Rows data={tableData} textStyle={styles.text} />
        </View>
      </Table>

      {/* ================= EDIT MODAL ================= */}
      <Modal
        visible={openEditModal}
        transparent
        animationType="fade"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
          alignSelf: 'center',
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
              }}
            >
              <Text style={{ color: '#333', fontSize: 24 }}>Edit Milk</Text>
              <FeIcon
                name="x"
                size={26}
                color="#333"
                onPress={() => {
                  setOpenEditModal(false);
                }}
              />
            </View>
            <View style={styles.IconContainer}>
              <TouchableOpacity
                style={[styles.iconWrapper, !isBuffalo && styles.selected]}
                onPress={() => setIsBuffalo(false)}
              >
                <Image
                  source={require('../../assets/cow.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconWrapper, isBuffalo && styles.selected]}
                onPress={() => setIsBuffalo(true)}
              >
                <Image
                  source={require('../../assets/buffalo.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.stockContainer, { height: 50 }]}>
              <View
                style={[
                  styles.inputBox,
                  { width: props.userType !== 'customer' ? '50%' : '95%' },
                ]}
              >
                <TextInput
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={40}
                  onChangeText={text =>
                    setMilkEntry(prev => ({ ...prev, weight: text }))
                  }
                  value={milkEntry.weight}
                  style={styles.textInput}
                  placeholder="Weight"
                />
              </View>
              {props.userType !== 'customer' && (
                <View style={styles.inputBox}>
                  <TextInput
                    editable
                    multiline
                    numberOfLines={4}
                    maxLength={40}
                    onChangeText={text =>
                      setMilkEntry(prev => ({ ...prev, fat: text }))
                    }
                    value={milkEntry.fat}
                    style={styles.textInput}
                    placeholder="Fat"
                  />
                </View>
              )}
            </View>

            <View style={[styles.stockContainer, { height: 50 }]}>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: '#5086E7', width: '95%' },
                ]}
              >
                <TouchableOpacity onPress={EditMilkEntry}>
                  <Text
                    style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}
                  >
                    Edit Milk
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {/* </View> */}
      </Modal>
    </ScrollView>
  );
};

export default EntriesTable;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stockContainer: {
    width: '100%',
    height: 100,
    display: 'flex',
    flexDirection: 'row',
    // gap: 10,
    // margin: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inputBox: {
    width: '45%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#ebeef2',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  textInput: {
    height: 40,
    width:"100%",
    textAlign:"center"
  },

  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  text: {
    padding: 6,
    textAlign: 'center',
    fontSize: 12,
  },

  dateModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
  },
  doneBtn: {
    color: '#5086E7',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },

  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
  },
  saveBtn: {
    backgroundColor: '#5086E7',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    alignItems: 'center',
  },
  IconContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    // alignItems: "center",
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    gap: 10,
    marginLeft: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  selected: {
    borderColor: '#2e86de',
    backgroundColor: '#eaf2ff',
  },
});
