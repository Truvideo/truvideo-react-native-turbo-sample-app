import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList,TextInput,ActivityIndicator, Button, SafeAreaView, TouchableOpacity } from 'react-native';
import CustomBtn from '../components/button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuickCrypto from 'react-native-quick-crypto';
import { getAllRequest,VideoStatus, BuilderResponse } from '@trunpm/truvideo-react-turbo-video-sdk';


const VideoRequestScreen = () => {
  const [list, setList] = useState<BuilderResponse[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
         // clearAuth();
        allRequest();
    }, []);
        
    const allRequest = async () => {
        setLoading(true);
        var videoStatus : VideoStatus | undefined = undefined // for all status
        const requests  = await getAllRequest(videoStatus);
        setList(requests);
        console.log('requests', requests);
        setLoading(false);
    }


    const renderItem = ({ item }: { item: BuilderResponse }) => (
            <View style={styles.itemContainer}>
                <Text style={styles.filePathText}>{item.id}</Text>
            </View>
        );


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
        <Text style={styles.title}>Video Request</Text>
        
        <FlatList
                contentContainerStyle={styles.list}
                data={list}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
        
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

export default VideoRequestScreen;
