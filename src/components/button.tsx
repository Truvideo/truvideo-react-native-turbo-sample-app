import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomBtn = ({
    onPress,
    title,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.button}
        >
           <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: '#3490CA',
        width: 120,
        height: 50,
        margin: 2
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
});

export default CustomBtn;