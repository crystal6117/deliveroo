import React, { Component } from 'react';
import { View, Image, Text, Dimensions, PermissionsAndroid } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, FlatButton, ButtonText } from '../../components/Button';
import logoImg from '../../../assets/images/logo.png';
import styles from './styles';
import { getLocationPermissionRole, saveLocationPermissionRole, setSkipFlag } from '../../utils/session';
import SplashScreen from 'react-native-splash-screen';
import { CeeboLogo } from '../../components/SvgIcons';

class FirstScreen extends Component {
    constructor() {
        super()
        this.state = {
            
        }

        this.screenWid = Dimensions.get('window').width;
        this.logoWid = this.screenWid * 0.232;
    }

    componentDidMount() {
        SplashScreen.hide();
    }

    async onBtnSkip() {
        const role = await getLocationPermissionRole();

        if (!role) {
            this.props.navigation.navigate('locationaddress', {
                onDone: async (res) => {
    
                    if (res === 'notallow') {
                        this.props.navigation.navigate("manualaddress");
                    } else if (res === 'always-allow') {
                        await saveLocationPermissionRole(res);
                        this.props.navigation.navigate("home");
                    }
                }
            })
        } else {
            this.props.navigation.navigate("home");
        }
    }

    render() {
        return (
            <View style={styles.splashContainer}>
                <View style={styles.logoContainer}>
                    <CeeboLogo />
                </View>
                <View style={styles.restLogo}>
                    <View style={{paddingHorizontal: 40}}>
                        <FrameButton backgroundColor="#FF5D5D" width={this.screenWid - 80} onPress={() => this.props.navigation.navigate('signinlist')}>
                            <ButtonText textColor="white">{translate("login-register")}</ButtonText>
                        </FrameButton>

                        <FlatButton style={{marginTop: 15}} onPress={() => this.onBtnSkip()}>
                            <ButtonText textColor="black">{translate("btn-salta")}</ButtonText>
                        </FlatButton>
                    </View>
                </View>
            </View>
        )
    }
}

export default FirstScreen;