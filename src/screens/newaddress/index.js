import React, { Component } from 'react';
import { View, Text, Dimensions, Keyboard, ScrollView, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, ButtonText } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import { ceeboAlert } from '../../utils/alert';
import styles from './styles';
import { Divider } from '../../components/Divider';
import Spinner from 'react-native-loading-spinner-overlay';
import { createAddress, updateAddress, deleteAddress } from '../../apis/address';
import { connect } from 'react-redux'
import { setDeleteAddressFlag } from '../../actions/location'

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class NewAddressScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // apartment: '',
            addressName: '',
            bellboyInfo: '',
            phone_number: '',
            fullAddress: "",
            keyboardOpen: false,
            // address: null,
            address2: '',
            default: false,
            id: '',
            loading: false,
            loadingStr: '',
            keyboardHeight: 0,
            frameHei: 0,
            short_address: null
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

        const address = this.props.navigation.getParam("address")
        if (address) {
            if (address.phone_number) this.setState({ phone_number: address.phone_number });
            if (address.name) this.setState({ addressName: address.name });
            if (address.notes) this.setState({ bellboyInfo: address.notes });
            if (address.formatted_address) this.setState({ fullAddress: address.formatted_address });
            if (address.detailed_address.street_address_2) this.setState({ address2: address.detailed_address.street_address_2 });
            this.setState({ default: address.default, id: address.id, short_address: address.short_address });
        }
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

    async deleteAddress() {
        this.setState({ loading: true, loadingStr: '' });
        try {
            await deleteAddress(this.state.id)
            this.props.setDeleteAddressFlag(this.state.short_address)
            await this.props.navigation.state.params.refreshProfile()
            this.setState({ loading: false })
            this.props.navigation.goBack();
        } catch (error) {
            this.setState({ loading: false })
            setTimeout(() => {
                ceeboAlert(error, null)
            }, 400)
        }
    }

    onDeleteAddress() {
        Alert.alert(
            "Ceebo",
            translate("sure-delete-address"),
            [
                { text: "No", onPress: () => { } },
                { text: translate("yes"), onPress: () => this.deleteAddress() }
            ],
            { cancelable: true }
        );
    }

    async onAddAddress() {
        if (this.state.loading) {
            return;
        }

        if (!this.state.fullAddress) {
            ceeboAlert(translate("type-address"), null);
            return;
        }

        if (!this.state.addressName) {
            ceeboAlert(translate("type-name"), null);
            return;
        }

        if (!this.state.address2) {
            ceeboAlert(translate("type-street-address"), null);
            return;
        }

        if (!this.state.phone_number) {
            ceeboAlert(translate("type-phone-number"), null);
            return;
        }

        this.setState({ loading: true, loadingStr: '' });
        try {
            if (this.state.id) {
                await updateAddress({
                    id: this.state.id,
                    name: this.state.addressName,
                    phone_number: this.state.phone_number,
                    notes: this.state.bellboyInfo,
                    default: this.state.default ? "1" : "0",
                    street_address_2: this.state.address2
                });
                this.props.setDeleteAddressFlag(this.state.short_address)
            } else {
                await createAddress({
                    name: this.state.addressName,
                    phone_number: this.state.phone_number,
                    notes: this.state.bellboyInfo,
                    default: this.state.default ? "1" : "0",
                    address: this.state.fullAddress,
                    street_address_2: this.state.address2
                })
            }
            this.setState({ loading: false })
            this.props.navigation.goBack();
            await this.props.navigation.state.params.refreshProfile()
        } catch (error) {
            this.setState({ loading: false })
            setTimeout(() => {
                ceeboAlert(error, null)
            }, 400)
        }
    }

    onSelectAddress() {
        this.props.navigation.navigate("selectlocation", {
            returnData: (address) => {
                this.setState({ fullAddress: address })
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
                <Spinner visible={this.state.loading} textContent={this.state.loadingStr} textStyle={{ color: '#FFF' }} />
                {
                    this.state.id ? (
                        <CeeboHeader1
                            left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                            right={{ type: 'text', name: translate("delete"), fontFamily: 'Circular Std', size: 16, color: '#FF5D5D', callback: () => this.onDeleteAddress() }}
                            offset={this.props.appInfo.statusbarHeight}
                        >
                            <Text style={styles.title}>{this.state.id ? translate("update-address") : translate("new-address")}</Text>
                        </CeeboHeader1>
                    ) : (
                            <CeeboHeader1
                                left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                                offset={this.props.appInfo.statusbarHeight}
                            >
                                <Text style={styles.title}>{translate("new-address")}</Text>
                            </CeeboHeader1>
                        )
                }

                <ScrollView style={{ flex: 1 }} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 35 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        <View style={styles.contentframe}>
                            {
                                this.state.id ? (
                                    <View style={{ height: 50, backgroundColor: 'white', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 17, color: 'gray', fontFamily: 'Circular Std' }}>{this.state.fullAddress}</Text>
                                    </View>
                                ) : (
                                        <TouchableOpacity style={{ height: 50, backgroundColor: 'white', justifyContent: 'center' }} onPress={() => this.onSelectAddress()}>
                                            {this.state.fullAddress ? (
                                                <Text style={{ fontSize: 17, color: 'black', fontFamily: 'Circular Std' }} numberOfLines={1}>{this.state.fullAddress}</Text>
                                            ) : (
                                                    <Text style={{ fontSize: 17, color: 'lightgray', fontFamily: 'Circular Std' }}>{translate("full-address")}</Text>
                                                )}
                                        </TouchableOpacity>
                                    )
                            }

                            {
                                this.state.fullAddress ? (
                                    <>
                                        <Divider />
                                        <CeeboInput
                                            placeholder={translate("address-name")}
                                            blurOnSubmit={false}
                                            returnKeyType={"next"}
                                            onSubmitEditing={() => this.address2InputRef.focus()}
                                            value={this.state.addressName}
                                            onChangeText={(addressName) => this.setState({ addressName })}
                                        />
                                        <CeeboInput
                                            ref={ref => this.address2InputRef = ref}
                                            placeholder={translate("apartment-number")}
                                            blurOnSubmit={false}
                                            keyboardType="number-pad"
                                            value={this.state.address2}
                                            returnKeyType={"next"}
                                            onSubmitEditing={() => this.phoneInputRef.focus()}
                                            onChangeText={(address2) => this.setState({ address2 })}
                                        />
                                        <CeeboInput
                                            ref={ref => this.phoneInputRef = ref}
                                            placeholder={translate("phone-number")}
                                            keyboardType="phone-pad"
                                            blurOnSubmit={false}
                                            returnKeyType={"next"}
                                            onSubmitEditing={() => this.bellboyInputRef.focus()}
                                            value={this.state.phone_number}
                                            onChangeText={(phone_number) => this.setState({ phone_number })}
                                        />
                                    </>
                                ) : (null)
                            }
                        </View>

                        {
                            this.state.fullAddress ? (
                                <View style={{ marginTop: 35 }}>
                                    <Text style={{ paddingHorizontal: 15, fontFamily: "Circular Std", color: '#3C3C43', fontSize: 13, lineHeight: 22 }}>{translate("bellboy-desc")}</Text>
                                    <View style={[styles.contentframe, { height: 100, marginTop: 10 }]}>
                                        <TextInput
                                            style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 13, color: 'black', lineHeight: 22 }}
                                            multiline={true}
                                            ref={ref => this.bellboyInputRef = ref}
                                            textAlignVertical="top"
                                            value={this.state.bellboyInfo}
                                            returnKeyType={"done"}
                                            onSubmitEditing={() => Keyboard.dismiss()}
                                            placeholder={`${translate("bellboy-instruction-insert")}\n\n${translate("bellboy-instruction-example")}`}
                                            onChangeText={(bellboyInfo) => {
                                                if (bellboyInfo.length <= 140) {
                                                    this.setState({ bellboyInfo })
                                                }
                                            }}
                                        />
                                    </View>
                                </View>
                            ) : (null)
                        }
                    </View>

                    {
                        this.state.fullAddress ? (
                            <View style={{ paddingTop: this.getOffsetHeight() }}>
                                <View style={{ padding: 20 }}>
                                    <FrameButton
                                        backgroundColor="#FF5D5D"
                                        width='100%'
                                        onPress={() => this.onAddAddress()}
                                    >
                                        <ButtonText textColor="white" bold>{this.state.id ? translate("update-address") : translate("add-address")}</ButtonText>
                                    </FrameButton>
                                </View>
                            </View>
                        ) : (null)
                    }
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
        setDeleteAddressFlag: (flag) => { dispatch(setDeleteAddressFlag(flag)) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAddressScreen)