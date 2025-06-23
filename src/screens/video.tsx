import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomBtn from '../components/button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getVideoInfo,
    MergeBuilder,
    getResultPath,
    editVideo,
    compareVideos,
    ConcatBuilder,
    EncodeBuilder,
    generateThumbnail,
    cleanNoise,
    FrameRate,
} from 'truvideo-react-turbo-video-sdk';

interface MediaItem {
    filePath: string;
    createdAt: number;
}

interface CheckboxProps {
    checked: boolean;
    onPress: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
            <View style={styles.checkboxOuter}>
                {checked && <View style={styles.checkboxInner} />}
            </View>
        </TouchableOpacity>
    );
};

const VideoScreen: React.FC = () => {
    const [uploadPath, setUploadPath] = useState<MediaItem[] | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('fileList');
            setUploadPath(jsonValue ? JSON.parse(jsonValue) : null);
        } catch (error) {
            console.error('Error loading video list:', error);
        }
    };

    const toggleSelect = (filePath: string) => {
        setSelectedItems((prev) =>
            prev.includes(filePath) ? prev.filter((item) => item !== filePath) : [...prev, filePath]
        );
    };

    const handleConcatVideos = async () => {
        const videoStatus = await handleCompareVideos();
        if (videoStatus) {
            try {
                const resultPath = await getResultPath(`${Date.now()}-concatVideo.mp4`);
                const request = new ConcatBuilder(selectedItems, resultPath);
                const result = request.build();
                (await result).process;
                console.log('Video concatenated successfully:', result);
            } catch (error) {
                console.error('Error concatenating videos:', error);
            }
        } else {
            console.log('Videos are not compatible for concatenation.');
        }
    };

    const handleMergeVideos = async () => {
        try {
            const resultPath = await getResultPath(`${Date.now()}-mergedVideo.mp4`);
            const request = new MergeBuilder(selectedItems, resultPath);
            request.setHeight(640);
            request.setWigth(480);
            request.setFrameRate(FrameRate.fiftyFps);
            
            const result = await request.build();

            const video = await request.process();
            // process the video
            // (await result).process
            console.log('Videos merged successfully:', video);
        } catch (error) {
            console.error('Error merging videos:', error);
        }
    };

    const handleEncodeVideo = async () => {
        if (!selectedItems[0]) return;

        const config = {
            height: '640',
            width: '480',
            framesRate: 'thirtyFps',
            videoCodec: 'libx264',
        };

        try {
            const resultPath = await getResultPath(`${Date.now()}-encodedVideo.mp4`);
            const request = new EncodeBuilder(selectedItems[0], resultPath);
            request.setHeight(640);
            request.setWigth(480);
            request.setFrameRate(FrameRate.fiftyFps);
            const result = request.build();
            (await result).process();
            console.log('Video encoded successfully:', result);
        } catch (error) {
            console.error('Error encoding video:', error);
        }
    };

    const handleGenerateThumbnail = async () => {
        if (!selectedItems[0]) return;

        try {
            const resultPath = await getResultPath(`${Date.now()}-thumbnail.png`);
            const result = await generateThumbnail(selectedItems[0], resultPath, '1000', '640', '480');
            console.log('Thumbnail generated successfully:', result);
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        }
    };

    const handleEditVideo = async () => {
        if (!selectedItems[0]) return;

        try {
            const resultPath = await getResultPath(`${Date.now()}-editVideo.mp4`);
            const result = await editVideo(selectedItems[0], resultPath);
            console.log('Video edited successfully:', result);
        } catch (error) {
            console.error('Error editing video:', error);
        }
    };

    const handleCleanNoise = async () => {
        if (!selectedItems[0]) return;

        try {
            const resultPath = await getResultPath(`${Date.now()}-cleanNoise.mp4`);
            const result = await cleanNoise(selectedItems[0], resultPath);
            console.log('Noise cleaned successfully:', result);
        } catch (error) {
            console.error('Error cleaning noise:', error);
        }
    };

    const handleCompareVideos = async () => {
        try {
            const result = await compareVideos(selectedItems);
            console.log('Comparison result:', result);
            return result;
        } catch (error) {
            console.error('Error comparing videos:', error);
            return false;
        }
    };

    const handleGetVideoInfo = async () => {
        if (!selectedItems[0]) return;

        try {
            const videoInfo = await getVideoInfo(selectedItems[0]);
            console.log('Video info:', videoInfo);
        } catch (error) {
            console.error('Error fetching video info:', error);
        }
    };

    const renderItem = ({ item }: { item: MediaItem }) => (
        <View style={styles.itemContainer}>
            <Checkbox
                checked={selectedItems.includes(item.filePath)}
                onPress={() => toggleSelect(item.filePath)}
            />
            <Text style={styles.filePathText}>{item.filePath}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.list}
                data={uploadPath}
                renderItem={renderItem}
                keyExtractor={(item) => item.createdAt.toString()}
            />
            <View style={styles.row}>
                <CustomBtn onPress={handleConcatVideos} title="Concat" />
                <CustomBtn onPress={handleMergeVideos} title="Merge" />
                <CustomBtn onPress={handleEncodeVideo} title="Encode" />
                <CustomBtn onPress={handleGenerateThumbnail} title="Thumbnail" />
                <CustomBtn onPress={handleEditVideo} title="Edit" />
                <CustomBtn onPress={handleCleanNoise} title="Clear Noise" />
                <CustomBtn onPress={handleGetVideoInfo} title="Info" />
            </View>
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
});

export default VideoScreen;
