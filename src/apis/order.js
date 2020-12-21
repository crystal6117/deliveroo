import config from '../config';
import Axios from 'axios';
import { getUserToken } from '../utils/session';

export const getOrders = () => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: config.ordersURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        }).then(res => {
            if (res.data.orders && Array.isArray(res.data.orders)) {
                resolve(res.data)
            } else {
                resolve([])
            }
        }).catch(error => {
            resolve([])
        })
    })
}

export const getOrderDetail = (id) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: `${config.ordersURL}?id=${id}`,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        }).then(res => {
            if (res.data.error) {
                resolve(null)
            } else {
                resolve(res.data)
            }
        }).catch(error => {
            resolve(null)
        })
    })
}

export const getOrderStatus = (id) => {
    return new Promise(async (resolve, rejecct) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: `${config.orderStatusURL}?id=${id}`,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        }).then(res => {
            if (res.data.error) {
                resolve(null)
            } else {
                resolve(res.data)
            }
        }).catch(error => {
            resolve(null)
        })
    })
}

export const addOrderReview = (param) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'post',
            url: config.addOrderReviewURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: param
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