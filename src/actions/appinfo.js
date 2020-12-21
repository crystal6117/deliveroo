import {
    SET_STATUSBAR_HEIGHT
} from './types';

export const setStatusbarHeight = statusbarHeight => {
    return {
        type: SET_STATUSBAR_HEIGHT,
        payload: statusbarHeight
    }
}