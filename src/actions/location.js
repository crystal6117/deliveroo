import { SET_CURRENT_LOCATION, SET_CURRENT_ADDRESS_STATUS, SET_DELETE_ADDRESS_FLAG } from './types';

export const setCurrentLocation = (location) => {
    return {
        type: SET_CURRENT_LOCATION,
        payload: location
    }
}

export const setCurrentAddressStatus = (status) => {
    return {
        type: SET_CURRENT_ADDRESS_STATUS,
        payload: status
    }
}

export const setDeleteAddressFlag = (flag) => {
    return {
        type: SET_DELETE_ADDRESS_FLAG,
        payload: flag
    }
}