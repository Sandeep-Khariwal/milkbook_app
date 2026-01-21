import Icon from 'react-native-vector-icons/FontAwesome';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { BASE_URL, saveToken } from '../../token/tokenStorage';
import { setAdminDetails } from '../../redux/slices/adminSlice';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import { setCustomerDetails } from '../../redux/slices/customerSlice';
import { setDistributerDetails } from '../../redux/slices/distributerSlice';
import LoadingOverlay from '../HelperFunction/LoadingOverlay';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import { setFarmerDetails } from '../../redux/slices/farmerSlice';

export default function AuthNavigator() {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const Login = async () => {
    setIsLoading(true);
    await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, password }),
    })
      .then(async (res: any) => {
        const data = await res.json();
        const { user, token, message, status } = data;
        console.log('response in auth : ', data);
        setIsLoading(false);
        if (status === 404) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: message,
          });

          return;
        }
        if (token) {
          await saveToken(token);
        }
        const firmData = {
          name: user.firmId.name,
          id: user.firmId._id,
          role: user.userType,
        };

        dispatch(setFirmDetails(firmData));

        const userData = {
          id: user._id,
          name: user.name,
        };

        if (user.userType === 'admin') {
          dispatch(setAdminDetails(userData));
        } else if (user.userType === 'customer') {
          dispatch(setCustomerDetails(userData));
        } else if (user.userType === 'distributer') {
          dispatch(setDistributerDetails(userData));
        } else if (user.userType === 'farmer') {
          dispatch(setFarmerDetails(userData));
        }
      })
      .catch((e: any) => {
        console.log('error found : ', e, e.message);
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Image source={require('../assets/logo1.png')} />
      </View>
      <View style={styles.formBox}>
        <View style={styles.inputBox}>
          <Icon
            name="phone"
            size={28}
            color="#5086E7"
            style={{ marginLeft: 10 }}
          />
          <TextInput
            editable
            multiline
            numberOfLines={4}
            maxLength={10}
            onChangeText={text => setPhoneNumber(text)}
            value={phoneNumber}
            style={styles.textInput}
            placeholder="Phone Number"
          />
        </View>
        {/* <View style={styles.formBox}> */}
        <View style={styles.inputBox}>
          <Icon
            name="lock"
            size={28}
            color="#5086E7"
            style={{ marginLeft: 10 }}
          />
          <TextInput
            editable
            multiline
            numberOfLines={4}
            maxLength={40}
            onChangeText={text => setPassword(text)}
            value={password}
            style={styles.textInput}
            placeholder="Password"
          />
          {/* </View> */}
        </View>
      </View>

      <View style={styles.formBox}>
        <TouchableOpacity style={styles.button} onPress={Login}>
          <Text style={styles.text}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  logoSection: {
    width: '100%',
    height: 300,
    backgroundColor: '#5086E7',
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  inputBox: {
    width: '90%',
    backgroundColor: '#ebeef2ff',
    borderRadius: 7,
    height: 50,
    fontWeight: '700',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 20,
  },
  textInput: {
    padding: 10,
  },
  button: {
    width: '90%',
    borderWidth: 1,
    alignItems: 'center',
    borderColor: '#5086E7',
    borderRadius: 10,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5086E7',
  },
});
