import Icon from 'react-native-vector-icons/FontAwesome';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { BASE_URL, saveToken } from '../../token/tokenStorage';
import { setAdminDetails } from '../../redux/slices/adminSlice';
import { setFirmDetails } from '../../redux/slices/firmSlice';
import { setCustomerDetails } from '../../redux/slices/customerSlice';
import { setDistributerDetails } from '../../redux/slices/distributerSlice';
import LoadingOverlay from '../HelperFunction/LoadingOverlay';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { setFarmerDetails } from '../../redux/slices/farmerSlice';
import SignupScreen from '../components/Signup';

const { width } = Dimensions.get('window');

export default function AuthNavigator() {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);

  const Login = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });
      const data = await response.json();
      const { user, token, message, status, isSubscriptionExp } = data;

      setIsLoading(false);

      if (status === 403 || isSubscriptionExp) {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Subscription expired!!' });
        dispatch(setAdminDetails({ id: user._id, name: user.name }));
        dispatch(setFirmDetails({ name: '', id: '', role: 'admin', subscriptionExp: isSubscriptionExp }));
        return;
      }

      if (status === 404 || status === 500) {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: message });
        return;
      }

      if (token) await saveToken(token);

      dispatch(setFirmDetails({ name: user.firmId.name, id: user.firmId._id, role: user.userType }));

      const userData = { id: user._id, name: user.name };
      if (user.userType === 'admin') dispatch(setAdminDetails(userData));
      else if (user.userType === 'customer') dispatch(setCustomerDetails(userData));
      else if (user.userType === 'distributer') dispatch(setDistributerDetails(userData));
      else if (user.userType === 'farmer') dispatch(setFarmerDetails(userData));

    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay visible={isLoading} />;

  return (
    <>
      {showLogin ? (
        <View style={styles.container}>
          <View style={styles.headerBackground}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/logo1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subText}>Sign in to continue your business</Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color="#5086E7" style={styles.inputIcon} />
                <TextInput
                  keyboardType="phone-pad"
                  maxLength={10}
                  onChangeText={setPhoneNumber}
                  value={phoneNumber}
                  style={styles.textInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon
                  name="lock"
                  size={20}
                  color="#5086E7"
                  style={styles.inputIcon}
                />

                <TextInput
                  secureTextEntry={!showPassword}
                  maxLength={40}
                  onChangeText={setPassword}
                  value={password}
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={Login}>
                <Text style={styles.loginButtonText}>LOGIN</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Add Milk Business? </Text>
                <TouchableOpacity onPress={() => setShowLogin(false)}>
                  <Text style={styles.signupLink}>Signup</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      ) : (
        <SignupScreen onClickLogin={() => setShowLogin(true)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    width: '100%',
    height: width * 0.8,
    backgroundColor: '#5086E7',
    borderBottomRightRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logo: {
    width: 140,
    height: 140,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    marginTop: -20, // Pulls the card up into the blue area
    paddingHorizontal: 25,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },

  inputIcon: {
    marginRight: 10,
    width: 25,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#5086E7',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#5086E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#5086E7',
    fontSize: 14,
    fontWeight: 'bold',
  },
});