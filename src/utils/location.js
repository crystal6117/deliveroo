import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';

export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(position => {
            resolve({location: position.coords})
        }, error => {
            resolve({location: null, error});
        }, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000
        })
    })
}