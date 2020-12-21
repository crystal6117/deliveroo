import React, { Component } from 'react';
import { View, Text, Dimensions, Keyboard, Alert, ActivityIndicator, ScrollView, Platform, StatusBar } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, ButtonText } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import { ceeboAlert } from '../../utils/alert';
import * as EmailValidator from 'email-validator';
import styles from './styles';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { setSigninUserInfo, setProfileInfo } from '../../actions/signin';
import { login, getProfileInfo, checkEmail } from '../../apis/user';
import { saveUserToken, saveSigninInfo } from '../../utils/session';
import { StackActions, NavigationActions } from 'react-navigation';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class SigninEmailScreen extends Component {
    constructor() {
        super()
        this.state = {
            loading: false,
            email: '',
            password: '',
            isPassword: false,
            logingin: false,
            keyboardHeight: 0,
            keyboardOpen: false,
            frameHei: 0
        }
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow,
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide,
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = (e) => {
        this.setState({ keyboardOpen: true, keyboardHeight: e.endCoordinates.height })
    }

    _keyboardDidHide = () => {
        this.setState({ keyboardOpen: false, keyboardHeight: 0 })
    }

    async login() {
        if (this.state.loading) {
            return;
        }

        if (this.state.isPassword === false) {
            this.checkEmail();
        } else {
            if (!this.state.email) {
                ceeboAlert(translate("type-email"), null)
                return;
            }

            if (!EmailValidator.validate(this.state.email)) {
                ceeboAlert(translate("invalid-email"), null)
                return
            }

            if (!this.state.password) {
                ceeboAlert(translate("type-your-password"), null)
                return;
            }

            this.setState({ logingin: true });

            try {
                const signinInfo = await login(this.state.email, this.state.password)
                this.props.setSigninUserInfo(signinInfo);
                await saveUserToken(signinInfo.token);
                await saveSigninInfo(signinInfo);

                const profileInfo = await getProfileInfo();
                this.props.setProfileInfo(profileInfo);

                this.setState({ loading: false });
                // this.props.navigation.navigate("main");
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'home' })],
                });
                this.props.navigation.dispatch(resetAction);
            } catch (error) {
                this.setState({ logingin: false });
                setTimeout(() => {
                    ceeboAlert(error, null)
                }, 400)
            }
        }
    }

    gotoSignup() {
        this.props.navigation.navigate('signup', {
            email: this.state.email,
            type: 'general'
        })
    }

    async checkEmail() {
        if (!this.state.email) {
            ceeboAlert(translate("type-email"), null)
            return;
        }

        if (!EmailValidator.validate(this.state.email)) {
            ceeboAlert(translate("invalid-email"), null)
            return
        }

        this.setState({ loading: true });

        const apiRes = await checkEmail(this.state.email);

        this.setState({ loading: false })
        if (apiRes.registered) {
            this.setState({ isPassword: true });
            setTimeout(() => {
                this.passwordInput.focus();
            }, 200)
        } else {
            Alert.alert(
                translate("new-user"),
                translate("non-exist-user-desc"),
                [
                    { text: translate("no-thanks"), onPress: () => { }, style: 'cancel' },
                    { text: translate("signup"), onPress: () => this.gotoSignup(), style: 'default' }
                ],
                { cancelable: false }
            );
        }
    }

    getOffsetHeight() {
        const titleBarHei = 50;
        const scrollViewHei = (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
        // if (this.state.keyboardOpen) {
        //     if (this.state.frameHei > scrollViewHei - this.state.keyboardHeight) {
        //         return 0;
        //     } else {
        //         return scrollViewHei - this.state.keyboardHeight - this.state.frameHei;
        //     }
        // } else {
        //     return scrollViewHei - 86 - this.state.frameHei - (this.state.isPassword ? 34 : 0)
        // }
        return scrollViewHei - 90 - this.state.frameHei
    }

    renderInput() {
        if (this.state.isPassword) {
            return (
                <>
                    <View style={styles.contentframe}>
                        <CeeboInput
                            keyboardType="email-address"
                            placeholder="Email"
                            returnKeyType={"next"}
                            value={this.state.email}
                            onSubmitEditing={() => this.passwordInput.focus()}
                            onChangeText={(email) => this.setState({ email })}
                        />
                        <CeeboInput
                            secureTextEntry
                            placeholder="Password"
                            isLast
                            returnKeyType={"done"}
                            onSubmitEditing={() => this.login()}
                            ref={(input) => this.passwordInput = input}
                            onChangeText={(password) => this.setState({ password })}
                        />
                    </View>
                    {
                        this.state.isPassword && (
                            <View>
                                <View style={{height: 20}} />
                                <Text
                                    style={[styles.subtopic, { color: "#FF5D5D" }]}
                                    onPress={() => this.props.navigation.navigate("forgotpassword")}
                                >{translate("forgot-password")}</Text>
                            </View>
                        )
                    }
                </>
            )
        } else {
            return (
                <View style={styles.contentframe}>
                    <CeeboInput
                        keyboardType="email-address"
                        placeholder="Email"
                        returnKeyType={"done"}
                        onSubmitEditing={() => this.checkEmail()}
                        blurOnSubmit={false}
                        isLast
                        onChangeText={(email) => this.setState({ email })}
                    />
                </View>
            )
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.logingin} textContent={'Log in...'} textStyle={{ color: '#FFF' }} />
                <CeeboHeader1
                    left={{
                        type: 'icon',
                        name: 'arrow-left',
                        size: 25,
                        color: '#FF5D5D',
                        callback: () => this.props.navigation.goBack()
                    }}
                    offset={this.props.appInfo.statusbarHeight}
                >
                    <Text style={styles.title}>{translate("login-register")}</Text>
                </CeeboHeader1>

                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 25 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        {this.renderInput()}
                        <View style={{ paddingTop: 20, alignItems: 'center' }}>
                            {this.state.loading && <ActivityIndicator size="large" />}
                        </View>

                    </View>

                    <View style={{ paddingTop: this.getOffsetHeight() }}>

                        <View style={{ padding: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.login()}
                            >
                                <ButtonText textColor="white" bold>{translate("login")}</ButtonText>
                            </FrameButton>
                        </View>
                    </View>

                    {Platform.OS === 'ios' && <View style={{ height: this.state.keyboardHeight }} />}
                </ScrollView>
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
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SigninEmailScreen)