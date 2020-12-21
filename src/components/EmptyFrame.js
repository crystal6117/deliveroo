import React from 'react';
import { View } from 'react-native';

export default EmptyFrame = () => (
    <View style={{paddingVertical: 20}}>
        <View style={{backgroundColor: '#F7F7F7', height: 150, marginBottom: 20, borderRadius: 10}} />
        <View style={{backgroundColor: '#F7F7F7', height: 20, width: '60%', marginBottom: 10, borderRadius: 5}} />
        <View style={{backgroundColor: '#F7F7F7', height: 20, width: '65%', marginBottom: 10, borderRadius: 5}} />
        <View style={{flexDirection: 'row'}}>
            <View style={{backgroundColor: '#F7F7F7', width: 75, height: 20, borderRadius: 5, marginRight: 10}} />
            <View style={{backgroundColor: '#F7F7F7', width: 50, height: 20, borderRadius: 5, marginRight: 10}} />
            <View style={{backgroundColor: '#F7F7F7', width: 30, height: 20, borderRadius: 5, marginRight: 10}} />
            <View style={{backgroundColor: '#F7F7F7', width: 30, height: 20, borderRadius: 5, marginRight: 10}} />
        </View>
    </View>
)