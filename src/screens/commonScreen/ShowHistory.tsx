import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../../token/tokenStorage';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const ShowHistory = ({ route }: { route: any }) => {
  const customerId = route.params.customerId;
  const firmId = route.params.firmId;
  const userType = route.params.userType;
  const isCustomer = userType === 'customer';
  const isFarmer = userType === 'farmer';
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // console.log('userType in history : ', userType);

  const [allHistory, setAllHistory] = useState<
    {
      _id: string;
      user: { name: string };
      firm: string;
      productName: string;
      description: string;
      amount: number;
      quantity: number;
      createdAt: string;
    }[]
  >([]);

  console.log("allHistory : ",allHistory);
  
  

  useEffect(() => {
    if (firmId) {
      getAllHistory(firmId);
      setIsLoading(true);
    }
    if (customerId) {
      getUserHistory(customerId);
      setIsLoading(true);
    }
  }, [firmId, customerId]);

  const getAllHistory = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/history/all/${id}`);
      const { data } = await res.json();
 console.log("allHistory data : ",data);
      setAllHistory(data);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };
  const getUserHistory = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/history/user/${id}`);
      const { data } = await res.json();
      setAllHistory(data);

      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Text style={styles.productName}>{item.productName}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.user?.name || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{item.quantity}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>

          <Text
            style={[
              styles.value,
              {
                color: isFarmer || item.amount < 0 ? 'red' : 'green',
              },
            ]}
          >
            ₹ {isFarmer || item.amount < 0 ? '-' : '+'}
            {Math.abs(item.amount)}
          </Text>
        </View>

        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={styles.row}>
          <Text style={styles.value}>{item.description}</Text>
          {/* <Text style={[styles.value,{color:item.amount>0?"green":"red"}]}></Text> */}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <LoadingOverlay visible={isLoading} />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.heroContainer}>
        <TouchableOpacity
          style={styles.backBox}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={32} color="#FFF" />
          <Text style={styles.historyText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>History</Text>
      </View>

      {/* History List */}
      <FlatList
        data={allHistory}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history found</Text>
        }
      />
    </View>
  );
};

export default ShowHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  heroContainer: {
    width: '100%',
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    alignItems: 'center',
    backgroundColor: '#5086E7',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backBox: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  historyText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: '600',
    marginTop: 10,
  },

  /* Card styles */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: '500',
  },
  date: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});
