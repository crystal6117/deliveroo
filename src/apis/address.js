import config from '../config';
import Axios from 'axios';
import { getUserToken } from '../utils/session';

export const createAddress = (address) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios.post(config.createAddressURL, address, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (!res.data.success) {
                reject(res.data.message)
            } else {
                resolve(true)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const updateAddress = (address) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios.put(config.updateAddressURL, address, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data.status === false) {
                reject(res.data.message)
            } else {
                resolve(true)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const deleteAddress = (id) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'delete',
            url: config.deleteAddressURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: {
                id
            }
        }).then(res => {
            if (!res.data.success) {
                reject(res.data.message)
            } else {
                resolve(true)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const getDefaultAddress = () => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: config.defaultAddressURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        })
        .then(res => {
            if (res.data.success === false) {
                resolve(null)
            } else {
                resolve(res.data)
            }
        }).catch(error => {
            resolve(null)
        })
    })
}

export const getAddresses = () => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: config.getAddressesURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        })
        .then(res => {
            resolve(res.data)
        }).catch(error => {
            resolve([])
        })
    })
}