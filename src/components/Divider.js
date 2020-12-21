import React from 'react';
import { View } from 'react-native';
import colors from '../utils/colors';

export const Divider = (props) => (<View style={{height: 1, backgroundColor: colors.lightgray, marginLeft: props.left ? props.left : 0}} />)