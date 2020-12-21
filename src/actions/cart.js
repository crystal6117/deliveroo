import { SET_CART_INFO, SET_CART_RESTAURANT_NOTE } from './types';

export const setCartInfo = userInfo => {
    return {
        type: SET_CART_INFO,
        payload: userInfo
    }
}

export const setCartRestaurantNote = note => {
    return {
        type: SET_CART_RESTAURANT_NOTE,
        payload: note
    }
}