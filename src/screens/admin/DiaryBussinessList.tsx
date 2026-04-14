import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { BASE_URL } from '../../../token/tokenStorage';
import { useIsFocused } from '@react-navigation/native';

type DairyBusiness = {
  _id: string;
  name: string;
  phoneNumber: string;
  subscriptionExp: string;
};

type Props = {
  data: DairyBusiness[];
  onPressItem?: (item: DairyBusiness) => void;
};

const DairyBusinessList: React.FC<Props> = () => {
  const isFocused = useIsFocused();
  const [data, setData] = useState<
    {
      _id: string;
      name: string;
      phoneNumber: string;
      subscriptionExp: string;
    }[]
  >([]);

  console.log('data : ', data);

  useEffect(() => {
    getAllBusiness();
  }, [isFocused]);

  const getAllBusiness = async () => {
    await fetch(`${BASE_URL}/firm/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const resp = await res.json();
        const formatted = resp.firms.map((frm: any) => {
          return {
            _id: frm._id,
            name: frm.name,
            phoneNumber: frm.admin.phoneNumber,
            subscriptionExp: frm.subscriptionExp,
          };
        });
        console.log('formatted : ', formatted);
        setData(formatted);
      })
      .catch((e: any) => {
        console.log(e);
      });
  };
  const isExpired = (date: string) => {
    return new Date() > new Date(date);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: DairyBusiness }) => {
    const expired = isExpired(item.subscriptionExp);

    return (
      <TouchableOpacity
        style={styles.card}
        // onPress={() => onPressItem?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: expired ? '#FF4D4F' : '#4CAF50' },
            ]}
          >
            <Text style={styles.statusText}>
              {expired ? 'Expired' : 'Active'}
            </Text>
          </View>
        </View>

        <Text style={styles.phone}>📞 {item.phoneNumber}</Text>

        <View style={styles.footer}>
          <Text style={styles.label}>Expiry Date:</Text>
          <Text
            style={[styles.expiry, { color: expired ? '#FF4D4F' : '#333' }]}
          >
            {formatDate(item.subscriptionExp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default DairyBusinessList;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#F4F7FF',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6ECFF',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  phone: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },

  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: '#888',
  },

  expiry: {
    fontSize: 14,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
