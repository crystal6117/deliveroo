import React, { Component } from 'react';
import { View, ActivityIndicator } from 'react-native';
import styles from './styles';
import { getUserToken, getSkipFlag, getSigninInfo, removeAllSessions, getLocationPermissionRole } from '../../utils/session';
import { setSigninUserInfo, setProfileInfo } from '../../actions/signin';
import { getProfileInfo } from '../../apis/user';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';
import { getCart } from '../../apis/cart';
import { setCartInfo } from '../../actions/cart';

class Screen extends Component {
    componentDidMount = async () => {
        const token = await getUserToken();
        const cartInfo = await getCart();
        this.props.setCartInfo(cartInfo);
        if (token) {
            const signinInfo = await getSigninInfo();
            const profileInfo = await getProfileInfo();

            this.props.setSigninUserInfo(signinInfo);
            this.props.setProfileInfo(profileInfo);
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'home' })],
            });
            this.props.navigation.dispatch(resetAction);
        } else {
            const role = await getLocationPermissionRole()
            if (role && role !== 'once-allow') {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'home' })],
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'first' })],
                });
                this.props.navigation.dispatch(resetAction);
            }
        }
        // SplashScreen.hide();
    }

    render() {
        return (
            <View style={styles.splashContainer}>
                <View style={styles.logoContainer}>
                    <ActivityIndicator size="large" />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        setSigninUserInfo: (user) => { dispatch(setSigninUserInfo(user)) },
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) },
        setCartInfo: (cartInfo) => { dispatch(setCartInfo(cartInfo)) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Screen)