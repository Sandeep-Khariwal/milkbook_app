import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { deleteToken } from "../../../token/tokenStorage";
import { setFirmDetails } from "../../../redux/slices/firmSlice";
import Farmers from "../admin/Farmer";


const AllFarmers = () => {
  const distributer = useSelector((state: any) => state.distributer.value);
  const firm = useSelector((state: any) => state.firm.value);
  console.log('distributer : ', distributer);
  const [showLogout, setShowLogout] = useState<boolean>(false);
  const dispatch = useDispatch();

  const Logout = async () => {
    // bottomSheetRef.current?.close();
    await deleteToken();
    const firmData = {
      name: '',
      id: '',
      role: '',
    };
    dispatch(setFirmDetails(firmData));
    // navigation.navigate("auth")
  };

  return (
    <View style={{ flex: 1 }}>
      {/* <View style={{width:"100%",padding:10, display:"flex",flexDirection:"row",alignItems:"center",gap:10}} >
        <View style={styles.inputBox}>
          <TextInput
            editable
            multiline
            numberOfLines={4}
            maxLength={40}
            onChangeText={text => setQuery(text)}
            //  value={customer.name}
            style={styles.textInput}
            placeholder="Name"
          />
        </View>
                  <FaIcon
                      name="search"
                      size={30}
                      // color={earnings < 0 ? '#713333ff' : '#3b613cff'}
                      onPress={() => {
                        // navigation.goBack();
                      }}
                    />
      </View> */}
      <Farmers />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogout}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          // setModalVisible(!modalVisible);
        }}
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

export default AllFarmers


const styles = StyleSheet.create({
  heroContainer: {
    height: '15%',
    width: '100%',
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    display: 'flex',
    // flexDirection: 'row',
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