import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Animated, RefreshControl, Platform, Dimensions } from 'react-native';
import { translate } from '../../translate';
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FrameButton, OutlineButton, ButtonText } from './../../components/Button';
import RestaurantFrame from '../../components/RestaurantFrame';
import { getCategories, getDiets, getCollections, explore, getGeoHash } from '../../apis/listing'
import { getDefaultAddress } from '../../apis/address';
import styles from './styles';
import config from '../../config';
import { connect } from 'react-redux';
import { setCartInfo, setCartRestaurantNote } from '../../actions/cart';
import { getLocationPermissionRole, getAddress, getAddressLocation } from '../../utils/session';
import { getCurrentLocation } from '../../utils/location';
import { setCurrentLocation, setCurrentAddressStatus, setDeleteAddressFlag } from '../../actions/location';
import { ProfileIcon, FilterIcon, CartIcon, CartEmptyIcon } from '../../components/SvgIcons';
import SplashScreen from 'react-native-splash-screen';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import firebase from 'react-native-firebase';
import { getToken } from '../../utils/token';
import { setStatusbarHeight } from '../../actions/appinfo';
import { clearCart, getCart } from '../../apis/cart';
import { withNavigation } from 'react-navigation';

const filterHeight = 60;
const screenHei = Dimensions.get("window").height;
const screenWid = Dimensions.get("window").width;

class HomeScreen extends Component {
    constructor() {
        super()

        const scrollYAnimatedValue = new Animated.Value(0);
        const offsetAnim = new Animated.Value(0);

        this.state = {
            loading: false,
            search: '',
            activeTabItem: 'delivery',
            isFixed: false,
            restaurants: [],
            collections: [],
            collectionsLoaded: false,
            restaurantsLoaded: false,
            categories: [],
            diets: [],
            activeAddress: "",
            currentLocation: null,
            selectedCollection: null,
            loadingCollection: false,
            scrollYAnimatedValue,
            offsetAnim,
            clampedScroll: Animated.diffClamp(
                Animated.add(
                    scrollYAnimatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                        extrapolateLeft: 'clamp',
                    }),
                    offsetAnim,
                ),
                0,
                filterHeight,
            ),
            geoHash: null,
            geoHashChecked: false
        };
    }

    _clampedScrollValue = 0;
    _offsetValue = 0;
    _scrollValue = 0;

    async getExploreURL(collection) {
        var geoHash = null;
        var location = null;
        if (this.state.activeAddress === 'Current Position') {
            location = await getCurrentLocation();
            if (location.location === null) {
                if (location.error['PERMISSION_DENIED'] === 1) {
                    Alert.alert(
                        "User Location",
                        'Location permission was not granted.',
                        [
                            {
                                text: "Change address",
                                onPress: () => this.gotoActualPosition()
                            }, {
                                text: "Cancel",
                            }
                        ]
                    )
                }
                return;
            } else {
                location = location.location;
                this.setState({ currentLocation: location })
                this.props.setCurrentLocation(location)
            }
        } else {
            location = this.state.currentLocation
        }

        const hashData = await getGeoHash(location)
        if (hashData) {
            geoHash = hashData.location.geohash;
            this.props.setCurrentAddressStatus(hashData.cart)
            this.setState({ geoHash });

            if (hashData.cart.validated === false && !this.state.geoHashChecked) {
                Alert.alert(
                    'Ceebo',
                    hashData.cart.message,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Confirm', onPress: async () => {
                                try {
                                    await clearCart();
                                    this.props.setCartRestaurantNote('');
                                    const cartData = await getCart()
                                    this.props.setCartInfo(cartData);
                                    this.gotoActualPosition();
                                } catch (error) {
                                    Alert.alert('', error);
                                }
                            }
                        }
                    ],
                    { cancelable: false }
                )
            }
            this.setState({ geoHashChecked: true });
        } else {
            this.setState({ geoHash: null })
        }

        var url = config.exploreTabURL
        if (this.state.activeTabItem === 'delivery') {
            url = url + "?fulfillment=delivery";
        } else {
            url = url + "?fulfillment=pickup";
        }

        if (geoHash) {
            url = url + "&geohash=" + geoHash;
        }

        if (collection) {
            url = url + "&collection=" + collection.slug;
        }
        return url;
    }

    async onRefreshExplore() {
        if (!this.state.activeAddress) {
            this.setState({ loading: false, collectionsLoaded: true, collections: [], restaurantsLoaded: true })
            return;
        }

        this.setState({ restaurantsLoaded: false, restaurants: [] });
        const url = await this.getExploreURL()
        if (url) {
            explore(url).then(restaurants => {
                this.setState({ restaurants: restaurants, restaurantsLoaded: true })
            }).catch(error => {
                console.log("ceebo-log-error", error)
            })
        } else {
            this.setState({ restaurants: [], restaurantsLoaded: true })
        }
    }

    async onRefresh() {
        if (!this.state.activeAddress) {
            this.setState({ loading: false, collectionsLoaded: true, collections: [], restaurantsLoaded: true, restaurants: [] })
            return;
        }
        this.setState({ loading: false, collectionsLoaded: false, restaurantsLoaded: false, restaurants: [], collections: [] })
        const collections = await getCollections()
        this.setState({ collectionsLoaded: true, collections })

        this.onRefreshExplore();
    }

    async onSelectCollection(collection) {
        this.setState({ selectedCollection: collection, loadingCollection: true })
        const url = await this.getExploreURL(collection)
        explore(url).then(res => {
            this.setState({ selectedCollection: null, loadingCollection: false })
            this.props.navigation.navigate("restaurants", { restaurants: res })
        }).catch(error => {
            this.setState({ selectedCollection: null, loadingCollection: false })
        })
    }

    checkFirebaseMessagingPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        if (!enabled) {
            try {
                await firebase.messaging().requestPermission();
            } catch (error) {
                console.log("firebase messaging is rejected", error);
            }
        }
    }

    createFirebaseNotificationListeners = async () => {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body, data } = notification;
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body, data } = notificationOpen.notification;
        });

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body, data } = notificationOpen.notification;
        }

        this.messageListener = firebase.messaging().onMessage((message) => {
        });
    }

    async componentDidMount() {
        SplashScreen.hide();

        await this.getActiveAddress();

        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            this.recheckAddress();
        });
        if (this.props.signin.profile_info) {
            getToken();
            await this.checkFirebaseMessagingPermission();
            this.createFirebaseNotificationListeners();
        }

        const categories = await getCategories()
        this.setState({ categories })

        const diets = await getDiets()
        this.setState({ diets })

        this.onRefresh();

        this.state.scrollYAnimatedValue.addListener(({ value }) => {
            const diff = value - this._scrollValue;
            this._scrollValue = value;
            this._clampedScrollValue = Math.min(
                Math.max(this._clampedScrollValue + diff, 0),
                filterHeight,
            );
        });

        this.state.offsetAnim.addListener(({ value }) => {
            this._offsetValue = value;
        });
    }

    componentWillUnmount() {
        this.focusListener && this.focusListener.remove();
        this.state.scrollYAnimatedValue.removeAllListeners();
        this.state.offsetAnim.removeAllListeners();

        if (this.props.signin.profile_info) {
            if (this.notificationListener) this.notificationListener();
            if (this.notificationOpenedListener) this.notificationOpenedListener();
        }
    }

    _onScrollEndDrag = () => {
        this._scrollEndTimer = setTimeout(this._onMomentumScrollEnd, 250);
    };

    _onMomentumScrollBegin = () => {
        clearTimeout(this._scrollEndTimer);
    };

    _onMomentumScrollEnd = () => {
        const toValue = this._scrollValue > filterHeight &&
            this._clampedScrollValue > filterHeight / 2
            ? this._offsetValue + filterHeight
            : this._offsetValue - filterHeight;

        Animated.timing(this.state.offsetAnim, {
            toValue,
            duration: 350,
            useNativeDriver: true,
        }).start();
    };

    async onDelivery() {
        await this.setState({ activeTabItem: 'delivery' })
        this.onRefreshExplore();
    }

    async onWithdrawal() {
        await this.setState({ activeTabItem: 'withdrawal' })
        this.onRefreshExplore();
    }

    onCart() {
        if (!this.props.signin.profile_info) {
            this.props.navigation.navigate("signinlist");
        } else {
            this.props.navigation.navigate("mycart");
        }
    }

    recheckAddress = async () => {
        if (this.props.signin.profile_info &&
            this.state.activeAddress !== 'Current Position' &&
            this.props.locationInfo.deletedAddress === this.state.activeAddress) {

            this.props.setDeleteAddressFlag(false);
            const address = await getDefaultAddress();
            if (address) {
                if (address.default) {
                    const location = {
                        latitude: parseFloat(address.location.lat),
                        longitude: parseFloat(address.location.lng),
                    };
                    this.setState({ activeAddress: address.short_address, currentLocation: location })
                    this.props.setCurrentLocation(location)
                    this.onRefresh();
                } else {
                    console.log("invalid token error is happened again.")
                }
            } else {
                Alert.alert(
                    'Ceebo',
                    'Please select your address.',
                    [
                        {
                            text: 'Ok', onPress: () => this.gotoActualPosition()
                        }
                    ]
                )
            }
        }
    }

    getActiveAddress = async () => {
        if (!this.props.signin.profile_info) {
            const role = await getLocationPermissionRole();
            if (role === 'notallow') {
                const address = await getAddress();
                const location = await getAddressLocation();
                this.setState({ activeAddress: address, currentLocation: location });
                this.props.setCurrentLocation(location)
            } else {
                this.setState({ activeAddress: "Current Position", currentLocation: null });
            }
        } else {
            const address = await getDefaultAddress()
            if (address && address.location) {
                const location = {
                    latitude: parseFloat(address.location.lat),
                    longitude: parseFloat(address.location.lng),
                };
                this.setState({ activeAddress: address.short_address, currentLocation: location })
                this.props.setCurrentLocation(location)
            } else {
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
                        this.gotoActualPosition();
                        return false
                    case RESULTS.GRANTED:
                        await this.setState({ activeAddress: "Current Position", currentLocation: null });
                        break;
                    default:
                        break;
                }
            }
        }
        return true
    }

    async onChangePosition(address, location) {
        await this.setState({ activeAddress: address, currentLocation: location })
        this.props.setCurrentLocation(location)
        this.onRefreshExplore()
    }

    isEmptyCart = () => {
        if (!this.props.cart) return true;
        if (!this.props.cart.cartInfo) return true;
        return this.props.cart.cartInfo?.items ? false : true;
    }

    gotoActualPosition() {
        this.props.navigation.navigate("position", {
            currentAddress: this.state.activeAddress,
            onDone: async (address, location) => {
                if (address != this.state.activeAddress) {
                    await this.setState({ geoHashChecked: false })
                    this.onChangePosition(address, location)
                }
            }
        })
    }

    getRestContent() {
        return screenHei - this.props.appInfo.statusbarHeight - 400; // 60 - 50 - 140
    }

    render() {

        const { clampedScroll } = this.state;

        const filterBarTranslate = clampedScroll.interpolate({
            inputRange: [0, filterHeight],
            outputRange: [filterHeight, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={{ flex: 1, paddingTop: this.props.appInfo.statusbarHeight, backgroundColor: 'white' }}>
                <View style={styles.container}>
                    {/* header component */}
                    <View style={[styles.headercontainer]}>
                        {/* header */}
                        <View style={styles.headertitle}>
                            <TouchableOpacity
                                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                                onPress={() => this.props.navigation.navigate("account")}>
                                <ProfileIcon width={20} height={20} color='black' />
                            </TouchableOpacity>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Animated.Text
                                    style={{
                                        fontFamily: 'Circular Std',
                                        fontSize: 9,
                                        fontWeight: 'bold',
                                        color: '#1A1A1A',
                                        marginBottom: 3,
                                        height: this.state.scrollYAnimatedValue.interpolate({
                                            inputRange: [0, 110, 111],
                                            outputRange: [0, 0, 12],
                                            extrapolate: 'clamp'
                                        })
                                    }}
                                >{translate(this.state.activeTabItem)}</Animated.Text>
                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#1A1824', lineHeight: 18, marginBottom: 3 }}>{this.state.activeAddress}</Text>
                                <TouchableOpacity onPress={() => this.gotoActualPosition()}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 12, color: '#707070' }}>{translate("addresses")}</Text>
                                        <FeatherIcon name="chevron-down" color="#FF5D5D" size={15} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                                onPress={() => this.onCart()}>
                                {
                                    this.isEmptyCart() ? (
                                        <CartEmptyIcon color="black" width={24} height={24} />
                                    ) : (
                                            <CartIcon color="black" dotColor="#FF2222" width={24} height={24} />
                                        )
                                }
                                {/* <Image source={icCart} style={{ width: 22, height: 21 }} /> */}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* search bar */}
                    <Animated.View
                        pointerEvents="auto"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            paddingHorizontal: 10,
                            zIndex: 2,
                            height: filterHeight,
                            backgroundColor: 'white',
                            justifyContent: 'center',
                            transform: [
                                {
                                    translateY: filterBarTranslate
                                }
                            ]
                        }}
                    >
                        <View style={styles.searchBar}>
                            <EvilIcon name="search" color="#95989A" size={25} style={{ marginLeft: 7 }} />
                            <TouchableOpacity
                                style={{ flex: 1, height: 50, justifyContent: 'center' }}
                                onPress={() => this.props.navigation.navigate(
                                    "search",
                                    {
                                        geoHash: this.state.geoHash, selectCollection: (collection) => this.onSelectCollection(collection)
                                    }
                                )}
                            >
                                <Text style={{ fontSize: 17, fontFamily: 'Circular Std', lineHeight: 22, color: '#95989A', paddingLeft: 15 }}>{translate("search-food")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate(
                                    "searchfilter",
                                    {
                                        geoHash: this.state.geoHash,
                                        categories: this.state.categories,
                                        diets: this.state.diets
                                    }
                                )}
                            >
                                {/* <Octicon name="settings" color="#1A1824" size={25} /> */}
                                <FilterIcon width={20} height={20} color='#1A1824' />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* main content */}
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                style={{ marginTop: Platform.OS === 'ios' ? 0 : 20 }}
                                onRefresh={() => this.onRefresh()}
                            />
                        }
                        ref={ref => this.scrollView = ref}
                        scrollEventThrottle={1}
                        scrollIndicatorInsets={{ right: 1 }}
                        style={[styles.maincontainer, { paddingTop: filterHeight, zIndex: 1 }]}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: this.state.scrollYAnimatedValue } } }])}
                    >
                        <View style={{ flexDirection: 'row', padding: 10 }}>
                            {this.state.activeTabItem === 'delivery' ? (
                                <FrameButton
                                    backgroundColor="#EAEAEA"
                                    width={120}
                                    style={{ marginRight: 10, borderRadius: 15 }} >
                                    <ButtonText textColor="black" bold>{translate("delivery")}</ButtonText>
                                </FrameButton>
                            ) : (
                                    <OutlineButton
                                        borderColor="#EAEAEA"
                                        width={120}
                                        onPress={() => this.onDelivery()} style={{ marginRight: 10 }}>
                                        <ButtonText textColor="black" bold>{translate("delivery")}</ButtonText>
                                    </OutlineButton>
                                )}

                            {this.state.activeTabItem === 'withdrawal' ? (
                                <FrameButton
                                    backgroundColor="#EAEAEA"
                                    width={120}
                                    style={{ borderRadius: 15 }} >
                                    <ButtonText textColor="black" bold>{translate("withdrawal")}</ButtonText>
                                </FrameButton>
                            ) : (
                                    <OutlineButton
                                        borderColor="#EAEAEA"
                                        width={120}
                                        onPress={() => this.onWithdrawal()}>
                                        <ButtonText textColor="black" bold>{translate("withdrawal")}</ButtonText>
                                    </OutlineButton>
                                )}
                        </View>

                        {/* collections */}
                        {
                            (!this.state.restaurantsLoaded || this.state.restaurants.length > 0) ? (
                                <View style={{ paddingVertical: 10 }}>
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                        {
                                            (this.state.collections && Array.isArray(this.state.collections)) ? this.state.collections.map((item, index) => (
                                                <TouchableOpacity key={index} onPress={() => this.onSelectCollection(item)}>
                                                    <View style={{ paddingHorizontal: 10 }}>
                                                        <View style={{ width: 74, height: 74, borderRadius: 10, backgroundColor: '#FFDDCC', justifyContent: 'center', alignItems: 'center' }}>
                                                            <Image source={{ uri: item.image_url }} style={{ width: 66, height: 66 }} alt="" />
                                                            {
                                                                (this.state.selectedCollection && this.state.selectedCollection.id === item.id && this.state.loadingCollection) ? (
                                                                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                                                                        <ActivityIndicator size="large" />
                                                                    </View>
                                                                ) : (null)
                                                            }
                                                        </View>
                                                        <Text numberOfLines={1} style={{ width: 74, fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginTop: 5 }}>{item.name}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )) : (null)
                                        }
                                    </ScrollView>
                                </View>
                            ) : null
                        }

                        {/* restaurants sections */}
                        {
                            this.state.restaurants.length > 0 ? this.state.restaurants.map((restaurants, index) => (
                                <View style={{ paddingVertical: 10 }} key={index}>
                                    {
                                        restaurants.display_type === 'carousel' ? (
                                            <View style={{ flexDirection: 'row', marginBottom: 20, paddingHorizontal: 15 }}>
                                                <Text style={{ flex: 1, fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 24, color: '#1A1824' }}>{restaurants.name}</Text>
                                                <TouchableOpacity
                                                    style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                                    onPress={() => this.props.navigation.navigate("restaurants", { restaurants })}>
                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824' }}>View all</Text>
                                                    <EvilIcon name="chevron-right" color='#1A1824' size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                                <Text style={{ marginBottom: 20, paddingHorizontal: 15, fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 24, color: '#1A1824' }}>{restaurants.name}</Text>
                                            )
                                    }

                                    {/* restaurant list */}
                                    {
                                        restaurants.display_type === 'carousel' ? (
                                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                                {
                                                    restaurants.listings.map((restaurant, i) => (
                                                        <View style={{ paddingHorizontal: 15 }} key={i}>
                                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('restaurant', { id: restaurant.id })}><RestaurantFrame width={240} height={150} info={restaurant} /></TouchableOpacity>
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        ) : (
                                                restaurants.listings.map((restaurant, i) => (
                                                    <View style={{ paddingHorizontal: 15 }} key={i}>
                                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('restaurant', { id: restaurant.id })}><RestaurantFrame width={screenWid - 30} height={(screenWid - 30) * 0.625} info={restaurant} /></TouchableOpacity>
                                                    </View>
                                                ))
                                            )
                                    }
                                </View>
                            )) : (
                                    this.state.restaurantsLoaded ? (
                                        <View style={{ justifyContent: 'center', alignItems: 'center', height: this.getRestContent(), paddingHorizontal: '10%' }}>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', lineHeight: 24, textAlign: 'center' }}>Al momento non ci sono ristoranti nella tua zona</Text>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, fontWeight: 'normal', color: '#1A1824', lineHeight: 18, textAlign: 'center', marginTop: 5 }}>Iscriviti alla nostra newsletter e rimani aggiornato quando arriveranno nuovi ristoranti nella tua zona</Text>
                                            <TouchableOpacity
                                                onPress={
                                                    () => {

                                                    }
                                                }
                                            >
                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, fontWeight: 'normal', color: '#FF5D5D', textAlign: 'center', marginTop: 5 }}>Suggerisci un ristorante</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (null)
                                )
                        }

                        {
                            (!this.state.collectionsLoaded || !this.state.restaurantsLoaded) && (
                                <View style={{ height: 100, justifyContent: 'center' }}>
                                    <ActivityIndicator size="large" />
                                </View>
                            )
                        }
                        <View style={{ height: 50 }} />
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        setCartInfo: (cartInfo) => { dispatch(setCartInfo(cartInfo)) },
        setCartRestaurantNote: (note) => { dispatch(setCartRestaurantNote(note)) },
        setCurrentLocation: (location) => { dispatch(setCurrentLocation(location)) },
        setStatusbarHeight: (height) => { dispatch(setStatusbarHeight(height)) },
        setCurrentAddressStatus: (status) => { dispatch(setCurrentAddressStatus(status)) },
        setDeleteAddressFlag: (flag) => { dispatch(setDeleteAddressFlag(flag)) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(HomeScreen))