import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../../token/tokenStorage';
import { Table, Row, Rows } from 'react-native-table-component';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';
import { formatDate } from '../../../utility/helperFunctions';
import { useIsFocused } from '@react-navigation/native';

const Home = ({ navigation }) => {
  const firm = useSelector((state: any) => state.firm.value);
  const [allEntries, setAllEntries] = useState<
    {
      name: string;
      userCode: string;
      fat: number;
      weight: number;
      amount: number;
      timeZone: string;
      date: Date;
    }[]
  >([]);
  const [totalWeight, setTotalWeight] = useState<number>(200);
  const [avgFat, setAvgFat] = useState<number>(75);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (firm.subscriptionExp) {
      navigation.navigate('Plans');
    }
    if (firm.id) {
      getTodayEntry(firm.id);
    }
  }, [firm.id, isFocused]);

  const state = {
    tableHead: [
      <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
        Date
      </Text>,
      <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
        Usercode
      </Text>,
      <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
        Name
      </Text>,
      <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
        Wieght
      </Text>,
      <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
        FAT
      </Text>,
      <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
        Amount
      </Text>,
    ],
    tableData: allEntries.map((ent: any, i: number) => {
      return [
        <Text style={{ textAlign: 'center', padding: 3, fontSize: 12 }}>
          {formatDate(new Date(ent.date))} {'\n'} {ent.timeZone}
        </Text>,
        <Text style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>
          {ent.userCode}
        </Text>,
        <Text style={{ textAlign: 'center', padding: 3, fontSize: 12 }}>
          {ent.name}
        </Text>,
        <Text style={{ textAlign: 'center', padding: 3, fontSize: 12 }}>
          {ent.weight}
        </Text>,
        <Text style={{ textAlign: 'center', padding: 3, fontSize: 12 }}>
          {ent.fat}
        </Text>,
        <Text style={{ textAlign: 'center', padding: 3, fontSize: 12 }}>
          {Number(ent.amount).toFixed(2)}
        </Text>,
      ];
    }),
  };

  const getTodayEntry = async (id: string) => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/entry/all/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { data } = await res.json();

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

        const todayTotalWeight = filteredData.reduce(
          (acc: number, curr: any) => {
            acc += curr.weight;
            return acc;
          },
          0,
        );
        setTotalWeight(todayTotalWeight);

        // find cream
        const todayTotalCream = filteredData.reduce(
          (acc: number, curr: any) => {
            let cream = curr.fat * curr.weight;
            acc += cream;
            return acc;
          },
          0,
        );

        const todayAvgFat = todayTotalCream / todayTotalWeight;
        if (todayAvgFat) {
          setAvgFat(Number(todayAvgFat.toFixed(2)) ?? 0);
        } else {
          setAvgFat(0);
        }
        setIsLoading(false);
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };
  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        <View style={styles.totalWeight}>
          <Text style={styles.cardText}>Total Weight</Text>
          <Text style={{ ...styles.cardText, fontSize: 18, fontWeight: 700 }}>
            {totalWeight.toFixed(2)}L
          </Text>
        </View>
        <View style={styles.avgFat}>
          <Text style={styles.cardText2}>Average Fat</Text>
          <Text style={{ ...styles.cardText2, fontSize: 18, fontWeight: 700 }}>
            {Number(avgFat)}%
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Table borderStyle={{ borderWidth: 2, borderColor: '#81bce6ff' }}>
          <Row
            data={state.tableHead}
            style={styles.head}
            textStyle={styles.text}
          />
          <Rows data={state.tableData} textStyle={styles.text} />
        </Table>
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    textAlign: 'center',
    fontFamily: 'sans-serif',
    marginTop: 10,
  },
  head: { height: 40, backgroundColor: '#9fc8e6ff' },
  text: { margin: 6, backgroundColor: '#fff' },
  tData: { backgroundColor: '#fff' },
  cardsContainer: {
    width: '100%',
    padding: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  totalWeight: {
    width: '45%',
    height: 60,
    backgroundColor: '#9fc8e6ff',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#81bce6ff',
    padding: 4,
    display: 'flex',
    gap: 5,
  },
  cardText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1271b6ff',
    fontWeight: 400,
  },
  avgFat: {
    width: '45%',
    height: 60,
    backgroundColor: '#F2C6A0',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#F2C6A0',
    padding: 4,
    display: 'flex',
    gap: 5,
  },
  cardText2: {
    fontSize: 14,
    textAlign: 'center',
    color: '#da7a26ff',
    fontWeight: 400,
  },
  earnings: {
    width: '30%',
    height: 60,
    backgroundColor: '#8FB8A8',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8FB8A8',
    padding: 4,
    display: 'flex',
    gap: 5,
  },
  cardText3: {
    fontSize: 14,
    textAlign: 'center',
    color: '#29664fff',
    fontWeight: 400,
  },
});
