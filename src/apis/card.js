import config from '../config';
import Axios from 'axios';
import { getUserToken } from '../utils/session';

export const deleteCard = (id) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'delete',
            url: config.deleteCardURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: {
                id
            }
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

export const createCard = (source) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios.post(config.createCardURL, {
            source
        }, {
            headers: { Authorization: `Bearer ${token}` }
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

export const defaultCard = (id) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'put',
            url: config.defaultCardURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: {
                id
            }
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

export const getAllCards = () => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: config.allCardsURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        }).then(res => {
            if (res.data.payment_methods && Array.isArray(res.data.payment_methods)) {
                resolve(res.data.payment_methods)
            } else {
                resolve([])
            }
        }).catch(error => {
            resolve([])
        })
    })
}