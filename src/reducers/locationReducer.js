import { SET_CURRENT_LOCATION, SET_CURRENT_ADDRESS_STATUS, SET_DELETE_ADDRESS_FLAG } from '../actions/types';

const initialState = {}

const locationReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_LOCATION:
            return {
                ...state,
                userLocation: action.payload
            };
        case SET_CURRENT_ADDRESS_STATUS:
            return {
                ...state,
                addressStatus: action.payload
            }
        case SET_DELETE_ADDRESS_FLAG:
            return {
                ...state,
                deletedAddress: action.payload
            }

        default:
            return state;
    }
}

export default locationReducer;