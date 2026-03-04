/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import AuthNavigator from './src/navigators/AuthNavigator';
import { useEffect, useState } from 'react';
import AdminNavigator from './src/navigators/AdminNavigator';
import CustomerNavigator from './src/navigators/CustomerNavigator';
import DistributerNavigator from './src/navigators/DistributerNavigator';
import { BASE_URL, getToken } from './token/tokenStorage';
import { setFirmDetails } from './redux/slices/firmSlice';
import { setAdminDetails } from './redux/slices/adminSlice';
import { setCustomerDetails } from './redux/slices/customerSlice';
import { setDistributerDetails } from './redux/slices/distributerSlice';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Toast,
} from 'react-native-alert-notification';
import FarmerNavigator from './src/navigators/FarmerNavigator';
import { setFarmerDetails } from './redux/slices/farmerSlice';
import LoadingOverlay from './src/HelperFunction/LoadingOverlay';

function App() {
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
    getAppToken();
  }, []);

  const getAppToken = async () => {
    // await deleteToken()
    setIsLoading(true);
    const token = (await getToken()) ?? '';

    await fetch(`${BASE_URL}/user/getUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res: any) => {
        const { user } = await res.json();

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
export default App;
