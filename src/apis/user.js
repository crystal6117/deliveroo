import config from '../config';
import Axios from 'axios';
import { getUserToken } from '../utils/session';
import { getToken } from '../utils/token';
import { getAddresses } from './address';

export const getProfileInfo = () => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();

        try {
            let profileData = await Axios.get(config.getProfileURL, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let addresses = await getAddresses();
            let profile = profileData.data;
            profile.addresses = addresses;
            resolve(profile);
        } catch (error) {
            console.log('ceebo-log-error', error)
            reject(error.toString())
        }
    })
}

export const login = (email, password) => {
    
    return new Promise(async (resolve, reject) => {
        const fcmToken = await getToken();
        Axios.post(config.loginURL, {
            email, password, device_id: fcmToken
        }).then(res => {
            if (res.data.success) {
                resolve(res.data.user_data);
            } else {
                reject(res.data.message);
            }
        }).catch(error => {
            reject(error.toString());
        })
    })
}

export const logout = (userid) => {
    return new Promise(async (resolve, reject) => {
        const fcmToken = await getToken();
        const token = await getUserToken();

        Axios({
            method: 'post',
            url: config.logoutURL,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: {
                device_id: fcmToken
            }
        }).then(res => {
            if (res.data.success) {
                resolve();
            } else {
                reject(res.data.message);
            }
        }).catch(error => {
            reject(error.toString());
        })
    })
}

export const checkEmail = (email) => {
    return new Promise((resolve, reject) => {
        Axios.post(config.checkEmailURL, {
            email: email
        }).then(res => {
            resolve(res.data)
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const signup = (email, first_name, last_name, password) => {
    return new Promise(async (resolve, reject) => {
        const fcmToken = await getToken();
        Axios.post(config.signupURL, {
            email, first_name, last_name, password, device_id: fcmToken
        }).then(res => {
            console.log("signup result", res.data);
            if (res.data.success) {
                resolve(res.data.user_data);
            } else {
                reject(res.data.message);
            }
        }).catch(error => {
            reject(error.toString());
        })
    })
}

export const forgotPassword = (email) => {
    return new Promise((resolve, reject) => {
        Axios.post(config.forgotPasswordURL, {
            email
        }).then(res => {
            if (res.data.success) {
                resolve(true);
            } else {
                reject(res.data.message);
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const loginWithSocial = (provider, token) => {
    return new Promise(async (resolve, reject) => {
        const fcmToken = await getToken();
        Axios.post(config.oAuthURL, {
            provider,
            access_token: token,
            device_id: fcmToken
        }).then(res => {
            if (res.data.success) {
                resolve(res.data.user_data);
            } else {
                reject(res.data?.message);
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const updateAvatar = (avatarForm) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();

        Axios({
            method: 'post',
            url: config.updateAvatarURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'multipart/form-data' 
            },
            data: avatarForm
        }).then(res => {
            if (!res.data.success) {
                reject(res.data.message);
            } else {
                resolve(true);
            }
        }).catch(error => {
            reject(error.toString());
        })
    })
}

export const updateAccount = (data) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios.post(config.updateAccountURL, data, {
            headers: { 
                Authorization: `Bearer ${token}`,
            }
        }).then(res => {
            if (res.data.success) {
                resolve(true)
            } else {
                reject(res.data.message)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}