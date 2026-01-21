import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import React, { Component, useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import Home from '../screens/admin/Home';
import Stocks from '../screens/admin/Stocks';
import Distributers from '../screens/admin/Distributers';
import Customers from '../screens/admin/Customers';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerHome from '../screens/customers/CustomerHome';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import LogoutButton from '../components/LogoutButton';
import Farmers from '../screens/admin/Farmer';
import FarmerHome from '../screens/farmers/FarmerHome';
import ShowHistory from '../screens/commonScreen/ShowHistory';

const Stack = createStackNavigator();

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const firm = useSelector((state: any) => state.firm.value);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ paddingTop: 10, paddingBottom: 20, height: 80 }}>
        <Text
          style={{
            fontSize: 24,
            color: '#5086E7',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {firm.name}
        </Text>
        <Text style={{ fontSize: 26, color: '#fff', fontWeight: 600 }}>
          {/* {admin.name} */}
        </Text>
      </View>
      <DrawerItemList {...props} />
      <View style={{ width: '100%', flex:1, marginTop: 20 }}>
        <LogoutButton showText={true} />
      </View>
      {/* <LogoutBottomSheet
          openBottomSheet={openBottomSheet}
          onPressCloseButton={() => {
            setOpenBottomSheet(false);
          }}
        /> */}
    </DrawerContentScrollView>
  );
}

const AdminDrawer = () => {
  return (
    <Drawer.Navigator
      id="admin-drawer"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,

        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={() => navigation.openDrawer()}
          >
            <Icon name="menu" size={32} color="#5086E7" />
          </TouchableOpacity>
        ),
        // headerBackground: () => (
        //   <LinearGradient
        //     colors={['#826fddff', '#341ca9ff']}
        //     start={{ x: 0, y: 0 }}
        //     end={{ x: 1, y: 1 }}
        //     style={{ flex: 1 }}
        //   />
        // ),
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: '#5086E7',

        },
        // drawerActiveTintColor: '#fff',
        // drawerInactiveTintColor: '#e0e0e0',
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
      })}
    >
      <Drawer.Screen
        name="HomePage"
        component={Home}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen
        name="Stocks"
        component={Stocks}
        options={{ title: 'Stocks' }}
      />
      <Drawer.Screen
        name="Distributers"
        component={Distributers}
        options={{ title: 'Distributers' }}
      />
      <Drawer.Screen
        name="Farmers"
        component={Farmers}
        options={{ title: 'Farmers' }}
      />
      <Drawer.Screen
        name="Customers"
        component={Customers}
        options={{ title: 'Customers' }}
      />
    </Drawer.Navigator>
  );
};

export default function AdminNavigator() {
  return (
    <Stack.Navigator
       id="admin-stack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminDrawer} />
      <Stack.Screen name="FarmerPage" component={FarmerHome} />
      <Stack.Screen name="CustomerPage" component={CustomerHome} />
      <Stack.Screen name="History" component={ShowHistory} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
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
