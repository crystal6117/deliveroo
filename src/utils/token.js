import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';

export const getToken = async () => {
    try {
        let fcmToken = await AsyncStorage.getItem('ceebo_fcmtoken');
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                // user has a device token
                await AsyncStorage.setItem('ceebo_fcmtoken', fcmToken);
            }
        }
        return fcmToken;
    } catch (error) {
        console.log(error)
        return null;
    }
}