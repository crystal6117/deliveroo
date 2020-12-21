import React, { Component } from 'react';
import { View, Text, Dimensions, ImageBackground, Alert, TouchableOpacity } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, FlatButton, ButtonText } from '../../components/Button';
import mapBack from '../../../assets/images/map1.png';
import FeatherIcon from 'react-native-vector-icons/Feather'
import styles from './styles';
import { saveAddress, saveAddressLocation, saveLocationPermissionRole } from '../../utils/session';
import { ceeboAlert } from '../../utils/alert';
import { connect } from 'react-redux';

const screenWid = Dimensions.get('window').width;

class ManualAddressScreen extends Component {
    constructor() {
        super()
        this.state = {
            address: "",
            location: null,
            shortAddress: ""
        }
    }

    selectAddress() {
        const res = this.props.navigation.navigate("selectlocation", {
            returnData: (address, location, shortAddress) => {
                this.setState({ address, location, shortAddress })
            }
        });
    }

    async onSaveAddress() {
        if (!this.state.address) {
            Alert.alert(translate("enter-address"), translate("enter-address-desc"))
            return;
        }

        await saveLocationPermissionRole("notallow");
        await saveAddress(this.state.shortAddress);
        await saveAddressLocation(this.state.location);
        this.props.navigation.navigate('home');
    }

    render() {
        return (
            <ImageBackground style={styles.container} source={mapBack} imageStyle={{ resizeMode: 'cover', overflow: 'hidden', backgroundColor: '#E4E4E4' }}>
                <View style={styles.content}>
                    <View style={styles.maincontent}>
                        <Text style={styles.title}>{translate("address-manually-title")}</Text>
                        <Text style={styles.desc}>{translate("address-manually-desc")}</Text>

                        <View style={{ paddingVertical: 30, paddingHorizontal: 10 }}>
                            <TouchableOpacity style={{
                                borderBottomWidth: 1,
                                borderColor: '#EFEFEF',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                                onPress={() => this.selectAddress()}>
                                <FeatherIcon name="send" size={20} color="#707070" />
                                <Text style={{ flex: 1, paddingVertical: 15, paddingLeft: 10, fontSize: 17, fontFamily: 'Circular Std', color: this.state.shortAddress ? "black" : 'lightgray' }}>{this.state.shortAddress ? this.state.shortAddress : translate("enter-location")}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.onSaveAddress()}
                            >
                                <ButtonText textColor="white">{translate("confirm")}</ButtonText>
                            </FrameButton>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(ManualAddressScreen)