import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, TextInput, Alert, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { FrameButton, ButtonText } from '../../components/Button';
import { Divider } from '../../components/Divider';
import styles from './styles';
import OpenAppSettings from 'react-native-app-settings'
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-picker';
import { updateAvatar, getProfileInfo, updateAccount } from '../../apis/user';
import { setProfileInfo } from '../../actions/signin'
import { ceeboAlert } from '../../utils/alert';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import FastImage from 'react-native-fast-image'

const screenHei = Dimensions.get('window').height;

class ProfileScreen extends Component {
    constructor(props) {
        super(props);
        const profile = props.profileInfo.data
        this.state = {
            image_url: profile.image_url,
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone_number: profile.phone_number,
            email: profile.email,
            keyboardOpen: false,
            keyboardHeight: 0,
            saving: false,
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

    onSaveProfile() {
        if (this.state.loading) return ;
        if (!this.state.first_name) {
            ceeboAlert(translate("type-your-firstname"));
            return;
        }

        if (!this.state.last_name) {
            ceeboAlert(translate("type-your-lastname"));
            return;
        }

        const data = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            email: this.state.email,
            phone_number: this.state.phone_number
        }

        this.setState({ saving: true })
        updateAccount(data).then(async res => {
            const profileInfo = await getProfileInfo();
            this.props.setProfileInfo(profileInfo);
            this.setState({ saving: false })
            Toast.show(translate("account-updated-successfully"))
        }).catch(error => {
            this.setState({ saving: false })
            setTimeout(() => {
                ceeboAlert(error);
            }, 400)
        })
    }

    onUpdateAvatar() {
        const options = {
            title: translate("change-photo"),
            takePhotoButtonTitle: translate("take-photo"),
            chooseFromLibraryButtonTitle: translate("choose-from-lib"),
            cancelButtonTitle: translate("cancel"),
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {

                const form = new FormData();
                const data = `data:${response.type};base64,${response.data}`;
                form.append("base64", data)

                this.setState({ saving: true })
                updateAvatar(form).then(async res => {
                    this.setState({image_url: data})
                    const profileInfo = await getProfileInfo();
                    this.props.setProfileInfo(profileInfo);
                    this.setState({ saving: false })
                    Toast.show(translate("avatar-updated-successfully"));
                }).catch(error => {
                    this.setState({ saving: false })
                    setTimeout(() => {
                        ceeboAlert(error);
                    }, 400)
                })
            }
        });
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
        //     return scrollViewHei - 86 - this.state.frameHei;
        // }
        return scrollViewHei - 86 - this.state.frameHei;
    }

    render() {

        return (
            <View style={styles.container}>
                <CeeboHeader1
                    left={{
                        type: 'icon',
                        name: 'arrow-left',
                        size: 25,
                        color: '#FF5D5D',
                        callback: () => this.props.navigation.goBack()
                    }}
                    offset={this.props.appInfo.statusbarHeight}
                    noBack
                >
                    <Text style={styles.title}>{translate("profile")}</Text>
                </CeeboHeader1>
                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => this.onUpdateAvatar()}>
                                <FastImage source={{ uri: this.state.image_url }} style={{ width: 87, height: 87, backgroundColor: 'lightgray', borderRadius: 45 }} />
                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: 'black', marginTop: 10, textAlign: 'center' }}>{translate("change-photo")}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contentframe}>
                            <View style={{ height: 65, padding: 10, paddingLeft: 0 }}>
                                <Text style={styles.placeholder}>{translate("firstname")}</Text>
                                <TextInput
                                    style={styles.inputText}
                                    value={this.state.first_name}
                                    onChangeText={(first_name) => this.setState({ first_name })} />
                            </View>
                            <Divider />
                            <View style={{ height: 65, padding: 10, paddingLeft: 0 }}>
                                <Text style={styles.placeholder}>{translate("surname")}</Text>
                                <TextInput
                                    style={styles.inputText}
                                    value={this.state.last_name}
                                    onChangeText={(last_name) => this.setState({ last_name })} />
                            </View>
                            <Divider />
                            <View style={{ height: 65, padding: 10, paddingLeft: 0 }}>
                                <Text style={styles.placeholder}>Email</Text>
                                <TextInput
                                    keyboardType="email-address" style={styles.inputText} value={this.state.email} editable={false} />
                            </View>
                            <Divider />
                            <View style={{ height: 65, padding: 10, paddingLeft: 0 }}>
                                <Text style={styles.placeholder}>{translate("telephone")}</Text>
                                <TextInput style={styles.inputText} keyboardType="phone-pad" value={this.state.phone_number} onChangeText={(phone_number) => this.setState({ phone_number })} />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.contentframe, { height: 50, alignItems: 'center', flexDirection: 'row', marginVertical: 30 }]}
                            onPress={() => OpenAppSettings.open()}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', flex: 1 }}>{translate("go-to-location-setting")}</Text>
                            <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingTop: this.getOffsetHeight() }}>
                        <View style={{ padding: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.onSaveProfile()}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {this.state.saving ? (<ActivityIndicator style={{marginRight: 10}} color="white" size="small" />) : (null)}
                                    <ButtonText textColor="white">{translate(this.state.saving ? "saving" : "save")}</ButtonText>
                                </View>
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
    return {
        profileInfo: state.signin.profile_info,
        ...state
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen)