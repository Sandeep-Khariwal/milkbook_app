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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BASE_URL, saveToken } from '../../token/tokenStorage';
import LoadingOverlay from '../HelperFunction/LoadingOverlay';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { useDispatch } from 'react-redux';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import { setAdminDetails } from '../../redux/slices/adminSlice';

const { width, height } = Dimensions.get('window');

const SignupScreen = (props: { onClickLogin: () => void }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [firmName, setFirmName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');

  // ... handleSignup logic remains the same ...
  const handleSignup = async () => {
    const data = { name, phoneNumber, password, firmName, address };
    if (
      !name.trim() ||
      !phoneNumber.trim() ||
      !firmName.trim() ||
      !address.trim() ||
      !password.trim()
    ) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'All fields are required.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/firm/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const { token, admin, status, firm, message } = await response.json();
      setIsLoading(false);

      if (status === 200) {
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Success', textBody: message });
        if (token) await saveToken(token);
        dispatch(setFirmDetails({ name: firm.name, id: firm._id, role: admin.userType }));
        dispatch(setAdminDetails({ id: admin._id, name: admin.name }));
      } else if (status === 401) {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: message });
      }
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#5086E7" barStyle="light-content" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register your milk business</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="user" size={18} color="#5086E7" style={styles.icon} />
              <TextInput
                placeholder="Enter your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={18} color="#5086E7" style={styles.icon} />
              <TextInput
                placeholder="Enter phone number"
                style={styles.input}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <Text style={styles.label}>Business Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="building" size={18} color="#5086E7" style={styles.icon} />
              <TextInput
                placeholder="Name of your firm"
                style={styles.input}
                value={firmName}
                onChangeText={setFirmName}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <Text style={styles.label}>Address</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="map-marker"
                size={18}
                color="#5086E7"
                style={styles.icon}
              />
              <TextInput
                placeholder="Enter your address"
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#A0A0A0"
                multiline
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock"
                size={18}
                color="#5086E7"
                style={styles.icon}
              />

              <TextInput
                placeholder="Create password"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#A0A0A0"
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={props.onClickLogin}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#5086E7',
    height: height * 0.22, // Fixed height to prevent overlapping inputs
    paddingHorizontal: 25,
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontSize: 17,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    // This creates the space for the card to sit nicely below the header
    marginTop: -20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icon: {
    width: 25,
    marginRight: 10,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#5086E7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#5086E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#5086E7',
    fontWeight: 'bold',
  },
});