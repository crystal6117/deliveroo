import React, { Component } from 'react';
import { View, Text, Dimensions, Keyboard, ScrollView } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, ButtonText } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import Spinner from 'react-native-loading-spinner-overlay';
import { ceeboAlert } from '../../utils/alert';
import styles from './styles';
import Toast from 'react-native-simple-toast';
import { forgotPassword } from '../../apis/user';
import { connect } from 'react-redux';
import * as EmailValidator from 'email-validator';

const screenHei = Dimensions.get('window').height;

class ForgotPasswordScreen extends Component {
    constructor() {
        super()
        this.state = {
            email: '',
            loading: false,
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

    async resetPassword() {
        if (!this.state.email) {
            ceeboAlert(translate("type-email"), null)
            return;
        }

        if (!EmailValidator.validate(this.state.email)) {
            ceeboAlert(translate("invalid-email"), null)
            return
        }

        Keyboard.dismiss()
        this.setState({ loading: true })
        try {
            await forgotPassword(this.state.email);
            this.setState({ loading: false })
            setTimeout(() => Toast.show(translate("email-sent")), 400);
        } catch (error) {
            this.setState({ loading: false })
            setTimeout(() => {
                ceeboAlert(error.toString(), null)
            }, 400)
        }
    }

    getOffsetHeight() {
        const titleBarHei = 50;
        const scrollViewHei = (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
        return scrollViewHei - 90 - this.state.frameHei
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent='' textStyle={{ color: '#FFF' }} />
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
                    <Text style={styles.title}>{translate("forgot-password")}</Text>
                </CeeboHeader1>

                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 25 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        <View style={styles.contentframe}>
                            <CeeboInput
                                keyboardType="email-address"
                                placeholder="Email"
                                returnKeyType={"done"}
                                onSubmitEditing={() => Keyboard.dismiss()}
                                blurOnSubmit={false}
                                isLast
                                onChangeText={(email) => this.setState({ email })}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 13, lineHeight: 21, color: '#3C3C43' }}>{translate("resetpassworddesc")}</Text>
                        </View>
                        <View style={{paddingTop: 30 }}>
                            <Text style={styles.subtopic}>
                                <Text
                                    style={{ color: "#FF5D5D" }}
                                    onPress={() => this.props.navigation.goBack()}
                                >{translate("backtologin")}</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={{ paddingTop: this.getOffsetHeight() }}>

                        <View style={{ padding: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.resetPassword()}
                                style={{ marginBottom: 20 }}
                            >
                                <ButtonText textColor="white" bold>{translate("resetpassword")}</ButtonText>
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

export default connect(mapStateToProps, null)(ForgotPasswordScreen)