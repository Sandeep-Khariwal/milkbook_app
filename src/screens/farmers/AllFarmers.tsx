import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { deleteToken } from '../../../token/tokenStorage';
import { setFirmDetails } from '../../../redux/slices/firmSlice';
import Farmers from '../admin/Farmer';

const AllFarmers = () => {
  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();

  const Logout = async () => {
    await deleteToken();
    const firmData = {
      name: '',
      id: '',
      role: '',
    };
    dispatch(setFirmDetails(firmData));
  };

  return (
    <View style={{ flex: 1 }}>
      <Farmers />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogout}
        onRequestClose={() => {}}
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
            <Text
              style={{
                fontSize: 18,
                color: '#727276ff',
                textAlign: 'center',
              }}
            >
              Are you sure?. you want to logout
            </Text>

            <View style={styles.formBox}>
              <TouchableOpacity
                style={styles.deletebutton}
                onPress={() => setShowLogout(false)}
              >
                <Text style={{ color: '#5086E7' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deletebuttonYes} onPress={Logout}>
                <Text style={{ color: '#fff' }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AllFarmers;

const styles = StyleSheet.create({
  heroContainer: {
    height: '15%',
    width: '100%',
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#5086E7',
    paddingTop: 20,
  },
  milkFarmText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 500,
    fontFamily: 'sans-serif',
  },
  inputBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 7,
    height: 40,
    fontWeight: '700',
  },
  textInput: {
    padding: 10,
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
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
});
