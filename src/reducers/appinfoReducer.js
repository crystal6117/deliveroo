import { SET_STATUSBAR_HEIGHT } from '../actions/types';

const initialState = {}

const appinfoReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_STATUSBAR_HEIGHT:
            return {
                ...state,
                statusbarHeight: action.payload
            };

        default:
            return state;
    }
}

export default appinfoReducer;