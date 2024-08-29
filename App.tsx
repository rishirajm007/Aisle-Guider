import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import QRScanScreen from './src/screens/QRScanScreen';
import StoreMapScreen from './src/screens/StoreMapScreen';

// Define and export the RootStackParamList type
export type RootStackParamList = {
  Home: undefined;
  'QR Scan': undefined;
  StoreMap: {storeId: string; mapLayout: any};
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QR Scan" component={QRScanScreen} />
        <Stack.Screen name="StoreMap" component={StoreMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
