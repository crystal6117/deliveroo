import { SET_SIGNIN_USER_INFO, SET_PROFILE_INFO } from './types';

export const setSigninUserInfo = userInfo => {
    return {
        type: SET_SIGNIN_USER_INFO,
        payload: userInfo
    }
}

export const setProfileInfo = profileInfo => {
    return {
        type: SET_PROFILE_INFO,
        payload: profileInfo
    }
}