import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList,TextInput,ActivityIndicator, Button, SafeAreaView, TouchableOpacity } from 'react-native';
import CustomBtn from '../components/button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    isAuthenticated,
    isAuthenticationExpired,
    generatePayload,
    authenticate,
    initAuthentication,
    clearAuthentication
} from '@trunpm/truvideo-react-turbo-core-sdk';
import QuickCrypto from 'react-native-quick-crypto';


const AuthenticationScreen = () => {
  const [apiKey, setApiKey] = useState('EPhPPsbv7e');
  const [secretKey, setSecretKey] = useState('9lHCnkfeLl');
  const [externalId, setExternalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(false);

  useEffect(() => {
         // clearAuth();
        isAuth();
    }, []);

    

    const isAuth = async () => {
        try {
            const isAuth = await isAuthenticated();
            const isAuthExpired = await isAuthenticationExpired();
            if(isAuth && !isAuthExpired){
                setStatus(true);
            }else{
                setStatus(false);
                setLoading(false);
            }
            //console.log('isAuth', isAuth);
            
        } catch (error) {
            console.log('error', error);
            setStatus(false);
            setLoading(false);
        }

    };
  const authFunc = async () => {
          try {
              setLoading(true);
              const isAuth = await isAuthenticated();
              // Check if authentication token has expired
              const isAuthExpired = await isAuthenticationExpired();
              //generate payload for authentication
              const payload = await generatePayload();
              const signature = await toSha256String(secretKey, payload);
              console.log("isAuth", isAuth);
                console.log("isAuthExpired", isAuthExpired);
            
              // Authenticate user
              if (!isAuth || isAuthExpired) {
                  await authenticate(apiKey, payload, signature, externalId);
              }
              // If user is authenticated successfully
              const initAuth = await initAuthentication();
              setLoading(false);
              setStatus(true);
              console.log('initAuth', initAuth);
          } catch (error) {
              setLoading(false);
              setStatus(false);
              console.log('error', error);
          }
      };

    const toSha256String = (signature: any, payload: any) => {
            try {
                // Create HMAC using 'sha256' and the provided signature as the key
                const hmac = QuickCrypto.createHmac('sha256', signature);
                // Update the HMAC with the payload
                hmac.update(payload);
                // Generate the HMAC digest and convert it to a hex string
                const hash = hmac.digest('hex');
                return hash;
            } catch (error) {
                console.error('Error generating SHA256 string:', error);
                return '';
            }
        };

    const clearAuth = async () => {
            try {
                const result = await clearAuthentication();
                console.log('Clear authentication successful:', result);
                setStatus(false);
            } catch (error) {
                console.error('Clear authentication error:', error);
            }
        };
        

    if(status){
        return (
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.container}>
                <Text style={styles.title}>You are authenticated!</Text>
                
                {/* A single button */}
                <TouchableOpacity style={styles.button} onPress={clearAuth}>
                  <Text style={styles.buttonText}>Re-Authenticate</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          );
    }


    if (loading) {
        return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Authenticating...</Text>
        </View>
        );
    }
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your Information</Text>
        
        {/* Four Text Inputs, one by one */}
        <TextInput
          style={styles.input}
          placeholder="API Key"
          onChangeText={setApiKey}
          value={apiKey}
        />
        <TextInput
          style={styles.input}
          placeholder="Secret Key"
          onChangeText={setSecretKey}
          value={secretKey}
        />
        <TextInput
          style={styles.input}
          placeholder="External ID"
          onChangeText={setExternalId}
          value={externalId}
        />
        
        {/* A single button */}
        <TouchableOpacity style={styles.button} onPress={authFunc}>
          <Text style={styles.buttonText}>Authenticate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingBottom: 10,
    },
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
    },
    filePathText: {
        fontSize: 14,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxOuter: {
        height: 20,
        width: 20,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxInner: {
        height: 14,
        width: 14,
        backgroundColor: '#2196F3',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AuthenticationScreen;
