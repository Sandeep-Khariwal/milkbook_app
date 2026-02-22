import React from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux';
import CustomerHome from '../screens/customers/CustomerHome';
import { createStackNavigator } from '@react-navigation/stack';
import ShowHistory from '../screens/commonScreen/ShowHistory';
import ShowAllHistory from '../screens/commonScreen/AllHistory';


const Stack = createStackNavigator();

export  function CustomerPage(){
    const customer = useSelector((state: any) => state.customer.value);

    const route = {
      params:{
        id:customer.id,
        userType:"customer"
      }
    }
    
    return (
      <View style={{flex:1}} >
        <CustomerHome route={route} />
      </View>
    )
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator
       id="customer-stack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Customer" component={CustomerPage} />
       <Stack.Screen name="History" component={ShowHistory} />
             <Stack.Screen
        name="AllHistory"
        component={ShowAllHistory}
      />
    </Stack.Navigator>
  );
}



