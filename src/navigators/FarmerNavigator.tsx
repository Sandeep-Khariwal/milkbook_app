import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

import FarmerHome from '../screens/farmers/FarmerHome';
import ShowHistory from '../screens/commonScreen/ShowHistory';
import ShowAllHistory from '../screens/commonScreen/AllHistory';

type FarmerStackParamList = {
  Farmer: { id: string | undefined , userType:string };
  History: undefined;
  AllHistory: undefined;
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
        initialParams={{ id: farmer?.id , userType:"farmer" }}
      />
      <Stack.Screen
        name="History"
        component={ShowHistory}
      />
      <Stack.Screen
        name="AllHistory"
        component={ShowAllHistory}
      />
    </Stack.Navigator>
  );
}
