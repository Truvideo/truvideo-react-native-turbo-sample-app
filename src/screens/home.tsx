import * as React from "react"
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, NativeEventEmitter, NativeModules } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    initCameraScreen,
    LensFacing,
    FlashMode,
    Orientation,
    CameraMode,
    CameraConfiguration,
    type CameraResult,
    CameraMediaType,
    ImageFormat,
    isAugmentedRealityInstalled,
    isAugmentedRealitySupported,
    ARCameraConfiguration,
    initARCameraScreen,
    Resolution
} from '@trunpm/truvideo-react-turbo-camera-sdk';
import { MediaBuilder, UploadProgressEvent, UploadCompleteEventData, UploadErrorEvent } from '@trunpm/truvideo-react-turbo-media-sdk';
import { Routing } from '../../App';
import Toast from 'react-native-toast-message';
import { initAuthentication, isAuthenticated, isAuthenticationExpired } from "@trunpm/truvideo-react-turbo-core-sdk";

const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const [uploadPath, setUploadPath] = useState<CameraResult[] | undefined>(undefined);
    const [uploadImagePath, setUploadImagePath] = useState<CameraResult[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAuth();
    }, []);

    const loadAuth = async () => {
        setLoading(true);
        const isAuth = await isAuthenticated();

        // Check if authentication token has expired
        const isAuthExpired = await isAuthenticationExpired();

        if (isAuth || !isAuthExpired) {
            const initAuth = await initAuthentication();
            console.log('Authentication initialized:', initAuth);
        }
        setLoading(false);
    };

    const getFromStorage = async (key: string) => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error('Storage read error:', error);
            return [];
        }
    };

    // Load saved data when component mounts
    useEffect(() => {
        const loadSavedMedia = async () => {
            const savedVideos = await getFromStorage('fileList');
            const savedImages = await getFromStorage('fileImageList');
            setUploadPath(savedVideos);
            setUploadImagePath(savedImages);
        };

        loadSavedMedia();
    }, []);



    const initCamera = async () => {
         
        const resolution: Resolution = {
            width: 1920,
            height: 1080
        };
        const resolutions: Resolution[] = [{
            width: 1080,
            height: 1920
        }, {
            width: 720,
            height: 1280
        }];
        // await AsyncStorage.multiRemove(['fileList', 'fileImageList']);
        var cameraConfiguration: CameraConfiguration = {
            lensFacing: LensFacing.Back,
            flashMode: FlashMode.On,
            orientation: Orientation.Portrait,
            outputPath: "",
            frontResolutions: resolutions,
            frontResolution: resolution,
            backResolutions: resolutions,
            backResolution: resolution,
            mode: CameraMode.videoAndImage(),
            imageFormat: ImageFormat.JPEG
        }
        const isAugInstalled = isAugmentedRealityInstalled();
        const isAugmentSupported = isAugmentedRealitySupported();

        console.log('isAugInstalled', isAugInstalled);
        console.log('isAugmentSupported', isAugmentSupported);        

        // var ArConfig : ARCameraConfiguration = {
        //     outputPath: "",
        //     orientation: Orientation.Portrait,
        //     mode: CameraMode.image(),
        // }
        // initARCameraScreen(ArConfig).then((response)=>{
        //     console.log('AR response', response);
        // }).catch((err)=>{
        //     console.log('AR err', err);
        // })

        initCameraScreen(cameraConfiguration)
            .then((response) => {
                const mediaItems = response;
                console.log("response  <><>", response)
                console.log("mediaItems<><>", mediaItems)
                for (const item of mediaItems || []) {
                    console.log('item filepath', item.filePath);
                    console.log('item id', item.id);
                    console.log('item createdAt', item.createdAt);
                    console.log('item duration', item.duration);
                    console.log('item lensFacing', item.lensFacing);
                    console.log('item orientation', item.orientation);
                    console.log('item resolution', item.resolution);
                    console.log('item type', item.type);

                }   
               
                const videos = mediaItems?.filter((item) => item.type === CameraMediaType.video);
                const pictures = mediaItems?.filter((item) => item.type === CameraMediaType.image);
                uploadMediaItems(mediaItems);
                setUploadPath(videos);
                setUploadImagePath(pictures);
                // saveToStorage('fileList', videos);
                // saveToStorage('fileImageList', pictures);
                appendToStorage('fileList', videos || []);
                appendToStorage('fileImageList', pictures || []);

            })
            .catch((err) => {
                console.log('err', err);
            });

    };

    const appendToStorage = async (key: string, newItems: any[]) => {
        const existing = await getFromStorage(key);
        const updated = [...existing, ...newItems];
        await saveToStorage(key, updated);
    };

    function clearAuth() {
        AsyncStorage.removeItem('authData');
    }

    const uploadMediaItems = async (mediaItems: CameraResult[] | null) => {
        if (!mediaItems) return;
        for (const item of mediaItems) {
            try {
                //setTag({ key: 'value', color: 'red', orderNumber: 123 });
                //setMetaData({ key: 'value', key1: 1, key2: [4, 5, 6] });
                const filePath = `${item.filePath}`;
                const result = new MediaBuilder(filePath);
                // setTag
                result.setTag("key", "value");
                result.setTag("color", "red");
                result.setTag("orderNumber", "123");
                // setMetaData
                result.setMetaData("key", "value");
                result.setMetaData("key1", "1");
                result.setMetaData("key2", "[4,5,6]");
                // buiild request
                console.log(' successful: set data');
                var request = await result.build()
                console.log(' successful: set build');
                // handle callbacks
                const uploadCallbacks = {
                    onProgress: (event: UploadProgressEvent) => {
                        console.log(`ID: ${event.id}, Progress: ${event.progress}`)
                    },
                    onComplete: (event: UploadCompleteEventData) => { // Use 'any' or proper type for parsed data
                        console.log(`ID: ${event.id}, Type: ${event.fileType}`)
                        console.log(`ID: ${event.id}, Tag: ${JSON.stringify(event.tags)}`)
                        console.log(`ID: ${event.id}, MetaData: ${JSON.stringify(event.metaData)}`)
                        console.log(`ID: ${event.id}, Path: ${event.filePath}`)
                        console.log(`ID: ${event.id}, Path: ${event.uploadPath}`) // remote upload path

                        Toast.show({
                            type: 'success',
                            text1: 'Upload Complete',
                            text2: `File ID: ${event.id}`
                        });
                    },
                    onError: (event: UploadErrorEvent) => {
                        console.log(`ID: ${event.id}, Error: ${event.error}`)
                        Toast.show({
                            type: 'error',
                            text1: 'Upload Failed',
                            text2: `Error: ${event.error}`
                        });
                    },
                };

                //const result = await uploadMedia(item.filePath, JSON.stringify(tag), JSON.stringify(metaData));
                var res = await request.upload(uploadCallbacks)
                console.log(' successful: set upload');
                console.log('Upload successful:', res);
            } catch (error) {
                console.error('Upload error:', error);
            }
        }

    };

    const saveToStorage = async (key: string, value: any) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Storage save error:', error);
        }
    };


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Authenticating...</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <Image
                style={styles.logo}
                source={require('../../img/appstore.png')}
            />
            <View style={styles.buttonContainer}>
                <Text>Version 2.2</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate(Routing.Core)}
                >
                    <Text style={styles.buttonText}>Core</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={initCamera}>
                    <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate(Routing.Video, { uploadPath })}
                >
                    <Text style={styles.buttonText}>Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate(Routing.Request)}
                >
                    <Text style={styles.buttonText}>Video Request</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate(Routing.Image, { uploadImagePath })}
                >
                    <Text style={styles.buttonText}>Image</Text>
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 300,
        height: 70,
    },
    buttonContainer: {
        marginTop: 30,
    },
    button: {
        marginTop: 12,
        alignItems: 'center',
        backgroundColor: '#3490CA',
        padding: 10,
        width: 300,
        borderRadius: 50,
    },
    buttonText: {
        color: '#ffffff',
    },
});

export default HomeScreen;
