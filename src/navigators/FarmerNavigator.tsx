import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

import FarmerHome from '../screens/farmers/FarmerHome';
import ShowHistory from '../screens/commonScreen/ShowHistory';

type FarmerStackParamList = {
  Farmer: { id: string | undefined };
  History: undefined;
};

const Stack = createStackNavigator<FarmerStackParamList>();

export default function FarmerNavigator() {
  const farmer = useSelector((state: any) => state.farmer.value);

  return (
    <Stack.Navigator
      id="farmer-stack"
      screenOptions={{ headerShown: false }}
      initialRouteName="Farmer"
    >
      <Stack.Screen
        name="Farmer"
        component={FarmerHome}
        initialParams={{ id: farmer?.id }}
      />
      <Stack.Screen
        name="History"
        component={ShowHistory}
      />
    </Stack.Navigator>
  );
}
