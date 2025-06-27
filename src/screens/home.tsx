import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, NativeEventEmitter,NativeModules} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    clearAuthentication,
    isAuthenticated,
    isAuthenticationExpired,
    generatePayload,
    authenticate,
    initAuthentication
} from 'truvideo-react-turbo-core-sdk';
import {
    initCameraScreen,
    LensFacing,
    FlashMode,
    Orientation,
    CameraMode,
    CameraConfiguration
} from 'truvideo-react-turbo-camera-sdk';
import { MediaBuilder,UploadProgressEvent,UploadCompleteEventData,UploadErrorEvent } from 'truvideo-react-turbo-media-sdk';
import QuickCrypto from 'react-native-quick-crypto';

type MediaItem = {
    cameraLensFacing: string;
    createdAt: number;
    duration: number;
    filePath: string;
    id: string;
    resolution: {
        height: number;
        width: number;
    };
    rotation: string;
    type: 'VIDEO' | 'PICTURE' | 'IMAGE';
};


const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const [uploadPath, setUploadPath] = useState<MediaItem[] | null>(null);
    const [uploadImagePath, setUploadImagePath] = useState<MediaItem[] | null>(null);

    useEffect(() => {
        authFunc();
    }, []);

    const authFunc = async () => {
        try {
            const isAuth = await isAuthenticated();
            // Check if authentication token has expired
            const isAuthExpired = await isAuthenticationExpired();
            //generate payload for authentication
            const payload = await generatePayload();
            const apiKey = 'EPhPPsbv7e';
            const secretKey = '9lHCnkfeLl';
            const signature = await toSha256String(secretKey, payload);
            // Authenticate user
            if (!isAuth || isAuthExpired) {
                await authenticate(apiKey, payload, signature, '');
            }
            // If user is authenticated successfully
            const initAuth = await initAuthentication();
            console.log('initAuth', initAuth);
        } catch (error) {
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

    const initCamera = async () => {
        await AsyncStorage.multiRemove(['fileList', 'fileImageList']);
        var cameraConfiguration  :  CameraConfiguration = {
            lensFacing: LensFacing.Back,
            flashMode: FlashMode.Off,
            orientation: Orientation.Portrait,
            outputPath: "",
            frontResolutions: [],
            frontResolution: null,
            backResolutions: [],
            backResolution: null,
            mode: CameraMode.videoAndImage(10,10,10),

        }
        initCameraScreen(cameraConfiguration) 
            .then((response) => {
                const mediaItems: MediaItem[] = JSON.parse(response);
                const videos = mediaItems.filter((item) => item.type === 'VIDEO');
                const pictures = mediaItems.filter((item) => item.type === 'IMAGE' || 'PICTURE');
                uploadMediaItems(mediaItems);
                setUploadPath(videos);
                setUploadImagePath(pictures);
                saveToStorage('fileList', videos);
                saveToStorage('fileImageList', pictures);

            })
            .catch((err) => {
                console.log('err', err);
            });
        
    };

    const uploadMediaItems = async (mediaItems: MediaItem[]) => {
        for (const item of mediaItems) {
            try {
                //setTag({ key: 'value', color: 'red', orderNumber: 123 });
                //setMetaData({ key: 'value', key1: 1, key2: [4, 5, 6] });
                const result = new MediaBuilder(item.filePath)
                // setTag
                result.setTag("key","value");
                result.setTag("color","red");
                result.setTag("orderNumber","123");
                // setMetaData
                result.setMetaData("key","value");
                result.setMetaData("key1","1");
                result.setMetaData("key2","[4,5,6]");
                // buiild request
                console.log(' successful: set data');
                var request = await result.build()
                console.log(' successful: set build');
                // handle callbacks
                const uploadCallbacks = {
                        onProgress: (event: UploadProgressEvent) => {
                            console.log(`ID: ${event.id}, Progress: ${event.progress}%`)
                        },
                        onComplete: (event: UploadCompleteEventData) => { // Use 'any' or proper type for parsed data
                            console.log(`ID: ${event.id}, Type: ${event.fileType}`)
                        },
                        onError: (event: UploadErrorEvent ) => {
                            console.log(`ID: ${event.id}, Error: ${event.error}`)
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

    const clearAuth = async () => {
        try {
            const result = await clearAuthentication();
            console.log('Clear authentication successful:', result);
        } catch (error) {
            console.error('Clear authentication error:', error);
        }
    };


    


    return (
        <View style={styles.container}>
            <Image
                style={styles.logo}
                source={require('../../img/appstore.png')}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={initCamera}>
                    <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Video', { uploadPath })}
                >
                    <Text style={styles.buttonText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Image', { uploadImagePath })}
                >
                    <Text style={styles.buttonText}>Image</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
