
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/home';
import VideoScreen from './src/screens/video';
import ImageScreen from './src/screens/image';

// Initialize the Stack navigator
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Video" component={VideoScreen} />
        <Stack.Screen name="Image" component={ImageScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;
