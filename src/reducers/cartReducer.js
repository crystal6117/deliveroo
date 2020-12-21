import { SET_CART_INFO, SET_CART_RESTAURANT_NOTE } from '../actions/types';

const initialState = {}

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CART_INFO:
            return {
                ...state,
                cartInfo: action.payload
            };
        case SET_CART_RESTAURANT_NOTE:
            return {
                ...state,
                restaurantNote: action.payload
            }
        default:
            return state;
    }
}

export default cartReducer;