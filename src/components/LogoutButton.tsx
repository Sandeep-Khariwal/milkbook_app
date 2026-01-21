import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteToken } from '../../token/tokenStorage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import IconLogout from 'react-native-vector-icons/AntDesign';

const LogoutButton = (props: { showText: boolean }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(-1);
  const [openBottomSheet, setOpenBottomSheet] = useState<boolean>(false);
  const handleSheetChanges = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);
  const navigation = useNavigation<any>();
  const role = useSelector((state: any) => state.firm.value.role);
  const dispatch = useDispatch();

  console.log('bottomSheetIndex : ', bottomSheetIndex);

  const Logout = async () => {
    bottomSheetRef.current?.close();
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
      <TouchableOpacity
        style={{
          // width: '90%',
          // borderWidth: 1,
          alignItems: 'center',
          // borderColor: '#5086E7',
          backgroundColor: '#5185e6ff',
          borderRadius: 20,
          height: 50,
          display: 'flex',
          flexDirection: 'row',
          // justifyContent: 'center',
          gap: 10,
          padding:10,
          paddingLeft:16
        }}
        onPress={() => setBottomSheetIndex(0)}
      >
        <IconLogout
          name="logout"
          size={24}
          color="#FFF"
          onPress={() => {
            // setShowLogout(true)
          }}
        />
        {props.showText && (
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
            Logout
          </Text>
        )}
      </TouchableOpacity>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={bottomSheetIndex}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.contentContainer}>
          <View>
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
                onPress={() => bottomSheetRef.current?.close()}
              >
                <Text style={{ color: '#5086E7' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deletebuttonYes} onPress={Logout}>
                <Text style={{ color: '#fff' }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default LogoutButton;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
    backgroundColor: '#f3f3f6ff',
    borderWidth: 1,
    borderColor: '#e7e7eeff',
    borderRadius: 5,
    // height:400,
  },
  btnCss: {
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
