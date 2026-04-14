import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BASE_URL, saveToken } from '../../token/tokenStorage';
import LoadingOverlay from '../HelperFunction/LoadingOverlay';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useDispatch } from 'react-redux';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import { setAdminDetails } from '../../redux/slices/adminSlice';

const SignupScreen = (props: { onClickLogin: () => void }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [firmName, setFirmName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSignup = async () => {
    const data = { name, phoneNumber, password, firmName };
    setIsLoading(true);
    await fetch(`${BASE_URL}/firm/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(async (res: any) => {
        const { token, admin, status, firm, message } = await res.json();
        setIsLoading(false);
        if (status === 200) {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: message,
          });

          if (token) {
            await saveToken(token);
          }
          const firmData = {
            name: firm.name,
            id: firm._id,
            role: admin.userType,
            // subscriptionExp: true,
          };

          dispatch(setFirmDetails(firmData));

          const userData = {
            id: admin._id,
            name: admin.name,
          };
          dispatch(setAdminDetails(userData));
        }

        if (status === 401) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: message,
          });
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#5086E7" barStyle="light-content" />

      {/* Header (Fixed) */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register your milk business</Text>
      </View>

      {/* Form Section */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={10}
          />

          <TextInput
            placeholder="Business Name"
            style={styles.input}
            value={firmName}
            onChangeText={setFirmName}
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login link */}
          <View style={{width:"100%",display:"flex",flexDirection:"row",alignItems:"center", justifyContent:"center", marginTop:20}} >

          <Text style={styles.loginText}>  Already have an account?</Text>
            <TouchableOpacity onPress={() => props.onClickLogin()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FF',
  },

  header: {
    backgroundColor: '#5086E7',
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#E8EDFF',
    marginTop: 4,
    fontSize: 14,
  },

  formContainer: {
    padding: 25,
    paddingTop: 35,
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
    fontSize: 15,
  },

  button: {
    backgroundColor: '#5086E7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    textAlign: 'center',
    // marginTop: 20,
    fontSize: 14,
    color: '#666',
  },

  loginLink: {
     fontSize: 16,
    color: '#5086E7',
    fontWeight: 'bold',
  },
});
