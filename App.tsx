
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/home';
import VideoScreen from './src/screens/video';
import ImageScreen from './src/screens/image';
import AuthenticationScreen from './src/screens/authenticationScreen';
import VideoRequestScreen from './src/screens/videoRequests';

// Initialize the Stack navigator
const Stack = createNativeStackNavigator();
export enum Routing {
  Home = 'Home',
  Video = 'Video',
  Image = 'Image',
  Core = 'Core',
  Request = 'Request'
} 

function App(): React.JSX.Element {

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name={Routing.Home} component={HomeScreen} />
        <Stack.Screen name={Routing.Video}  component={VideoScreen} />
        <Stack.Screen name={Routing.Image}  component={ImageScreen} />
        <Stack.Screen name={Routing.Core}  component={AuthenticationScreen} />
        <Stack.Screen name={Routing.Request}  component={VideoRequestScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;
