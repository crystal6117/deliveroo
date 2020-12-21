import config from '../config';
import Axios from 'axios';
import { getUserToken } from '../utils/session';

export const getOrderInteractions = (orderId) => {
    return new Promise(async (resolve, reject) => {
        const token = await getUserToken();
        Axios({
            method: 'get',
            url: `${config.helpInteractionURL}?order_id=${orderId}`,
            headers: { 
                'Authorization': 'Bearer ' + token, 
                'Content-Type': 'application/json' 
            }
        }).then(res => {
            resolve(res.data)
        }).catch(error => {
            reject(error);
        })
    })
}