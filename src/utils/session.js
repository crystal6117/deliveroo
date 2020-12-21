import AsyncStorage from '@react-native-community/async-storage';
import uuid from 'uuid';

export const getSessionGuid = async () => {
    var sessId = await AsyncStorage.getItem("ceebo_session_guid");
    if (!sessId) {
        var sessId = uuid();
        AsyncStorage.setItem("ceebo_session_guid", sessId);
    }
    return sessId;
}

export const saveUserToken = async (token) => {
    await AsyncStorage.setItem("ceebo_user_token", token);
}

export const removeUserToken = async () => {
    await AsyncStorage.removeItem("ceebo_user_token");
}

export const getUserToken = () => {
    return new Promise(async (resolve, reject) => {
        var token = await AsyncStorage.getItem("ceebo_user_token");
        resolve(token);
    })
}

export const saveSigninInfo = async (data) => {
    await AsyncStorage.setItem("ceebo_signin_info", JSON.stringify(data))
}

export const removeSigninInfo = async () => {
    await AsyncStorage.removeItem("ceebo_signin_info");
}

export const getSigninInfo = async () => {
    const res = await AsyncStorage.getItem("ceebo_signin_info")
    if (res) {
        return JSON.parse(res);
    } else {
        return  null;
    }
}

export const getFilterData = async () => {
    const data = await AsyncStorage.getItem("ceebo_filter_data");
    if (!data) return null
    return JSON.parse(data);
}

export const saveFilterData = async (data) => {
    await AsyncStorage.setItem("ceebo_filter_data", data);
}

export const removeFilterData = async () => {
    await AsyncStorage.removeItem("ceebo_filter_data");
}

export const saveLocationPermissionRole = async (role) => {
    await AsyncStorage.setItem("location_permission_role", role);
}

export const removeLocationPermissionRole = async () => {
    await AsyncStorage.removeItem("location_permission_role");
}

export const getLocationPermissionRole = async () => {
    return await AsyncStorage.getItem("location_permission_role");
}

export const saveAddress = async (address) => {
    await AsyncStorage.setItem("custom_address", address);
}

export const removeAddress = async () => {
    await AsyncStorage.removeItem("custom_address");
}

export const getAddress = async () => {
    return await AsyncStorage.getItem("custom_address");
}

export const saveAddressLocation = async (location) => {
    await AsyncStorage.setItem("custom_address_location", JSON.stringify(location));
}

export const removeAddressLocation = async () => {
    await AsyncStorage.removeItem("custom_address_location");
}

export const getAddressLocation = async () => {
    const res = await AsyncStorage.getItem("custom_address_location");
    return JSON.parse(res);
}

export const setSkipFlag = async () => {
    await AsyncStorage.setItem("ceebo_skipped", "skipped");
}

export const getSkipFlag = async () => {
    return await AsyncStorage.getItem("ceebo_skipped");
}

export const removeSkipFlag = async () => {
    await AsyncStorage.removeItem("ceebo_skipped");
}

export const removeAllSessions = async () => {
    AsyncStorage.getAllKeys()
    .then(ks => {
        ks.forEach(kItem => {
            AsyncStorage.removeItem(kItem);
        })
    }).catch(error => {

    })
}

export const getSession = async (sessionId) => {
    var sess = await AsyncStorage.getItem(sessionId);
    if (sess){
        return JSON.parse(sess)
    } else {
        return null;
    }
}

export const setSession = async (sessionId, data) => {
    await AsyncStorage.setItem(sessionId, JSON.stringify(data));
    return true;
}