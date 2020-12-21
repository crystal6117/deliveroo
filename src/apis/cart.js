import config from '../config';
import Axios from 'axios';
import { getUserToken, getSessionGuid } from '../utils/session';

export const addToCart = (params) => {
    return new Promise(async (resolve, reject) => {
        Axios.post(config.addToCartURL, params).then(res => {
            if (res.data.success)
                resolve(true)
            else 
                reject(res.data.message)
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const updateToCart = (params) => {
    return new Promise(async (resolve, reject) => {
        Axios.post(config.updateToCartURL, params).then(res => {
            if (res.data.success)
                resolve(true)
            else 
                reject(res.data.message)
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const getCart = (payment, delivery) => {
    return new Promise(async (resolve, reject) => {
        const sessId = await getSessionGuid();
        const token = await getUserToken();
        if (!payment) payment = "credit-card"
        if (!delivery) delivery = "delivery"
        const url = `${config.getCartURL}?session_guid=${sessId}&payment_method=${payment}&type=${delivery}`;
        if (token) {
            Axios({
                method: 'get',
                url,
                headers: { 
                    'Authorization': 'Bearer ' + token, 
                    'Content-Type': 'application/json' 
                }
            }).then(res => {
                if (res.data.success === false) {
                    resolve([])
                } else {
                    resolve(res.data)
                }
            }).catch(error => {
                resolve([])
            })
        } else {
            Axios.get(url).then(res => {
                if (res.data.success === false) {
                    resolve([])
                } else {
                    resolve(res.data)
                }
            }).catch(error => {
                resolve([])
            })
        }
    })
}

export const checkout = (params) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'post',
            url: config.checkoutURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: params
        }).then(res => {
            if (res.data.success) {
                resolve(res.data.order_id)
            } else {
                reject(res.data.message)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const updateQTY = (id, amount) => {
    return new Promise(async (resolve, reject) => {
        const sessId = await getSessionGuid();
        Axios.post(config.updateQtyURL, {
            session_guid: sessId,
            unique_id: id,
            qty: amount
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

export const deleteCartItem = (id) => {
    return new Promise(async (resolve, reject) => {
        const sessId = await getSessionGuid();
        Axios.post(config.deleteCartItemURL, {
            session_guid: sessId,
            unique_id: id,
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

export const clearCart = (id) => {
    return new Promise(async (resolve, reject) => {
        const sessId = await getSessionGuid();
        Axios.post(config.clearCartURL, {
            session_guid: sessId
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

export const cancelOrder = (id, interaction_id) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'put',
            url: config.cancelOrderURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            data: {
                order_id: id, 
                interaction_id
            }
        }).then(res => {
            if (res.data.error) {
                reject(res.data.error)
            } else {
                resolve(res.data)
            }
        }).catch(error => {
            reject(error.toString())
        })
    })
}

export const checkAddress = (listingId, addressId) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'post',
            url: config.checkAddressURL,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            },
            params: {
                listing_id: listingId, 
                address_id: addressId
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