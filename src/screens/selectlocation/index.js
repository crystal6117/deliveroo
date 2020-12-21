import React, { Component } from 'react';
import { View, Text } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { ceeboAlert } from '../../utils/alert';
import styles from './styles';
import * as RNLocalize from "react-native-localize";

import { GOOGLE_MAP_API_KEY } from '../../config'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { connect } from 'react-redux'
import { translate } from '../../translate';

class SelectLocationScreen extends Component {

    constructor() {
        super();

        const fallback = { languageTag: "en", isRTL: false };
        const { languageTag } = RNLocalize.findBestAvailableLanguage(["en", "it"]) || fallback;

        this.state = {
            selectedAddressFullName: '',
            location: null,
            shortAddressName: '',
            languageTag
        }
    }

    onConfirm() {
        if (!this.state.selectedAddressFullName) {
            ceeboAlert("Please select address", null);
            return;
        }

        this.props.navigation.state.params.returnData(
            this.state.selectedAddressFullName,
            {
                latitude: this.state.location.lat,
                longitude: this.state.location.lng
            },
            this.state.shortAddressName
        )
        this.props.navigation.goBack();
    }

    getShortAddressName(address) {
        const getPartInfo = (type) => {
            const components = address.address_components;
            for (var i = 0; i < components.length; i++) {
                const component = components[i];
                if (component.types.indexOf(type) >= 0) {
                    return component.short_name;
                }
            }
            return '';
        }

        const shortAddressName = getPartInfo('route') + ', ' + getPartInfo('street_number') + ', ' + getPartInfo('locality')
        return shortAddressName;
    }

    render() {
        return (
            <View style={styles.container}>
                <CeeboHeader1
                    left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                    offset={this.props.appInfo.statusbarHeight}
                >
                    <Text style={styles.title}>{translate("select-location")}</Text>
                </CeeboHeader1>

                <View style={styles.maincontainer}>
                    <View style={[styles.contentframe, { paddingTop: 35, flex: 1 }]}>
                        <GooglePlacesAutocomplete
                            placeholder='Enter location'
                            minLength={2} // minimum length of text to search
                            autoFocus={true}
                            returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                            keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
                            listViewDisplayed='auto'    // true/false/undefined
                            fetchDetails={true}
                            renderDescription={row => row.description} // custom description render
                            onPress={async (data, details = null) => { // 'details' is provided when fetchDetails = true
                                // this.setState({selectedAddressFullName: data.description, selectedAddress: details})
                                await this.setState({ selectedAddressFullName: data.description, location: details.geometry.location, shortAddressName: this.getShortAddressName(details) })
                                this.onConfirm();
                            }}

                            getDefaultValue={() => ''}

                            query={{
                                // available options: https://developers.google.com/places/web-service/autocomplete
                                key: GOOGLE_MAP_API_KEY,
                                language: this.state.languageTag, // language of the results
                            }}

                            styles={{
                                container: {
                                    borderWidth: 0,
                                },
                                textInputContainer: {
                                    width: '100%',
                                    backgroundColor: 'white',
                                    borderWidth: 0
                                },
                                description: {
                                    fontWeight: 'bold'
                                },
                                predefinedPlacesDescription: {
                                    color: '#1faadb'
                                }
                            }}

                            currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                            nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                            GoogleReverseGeocodingQuery={{
                                // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                            }}
                            GooglePlacesSearchQuery={{
                                // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                                rankby: 'distance',
                                type: 'cafe'
                            }}

                            GooglePlacesDetailsQuery={{
                                // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
                                fields: 'address_component,geometry',
                            }}

                            filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                            debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                            renderLeftButton={() => null}
                            // renderLeftButton={() => <Image source={require('path/custom/left-icon')} />}
                            renderRightButton={() => null}
                        />
                    </View>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(SelectLocationScreen)