import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Ionicon from 'react-native-vector-icons/Ionicons'
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { Divider } from '../../components/Divider';
import styles from './styles';
import colors from '../../utils/colors';
import { getProfileInfo } from '../../apis/user'
import { setProfileInfo } from '../../actions/signin';
import { connect } from 'react-redux';
import { saveAddress, saveAddressLocation, getAddress, getAddressLocation, saveLocationPermissionRole, setSession } from '../../utils/session';
import { updateAddress } from '../../apis/address';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

const PositionItem = (props) => (
    <View style={{ height: 70, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 45, justifyContent: 'center' }}>
                {
                    props.checked ? (
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: "center", }}>
                            <EntypoIcon name="check" color="white" size={12} />
                        </View>
                    ) : (
                            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#D0D0D2' }}></View>
                        )
                }
            </View>
            <View style={{ flex: 1, height: 70, justifyContent: 'center', borderColor: colors.lightgray, borderBottomWidth: props.isLast ? 0 : 1 }}>
                {props.children}
            </View>
        </View>
    </View>
)

class ActualPositionScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            addresses: [],
            currentPositionNo: -1,
            activeAddress: props.navigation.getParam("currentAddress"),
            selectedLocation: null
        }
    }

    async componentDidMount() {
        if (this.props.signin.profile_info) {
            const addresses = this.props.signin.profile_info.addresses;
            if (addresses) this.setState({ addresses });

            var currentPositionNo = -2;
            if (this.state.activeAddress === "Current Position") {
                currentPositionNo = -1;
            } else {
                for (var i = 0; i < addresses.length; i++) {
                    if (addresses[i].short_address === this.state.activeAddress) {
                        currentPositionNo = i;
                    }
                }
            }
            this.setState({ currentPositionNo });
        } else {
            var currentPositionNo = -2;
            if (this.state.activeAddress === "Current Position") {
                currentPositionNo = -1;
            } else {
                currentPositionNo = 0;
            }
            this.setState({ currentPositionNo });
            const address = await getAddress();
            const location = await getAddressLocation();
            if (address) {
                this.setState({
                    selectedLocation: {
                        address, location
                    }
                })
            }
        }
    }

    async onReloadProfile() {
        const profileInfo = await getProfileInfo();
        this.props.setProfileInfo(profileInfo);
        this.setState({ addresses: profileInfo.addresses });
    }

    onEditAddress(index) {
        this.props.navigation.navigate("newaddress", { address: this.state.addresses[index], refreshProfile: () => this.onReloadProfile() });
    }

    async onSetAddress(currentPositionNo) {
        await this.setState({ currentPositionNo })

        if (currentPositionNo === -1) {
            if (Platform.OS === 'android') {
                // const granted = await PermissionsAndroid.request(
                //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                //     PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
                // );
                // if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                //     this.setState({ currentPositionNo: -2 })
                // }
                const result = await request(
                    Platform.select({
                        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                        ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
                    }),
                );

                switch (result) {
                    case RESULTS.UNAVAILABLE:
                    case RESULTS.DENIED:
                    case RESULTS.BLOCKED:
                        await this.setState({ currentPositionNo: -2 })
                        return ;
                    case RESULTS.GRANTED:
                        await this.setState({ currentPositionNo: -1 })
                        break;
                    default:
                        await this.setState({ currentPositionNo: -2 })
                        return ;
                }
            }
        } else if (currentPositionNo === 0 && !this.props.signin.profile_info && !this.state.selectedLocation) {
            this.onSelectLocation()
        }
        this.onConfirm();
    }

    async onConfirm() {
        if (this.props.signin.profile_info) {
            const address = this.state.currentPositionNo === -1 ? "Current Position" : this.state.addresses[this.state.currentPositionNo].short_address;
            var location = {}
            if (this.state.currentPositionNo !== -1) {
                location.latitude = parseFloat(this.state.addresses[this.state.currentPositionNo].location.lat)
                location.longitude = parseFloat(this.state.addresses[this.state.currentPositionNo].location.lng)
                updateAddress({
                    id: this.state.addresses[this.state.currentPositionNo].id,
                    default: "1"
                })
            }

            await setSession("ISCURRENTPOSITION", this.state.currentPositionNo === -1 ? false : true )
            this.props.navigation.goBack()
            this.props.navigation.state.params.onDone(address, location);
        } else {
            const address = this.state.currentPositionNo === -1 ? "Current Position" : this.state.selectedLocation.address;
            var location = this.state.currentPositionNo === -1 ? {} : this.state.selectedLocation.location;
            await saveLocationPermissionRole(this.state.currentPositionNo === -1 ? "always-allow" : "notallow")
            this.props.navigation.goBack()
            this.props.navigation.state.params.onDone(address, location);
        }
    }

    onSelectLocation() {
        this.props.navigation.navigate("selectlocation", {
            returnData: async (address, location, shortAddress) => {
                this.setState({
                    selectedLocation: {
                        address: shortAddress, location
                    }
                });
                await saveAddressLocation(location);
                await saveAddress(shortAddress);
            }
        });
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
                    >
                        <Text style={styles.title}>{translate("position")}</Text>
                    </CeeboHeader1>

                    {/* main content */}
                    <ScrollView  scrollIndicatorInsets={{ right: 1 }}>
                        <View style={{ flex: 1, paddingVertical: 35 }}>
                            <View style={[styles.contentframe, { paddingHorizontal: 10 }]}>
                                <TouchableOpacity onPress={() => this.onSetAddress(-1)}>
                                    <PositionItem checked={this.state.currentPositionNo === -1 ? true : false} isLast={(!this.state.addressList || this.state.addressList.length === 0) ? true : false}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Ionicon name="ios-send" color="#898989" size={18} />
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: "#1A1824", marginLeft: 5 }}>{translate("current-position")}</Text>
                                        </View>
                                    </PositionItem>
                                </TouchableOpacity>
                                {
                                    this.state.addresses && this.state.addresses.map((item, index) => (
                                        <TouchableOpacity onPress={() => this.onSetAddress(index)} key={index}>
                                            <PositionItem checked={this.state.currentPositionNo === index ? true : false} isLast={(this.state.addresses.length - 1) === index ? true : false}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#707070" }}>{item.name}</Text>
                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: "#1A1824" }} numberOfLines={1}>{item.short_address}</Text>
                                                    </View>
                                                </View>
                                            </PositionItem>
                                        </TouchableOpacity>
                                    ))
                                }

                                {
                                    this.props.signin.profile_info ? (
                                        <>
                                            <Divider left={0} />
                                            <TouchableOpacity
                                                style={{ height: 52, flexDirection: 'row', alignItems: 'center' }}
                                                onPress={() => this.props.navigation.navigate("newaddress", { refreshProfile: () => this.onReloadProfile() })}>
                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', flex: 1 }}>{translate("add-address")}</Text>
                                                <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                            <>
                                                <Divider left={0} />
                                                <TouchableOpacity onPress={() => this.onSetAddress(0)}>
                                                    <PositionItem checked={this.state.currentPositionNo === 0 ? true : false}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#707070" }}>{translate("select-location")}</Text>
                                                                {this.state.selectedLocation && (
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: "#1A1824" }} numberOfLines={1}>{this.state.selectedLocation.address}</Text>
                                                                )}
                                                            </View>
                                                            {
                                                                this.state.selectedLocation && (
                                                                    <TouchableOpacity style={{ justifyContent: 'center' }} onPress={() => this.onSelectLocation()}>
                                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 14, fontWeight: 'bold', color: '#FF5D5D' }}>{translate("change")}</Text>
                                                                    </TouchableOpacity>
                                                                )
                                                            }
                                                        </View>
                                                    </PositionItem>
                                                </TouchableOpacity>
                                            </>
                                        )
                                }
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

const mapDispatchToProps = dispatch => {
    return {
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ActualPositionScreen)