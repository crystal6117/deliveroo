/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './src/store';

const store = configureStore();

const CeeboRedux = () => (
    <Provider store={store}><App /></Provider>
)

AppRegistry.registerComponent(appName, () => CeeboRedux);
