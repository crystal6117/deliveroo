import React, { Component } from 'react';
import { View, Text, Dimensions, Keyboard, ScrollView, Alert } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, ButtonText } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import { ceeboAlert } from '../../utils/alert';
import * as EmailValidator from 'email-validator';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from './styles';
import { signup, getProfileInfo } from '../../apis/user';
import { saveUserToken } from '../../utils/session';
import { setSigninUserInfo, setProfileInfo } from '../../actions/signin';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';

const screenHei = Dimensions.get('window').height;

class SignupScreen extends Component {
    constructor() {
        super()
        this.state = {
            firstname: '',
            surname: '',
            email: '',
            password: '',
            keyboardOpen: false,
            loading: false,
            frameHei: 0,
            labHei: 0
        }
    }

    componentDidMount() {
        const signupType = this.props.navigation.getParam("type")

        if (signupType) {
            const email = this.props.navigation.getParam("email")
            this.setState({ email })
        }

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
        this.setState({ keyboardOpen: true })
    }

    _keyboardDidHide = () => {
        this.setState({ keyboardOpen: false })
    }

    async signup() {
        Keyboard.dismiss()

        if (!this.state.firstname) {
            ceeboAlert(translate("type-your-firstname"), null)
            this.firstnameInput.focus();
            return;
        }

        if (!this.state.surname) {
            ceeboAlert(translate("type-your-lastname"), null)
            this.surnameInput.focus();
            return;
        }

        if (!this.state.email) {
            ceeboAlert(translate("type-email"), null)
            this.emailInput.focus();
            return;
        }

        if (!EmailValidator.validate(this.state.email)) {
            ceeboAlert(translate("invalid-email"), null)
            this.emailInput.focus();
            return
        }

        if (!this.state.password) {
            ceeboAlert(translate("type-your-password"), null)
            this.passwordInput.focus();
            return;
        }

        // sign up process
        this.setState({ loading: true })
        try {
            const signinInfo = await signup(
                this.state.email,
                this.state.firstname,
                this.state.surname,
                this.state.password
            )

            this.props.setSigninUserInfo(signinInfo);
            await saveUserToken(signinInfo.token)

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
            this.setState({ loading: false })
            setTimeout(() => {
                Alert.alert(
                    translate("signup-failed"),
                    error,
                    [
                        { text: translate("confirm"), onPress: () => { } }
                    ],
                    { cancelable: false }
                );
            }, 400)
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
        return scrollViewHei - 86 - this.state.labHei - this.state.frameHei
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent={''} textStyle={{ color: '#FFF' }} />
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
                    <View style={{ paddingTop: 35 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        <View style={styles.contentframe}>
                            <CeeboInput
                                placeholder={translate("firstname")}
                                returnKeyType={"next"}
                                ref={(input) => this.firstnameInput = input}
                                onSubmitEditing={() => this.surnameInput.focus()}
                                blurOnSubmit={false}
                                value={this.state.firstname}
                                onChangeText={(firstname) => this.setState({ firstname })}
                            />
                            <CeeboInput
                                ref={(input) => this.surnameInput = input}
                                placeholder={translate("surname")}
                                returnKeyType={"next"}
                                onSubmitEditing={() => this.emailInput.focus()}
                                blurOnSubmit={false}
                                value={this.state.surname}
                                onChangeText={(surname) => this.setState({ surname })}
                            />
                            <CeeboInput
                                keyboardType="email-address"
                                ref={(input) => this.emailInput = input}
                                placeholder="Email"
                                returnKeyType={"next"}
                                onSubmitEditing={() => this.passwordInput.focus()}
                                blurOnSubmit={false}
                                value={this.state.email}
                                onChangeText={(email) => this.setState({ email })}
                            />
                            <CeeboInput
                                secureTextEntry
                                placeholder="Password"
                                isLast
                                ref={(input) => this.passwordInput = input}
                                returnKeyType={"done"}
                                value={this.state.password}
                                onChangeText={(password) => this.setState({ password })}
                                onSubmitEditing={() => this.signup()}
                                blurOnSubmit={false}
                            />
                        </View>
                    </View>

                    <View style={{ paddingTop: this.getOffsetHeight() }}>
                        <View style={{ paddingHorizontal: 40 }} onLayout={event => this.setState({labHei: event.nativeEvent.layout.height})}>
                            <Text style={styles.subtopic}>
                                <Text style={{ color: "#1A1824" }}>{translate("accept-terms-policy-prefix")}</Text>
                                <Text style={{ color: "#FF5D5D" }} onPress={() => this.props.navigation.navigate("termscondition")}>{translate("terms-condition")}</Text>
                                <Text style={{ color: "#1A1824" }}>{translate("accept-terms-policy-middle")}</Text>
                                <Text style={{ color: "#FF5D5D" }} onPress={() => this.props.navigation.navigate("privacypolicy")}>{translate("privacy-policy")}</Text>
                            </Text>
                        </View>

                        <View style={{ padding: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.signup()}
                            >
                                <ButtonText textColor="white" bold>{translate("signup")}</ButtonText>
                            </FrameButton>
                        </View>
                    </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(SignupScreen)