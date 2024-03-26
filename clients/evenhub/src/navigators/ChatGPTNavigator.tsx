import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ChatGPT } from '../screens';

const ChatGPTNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ChatGPT" component={ChatGPT} />
    </Stack.Navigator>
  );
};

export default ChatGPTNavigator;
