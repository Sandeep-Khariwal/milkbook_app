/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import AuthNavigator from './src/navigators/AuthNavigator';
import { useEffect, useState } from 'react';
import AdminNavigator from './src/navigators/AdminNavigator';
import CustomerNavigator from './src/navigators/CustomerNavigator';
import DistributerNavigator from './src/navigators/DistributerNavigator';
import { BASE_URL, deleteToken, getToken } from './token/tokenStorage';
import { setFirmDetails } from './redux/slices/firmSlice';
import { setAdminDetails } from './redux/slices/adminSlice';
import { setCustomerDetails } from './redux/slices/customerSlice';
import { setDistributerDetails } from './redux/slices/distributerSlice';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import FarmerNavigator from './src/navigators/FarmerNavigator';
import { setFarmerDetails } from './redux/slices/farmerSlice';
import LoadingOverlay from './src/HelperFunction/LoadingOverlay';

function RootNavigator() {}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <StatusBar backgroundColor={'#5086E7'} />
      <GestureHandlerRootView>
        <NavigationContainer>
          <AlertNotificationRoot>
            <AppContent />
          </AlertNotificationRoot>
        </NavigationContainer>
      </GestureHandlerRootView>
    </Provider>
  );
}

function AppContent() {
  const role = useSelector((state: any) => state.firm.value.role);
  const [token, setToken] = useState<string>('');
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAppToken = async () => {
      // await deleteToken()
      setIsLoading(true);
      const token = (await getToken()) ?? '';
      console.log('before API : ', token);

      await fetch(`${BASE_URL}/user/getUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res: any) => {
          const {user}  = await res.json();
          console.log('user is : ', user);

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
          setIsLoading(false);
        })
        .catch((e: any) => {
          // const err = await e.json()
          console.log(e);
          setIsLoading(false);
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: `Server Error`,
          });
        });
      setToken(token);
    };
    getAppToken();
  }, []);

  if (isLoading) {
    return <LoadingOverlay visible={isLoading} />;
  }

  switch (role) {
    case 'admin':
      return <AdminNavigator />;

    case 'distributer':
      return <DistributerNavigator />;

    case 'customer':
      return <CustomerNavigator />;

    case 'farmer':
      return <FarmerNavigator />;

    default:
      return <AuthNavigator />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
