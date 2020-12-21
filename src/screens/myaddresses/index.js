import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { Divider } from '../../components/Divider';
import styles from './styles';
import { getProfileInfo } from '../../apis/user'
import { setProfileInfo } from '../../actions/signin';
import { LocationIcon } from '../../components/SvgIcons';
import { connect } from 'react-redux';
import { checkAddress } from '../../apis/cart';
import Spinner from 'react-native-loading-spinner-overlay';
import { getAddresses } from '../../apis/address';

class MyAddressScreen extends Component {
    constructor() {
        super();
        this.state = {
            addresses: [],
            defaultAddressNo: 0,
            isSelectAddress: false,
            checking: false
        }
    }

    async componentDidMount() {
        const isSelectAddress = this.props.navigation.getParam("selectAddress");
        if (isSelectAddress) {
            this.setState({ isSelectAddress, checking: false })
        } else {
            this.setState({ isSelectAddress: false, checking: false })
        }
    }

    onSelect = async (address, index) => {
        if (this.state.isSelectAddress) {
            if (!this.props.cart.cartInfo) {
                Alert.alert('', translate("no-cart"));
                return ;
            }
            this.setState({checking: true})
            const listingId = this.props.cart.cartInfo.listing.id;
            try {
                await checkAddress(listingId, address.id);
                this.setState({checking: false});
                this.props.navigation.state.params.onDone(address)
                this.props.navigation.goBack();
            } catch(error) {
                this.setState({checking: false});
                setTimeout(() => {
                    Alert.alert('', error);
                }, 400)
            }
        } else {
            this.onEditAddress(index)
        }
    }

    onSetDefaultAddress(index) {
        this.setState({ defaultAddressNo: index })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            addresses: nextProps.profileInfo.addresses
        }
    }

    async onReloadProfile() {
        const profileInfo = await getProfileInfo();
        this.props.setProfileInfo(profileInfo);
    }

    onEditAddress(index) {
        this.props.navigation.navigate("newaddress", { address: this.state.addresses[index], refreshProfile: async () => await this.onReloadProfile() });
    }

    onNewAddress() {
        this.props.navigation.navigate("newaddress", { refreshProfile: async () => await this.onReloadProfile() });
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.checking} textContent="" textStyle={{ color: '#FFF' }} /> 
                <CeeboHeader1
                    left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                    offset={this.props.appInfo.statusbarHeight}
                >
                    <Text style={styles.title}>{translate("myaddresses")}</Text>
                </CeeboHeader1>
                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingVertical: 35 }}>
                        {
                            (this.state.addresses && this.state.addresses.length > 0) ? (
                                <View style={styles.contentframe}>
                                    {
                                        this.state.addresses.map((item, index) => (
                                            <View key={index} style={{ paddingLeft: 15, paddingRight: 5 }}>
                                                <TouchableOpacity
                                                    onPress={() => this.onSelect(item, index)}
                                                    style={{ height: 70, flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#8C8B91' }}>{item.name}</Text>
                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824' }} numberOfLines={1}>{item.short_address}</Text>
                                                    </View>
                                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                                </TouchableOpacity>
                                                {(index !== this.state.addresses.length - 1) && <Divider left={50} />}
                                            </View>
                                        ))
                                    }
                                </View>
                            ) : (null)
                        }
                        <TouchableOpacity
                            style={{ marginTop: 15, paddingLeft: 15, paddingRight: 5, backgroundColor: 'white', height: 50, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => this.onNewAddress()}>

                            <LocationIcon width={22} height={22} color="#637381" />
                            <Text style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824', marginLeft: 5 }}>{translate("add-new-address")}</Text>
                            <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                        </TouchableOpacity>
                    </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(MyAddressScreen)