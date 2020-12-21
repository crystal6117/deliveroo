import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, StatusBar, Image, Animated, ActivityIndicator, Linking } from 'react-native';
import styles from './styles'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { connect } from 'react-redux';
import EntypoIcon from 'react-native-vector-icons/Entypo'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { RoundButton } from '../../components/Button';

class GoogleMapScreen extends Component {
    constructor(props) {
        super(props)
        const restaurant = props.navigation.getParam("restaurant");
        this.state = {
            latitude: parseFloat(restaurant.location.lat),
            longitude: parseFloat(restaurant.location.lng),
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                    style={{ flex: 1 }}
                    region={{
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                >
                    <Marker coordinate={{
                        latitude: this.state.latitude,
                        longitude: this.state.longitude
                    }}>
                        <View style={{ width: 30, height: 30, borderRadius: 25, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: 'center' }}>
                            <EntypoIcon name="location-pin" size={20} color="white" />
                        </View>
                    </Marker>
                </MapView>
                <View
                    style={{
                        position: 'absolute',
                        top: 15 + this.props.appInfo.statusbarHeight,
                        left: 10,
                        zIndex: 2
                    }}
                >
                    <RoundButton onPress={() => this.props.navigation.goBack()} style={styles.shadow}>
                        <FeatherIcon name="arrow-left" color="#FF5D5D" size={25} />
                    </RoundButton>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(GoogleMapScreen)