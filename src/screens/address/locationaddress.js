import React, { Component } from 'react';
import { View, Text, Dimensions, ImageBackground, Alert, Platform } from 'react-native';
import { translate } from '../../translate';
import { FrameButton, FlatButton, ButtonText } from '../../components/Button';
import mapBack from '../../../assets/images/map.png';
import styles from './styles';
import { connect } from 'react-redux';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

const screenWid = Dimensions.get('window').width;

class LocationAddressScreen extends Component {
    onComplete(res) {
        this.props.navigation.goBack();
        this.props.navigation.state.params.onDone(res)
    }

    // requestLocationPermission() {
    //     Alert.alert(
    //         translate("location-permission-title"),
    //         translate("location-permission-desc"),
    //         [
    //             { text: translate("notallow"), onPress: () => this.onComplete("notallow") },
    //             { text: translate("once-allow"), onPress: () => this.onComplete("once-allow") },
    //             { text: translate("always-allow"), onPress: () => this.onComplete("always-allow") },
    //         ],
    //         { cancelable: false }
    //     );
    // }

    async onRequestLocationPermission() {
        request(
            Platform.select({
                android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
            }),
        ).then(result => {
            switch(result) {
                case RESULTS.UNAVAILABLE:
                case RESULTS.DENIED:
                case RESULTS.BLOCKED:
                    this.onComplete("notallow");
                    break;
                case RESULTS.GRANTED:
                    this.onComplete("always-allow");
                    break;
                default :
                    break;
            }
        })
    }

    render() {
        return (
            <ImageBackground style={styles.container} source={mapBack} imageStyle={{ resizeMode: 'cover', overflow: 'hidden', backgroundColor: '#E4E4E4' }}>
                <View style={styles.content}>
                    <View style={styles.maincontent}>
                        <Text style={styles.title}>{translate("location-service-title")}</Text>
                        <Text style={styles.desc}>{translate("location-service-desc")}</Text>
                        <View style={{ marginTop: 30, alignItems: 'center' }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.onRequestLocationPermission()}
                                style={{ marginBottom: 10 }}
                            >
                                <ButtonText textColor="white">{translate("allow")}</ButtonText>
                            </FrameButton>

                            <FlatButton
                                width='100%'
                                onPress={() => this.props.navigation.navigate("manualaddress")}
                            >
                                <ButtonText textColor="#1A1824">{translate("notallow")}</ButtonText>
                            </FlatButton>
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

export default connect(mapStateToProps, null)(LocationAddressScreen)