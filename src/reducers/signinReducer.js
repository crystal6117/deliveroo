import { SET_SIGNIN_USER_INFO, SET_PROFILE_INFO } from '../actions/types';

const initialState = {}

const signinReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SIGNIN_USER_INFO:
            return {
                ...state,
                signed_user_info: action.payload
            };
        
        case SET_PROFILE_INFO:
            return {
                ...state,
                profile_info: action.payload
            }

        default:
            return state;
    }
}

export default signinReducer;