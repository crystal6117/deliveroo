import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, Text, Dimensions, TextInput, ScrollView, Keyboard, Platform, StatusBar } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { FrameButton, ButtonText } from '../../components/Button';
import styles from './styles'
import colors from '../../utils/colors';
import Toast from 'react-native-simple-toast';
import { updateAddress } from '../../apis/address';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class BellboyInfoScreen extends Component {
    constructor() {
        super()
        this.state = {
            riderInfo: "",
            phonenumber: "",
            addressId: null,
            loading: false,
            frameHei: 0,
            keyboardOpen: false,
            keyboardHeight: 0
        }
    }

    componentDidMount() {
        const address = this.props.navigation.getParam("address");
        this.setState({ riderInfo: address.notes, phonenumber: address.phone_number, addressId: address.id });

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
        if (this.keyboardDidShowListener) this.keyboardDidShowListener.remove();
        if (this.keyboardDidHideListener) this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = (e) => {
        this.setState({ keyboardOpen: true, keyboardHeight: e.endCoordinates.height })
    }

    _keyboardDidHide = () => {
        this.setState({ keyboardOpen: false, keyboardHeight: 0 })
    }

    async onSaveInfo() {
        if (!this.state.riderInfo) {
            Toast.show(translate("type-rider-information"));
            return;
        }

        this.setState({ loading: true })
        try {
            const res = await updateAddress({
                id: this.state.addressId,
                notes: this.state.riderInfo,
                phone_number: this.state.phonenumber
            })
            this.setState({ loading: false })
            this.props.navigation.state.params.onDone(this.state.riderInfo, this.state.phonenumber);
            this.props.navigation.goBack();
        } catch (error) {
            this.setState({ loading: false })
            Toast.show(error)
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
        //     return scrollViewHei - 86 - this.state.frameHei;
        // }
        return scrollViewHei - 86 - this.state.frameHei;
    }

    render() {
        return (
                <View style={styles.container}>
                    <Spinner visible={this.state.loading} textContent="Saving ..." textStyle={{ color: '#FFF' }} />
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
                        <Text style={styles.title}>{translate("info-deliveryman")}</Text>
                    </CeeboHeader1>

                    <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                        <View onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                            <View style={[styles.contentframe, { height: 100, marginTop: 35, paddingHorizontal: 15 }]}>
                                <TextInput
                                    style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 13, color: 'black', lineHeight: 22 }}
                                    multiline={true}
                                    textAlignVertical="top"
                                    value={this.state.riderInfo}
                                    placeholder={`Inserisci qui le istruzioni per il tuo rider…\n(Es cancellino piccolo sulla destra e salire al primo piano)`}
                                    onChangeText={(riderInfo) => {
                                        if (riderInfo.length <= 140)
                                            this.setState({ riderInfo })
                                    }}
                                />
                            </View>

                            <View style={[styles.contentframe, { height: 52, marginTop: 25, paddingHorizontal: 15, justifyContent: 'center' }]}>
                                <TextInput
                                    style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 13, color: 'black', paddingVertical: 15 }}
                                    textAlignVertical="top"
                                    placeholder={translate("phone-number")}
                                    value={this.state.phonenumber}
                                    onChangeText={(phonenumber) => this.setState({ phonenumber })}
                                />
                            </View>

                            <Text style={{ paddingHorizontal: 15, paddingVertical: 10, fontFamily: 'Circular Std', fontSize: 11, color: '#707070', lineHeight: 15 }}>{`Verrai contattato solo in caso il rider dovesse avere problemi con la consegna del tuo ordine`}</Text>
                        </View>

                        <View style={{ paddingTop: this.getOffsetHeight() }}>
                            <View style={{ padding: 20 }}>
                                <FrameButton
                                    backgroundColor="#FF5D5D"
                                    width='100%'
                                    onPress={() => this.onSaveInfo()}
                                >
                                    <ButtonText textColor="white" bold>{translate("save")}</ButtonText>
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

export default connect(mapStateToProps, null)(BellboyInfoScreen)