import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageEdit, getFilePath } from 'truvideo-react-turbo-image-sdk';

type MediaItem = {
    filePath: string;
    createdAt: number;
};

const ImageScreen: React.FC = () => {
    const [uploadImagePath, setUploadImagePath] = useState<MediaItem[] | null>(null);

    useEffect(() => {
        loadImagePaths();
    }, []);

    const loadImagePaths = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('fileImageList');
            setUploadImagePath(jsonValue ? JSON.parse(jsonValue) : null);
        } catch (error) {
            console.error('Error loading image paths:', error);
        }
    };

    const editImage = async (selectedItemPath: string) => {
        console.log('selectedItemPath', selectedItemPath)
        try {
            const resultPath = await getFilePath(`${Date.now()}-editImage.png`);
            const result = await launchImageEdit(selectedItemPath, resultPath);
            console.log('Image edited successfully:', result);
        } catch (error) {
            console.log('Error editing image:', error);
        }
    };

    const renderItem = ({ item }: { item: MediaItem }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => editImage(item.filePath)}>
                <Text style={styles.filePathText}>{item.filePath}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.list}
                data={uploadImagePath}
                renderItem={renderItem}
                keyExtractor={(item) => item.createdAt.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f9fa',
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
});

export default ImageScreen;
