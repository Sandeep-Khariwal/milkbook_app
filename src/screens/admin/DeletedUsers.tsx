import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import MaIcon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../../token/tokenStorage';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import FaIcon from 'react-native-vector-icons/Ionicons';
import LoadingOverlay from '../../HelperFunction/LoadingOverlay';

const DeletedUsers = () => {
  const [query, setQuery] = useState<string>('');
  const firm = useSelector((state: any) => state.firm.value);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allCustomer, setAllCustomer] = useState<
    {
      name: string;
      cowRate: string;
      buffaloRate: string;
      userCode: string;
      phoneNumber: string;
      _id: string;
    }[]
  >([]);
  const [allShowCustomer, setAllShowCustomer] = useState<
    {
      name: string;
      cowRate: string;
      buffaloRate: string;
      userCode: string;
      phoneNumber: string;
      _id: string;
    }[]
  >([]);

  useEffect(() => {
    getCustomers();
  }, []);
  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }
  const getCustomers = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/getDeletedUser/${firm.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res: any) => {
        const { users } = await res.json();
        const filterdUsers = users.map((u: any) => {
          return {
            ...u,
            cowRate: String(u.cowRate),
            buffaloRate: String(u.buffaloRate),
          };
        });
        setAllCustomer(filterdUsers);
        setAllShowCustomer(filterdUsers);
        setIsLoading(false);
      })
      .catch((e: any) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const filterCustomer = () => {
    if (!query) {
      setAllShowCustomer(allCustomer);
    } else {
      const filteredData = allShowCustomer.filter(
        (cust: any) =>
          String(cust.name)
            .toLocaleLowerCase()
            .includes(String(query).toLocaleLowerCase()) ||
          String(cust.userCode)
            .toLocaleLowerCase()
            .includes(String(query).toLocaleLowerCase()),
      );
      setAllShowCustomer(filteredData);
    }
  };

  const restoreUser = async (id: string) => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/restore/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res: any) => {
        setIsLoading(false);
        getCustomers();
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View
        style={{
          width: '100%',
          padding: 10,
          marginTop: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{ ...styles.inputBox, width: '90%', backgroundColor: '#fff' }}
        >
          <TextInput
            editable
            multiline
            maxLength={40}
            onChangeText={text => setQuery(text)}
            value={query}
            style={styles.textInput}
            placeholder="Search customer..."
          />
        </View>
        <FaIcon name="search" size={30} onPress={filterCustomer} />
      </View>
      <View style={styles.stocksContainer}>
        {allShowCustomer.length > 0 ? (
          allShowCustomer.map((customer: any, index: number) => (
            <View key={customer._id ?? index} style={styles.cardContainer}>
              <View style={styles.cardOne}>
                <Text
                  style={{ fontSize: 17, fontWeight: 700, color: '#5086E7' }}
                >
                  {customer.name} ({customer.userCode})
                </Text>
              </View>
              <View style={styles.cardTwo}>
                <MaIcon
                  name="restore"
                  size={26}
                  color="#333"
                  onPress={() => {
                    restoreUser(customer._id);
                  }}
                />
              </View>
            </View>
          ))
        ) : (
          <View
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: '#8e8e98ff' }}>
              No Users Deleted yet
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DeletedUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stocksContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
  },
  cardContainer: {
    width: '95%',
    backgroundColor: '#fff',
    height: 60,
    marginTop: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e7eeff',
    display: 'flex',
    flexDirection: 'row',
  },
  cardOne: {
    width: '50%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  cardTwo: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingRight: 10,
  },
  contentContainer: {
    height: 300,
    padding: 36,
    alignItems: 'center',
  },
  ButtonBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    position: 'absolute',
    top: '90%',
    width: '90%',
  },
  button: {
    width: '90%',
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#5086E7',
    backgroundColor: '#5086E7',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  stockContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  inputBox: {
    width: '50%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
  },
  textInput: {
    padding: 10,
  },
  formBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  deletebutton: {
    width: '40%',
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#5086E7',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  deletebuttonYes: {
    width: '40%',
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#5086E7',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
