import React, { Component } from 'react';
import { View, Image, Text, Dimensions, Alert } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, ButtonText } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import styles from './styles';
import { LoginManager, AccessToken, LoginButton } from "react-native-fbsdk";
import { loginWithSocial } from '../../apis/user';
import Toast from 'react-native-simple-toast';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-community/google-signin';
import { connect } from 'react-redux';
import { setSigninUserInfo, setProfileInfo } from '../../actions/signin';
import { saveUserToken, saveSigninInfo } from '../../utils/session';
import { getProfileInfo } from '../../apis/user';
import { StackActions, NavigationActions } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import { EmailIcon } from '../../components/SvgIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';

class SigninScreen extends Component {
    constructor() {
        super()
        this.state = {
            loading: false
        }
    }

    componentDidMount() {
        GoogleSignin.configure();
    }

    socialLogin = async (signinInfo) => {
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
    }

    async googleLogin() {
        try {
            this.setState({ loading: true })
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signIn();
            GoogleSignin.getTokens().then(({ idToken, accessToken }) => {
                loginWithSocial("google", accessToken).then(async res => {
                    await this.socialLogin(res)
                }).catch(error => {
                    this.setState({ loading: false })
                    Toast.show(error);
                })
            }).catch(error => {
                this.setState({ loading: false })
                console.log("ceebo-log-token-error", error)
            });
        } catch (error) {
            this.setState({ loading: false })
            console.log("strange error", error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                console.log("user cancelled the login flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
                console.log(" operation (e.g. sign in) is in progress already");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                console.log("play services not available or outdated")
            } else {
                // some other error happened
                console.log("// some other error happened", error);
            }
        }
    }

    facebookLogin() {
        this.setState({ loading: true })
        LoginManager.logInWithPermissions(["public_profile", "email"]).then(
            (result) => {
                if (result.isCancelled) {
                    this.setState({ loading: false })
                } else {
                    AccessToken.getCurrentAccessToken().then(
                        (token) => {
                            loginWithSocial("facebook", token.accessToken).then(res => {
                                this.socialLogin(res)
                            }).catch(error => {
                                this.setState({ loading: false })
                                setTimeout(() => {
                                    Alert.alert('', error)
                                }, 400)
                            })
                        }
                    ).catch(error => {
                        this.setState({ loading: false })
                        setTimeout(() => {
                            Alert.alert('', error.toString())
                        }, 400);
                    })
                }
            },
            (error) => {
                this.setState({ loading: false })
                setTimeout(() => {
                    Alert.alert(error.toString());
                }, 400)
            }
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent="" textStyle={{ color: '#FFF' }} />
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

                <View style={[styles.maincontainer, { paddingHorizontal: 40 }]}>
                    <View style={styles.socialcontainer}>
                        <GoogleSigninButton
                            style={{ width: '100%', height: 48, marginBottom: 20 }}
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Light}
                            onPress={() => this.googleLogin()}
                        />

                        <View style={{ marginHorizontal: 3 }}>
                            <FrameButton
                                backgroundColor="#4465B2"
                                width='100%'
                                style={{ borderRadius: 5, height: 45 }}
                                onPress={() => this.facebookLogin()}
                            >
                                <View style={{ flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'center' }}>
                                    <EntypoIcon name="facebook" color="white" size={25} />
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <ButtonText textColor="white" bold>Log in With Facebook</ButtonText>
                                    </View>
                                </View>
                            </FrameButton>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', height: 20, alignItems: 'center' }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#707070' }} />
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', marginHorizontal: 15 }}>o</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#707070' }} />
                    </View>

                    <View style={{ paddingVertical: 50 }}>
                        <Text style={styles.subtopic}>
                            <Text style={{ color: "#1A1824" }}>{translate("accept-terms-policy-prefix")}</Text>
                            <Text style={{ color: "#FF5D5D" }} onPress={() => this.props.navigation.navigate("termscondition")}>{translate("terms-condition")}</Text>
                            <Text style={{ color: "#1A1824" }}>{translate("accept-terms-policy-middle")}</Text>
                            <Text style={{ color: "#FF5D5D" }} onPress={() => this.props.navigation.navigate("privacypolicy")}>{translate("privacy-policy")}</Text>
                        </Text>
                    </View>

                    <FrameButton
                        backgroundColor="#FF5D5D"
                        width='100%'
                        style={{ marginBottom: 20 }}
                        onPress={() => this.props.navigation.navigate("signinemail")}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <EmailIcon width={16} height={16} color="white" />
                            <ButtonText textColor="white" bold style={{ marginLeft: 5 }}>{translate("email-login")}</ButtonText>
                        </View>
                    </FrameButton>
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
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SigninScreen)