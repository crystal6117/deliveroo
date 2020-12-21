import React, { Component } from 'react';
import { Text, StatusBar, NativeModules, Platform } from 'react-native';
import AppContainer from './src/routers';
import * as RNLocalize from "react-native-localize";
import { setI18nConfig } from './src/translate';
import {connect} from 'react-redux';
import { setStatusbarHeight } from './src/actions/appinfo';

const { StatusBarManager } = NativeModules

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
        setI18nConfig(); // set initial config
    }

    async componentDidMount() {
        Text.defaultProps = Text.defaultProps || {};
        Text.defaultProps.allowFontScaling = false;

        RNLocalize.addEventListener("change", this.handleLocalizationChange);

        if (Platform.OS === 'ios') {
            StatusBarManager.getHeight(response => {
                this.props.setStatusbarHeight(response.height);
                this.setState({loading: false})
            })
        } else {
            this.props.setStatusbarHeight(StatusBar.currentHeight);
            this.setState({loading: false})
        }
    }

    componentWillUnmount() {
        RNLocalize.removeEventListener("change", this.handleLocalizationChange);
    }

    handleLocalizationChange = () => {
        setI18nConfig();
        this.forceUpdate();
    };

    render() {
        return this.state.loading ? null : (
            <>
                <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
                <AppContainer />
            </>
        )
    }
}

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        setStatusbarHeight: (height) => { dispatch(setStatusbarHeight(height)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)