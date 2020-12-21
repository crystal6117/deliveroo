import { createStore, combineReducers } from 'redux';
import signinReducer from './reducers/signinReducer';
import cartReducer from './reducers/cartReducer';
import locationReducer from './reducers/locationReducer';
import appinfoReducer from './reducers/appinfoReducer';

const rootReducer = combineReducers({
    signin: signinReducer,
    cart: cartReducer,
    locationInfo: locationReducer,
    appInfo: appinfoReducer
})

export default configureStore = () => {
    return createStore(rootReducer)
}