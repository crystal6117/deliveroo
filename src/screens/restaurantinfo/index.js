import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, ScrollView, Text, TouchableOpacity, Platform, StatusBar, Image, Animated, ActivityIndicator, Linking } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather'
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { RoundButton } from '../../components/Button';
import { Rating } from 'react-native-ratings';
import CeeboHeader1 from '../../components/CeeboHeader1';
import styles from './styles'
import colors from '../../utils/colors';
import { getReviews } from '../../apis/listing';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import { getDistance } from 'geolib';
import { connect } from 'react-redux';
import { StarIcon } from '../../components/SvgIcons';

const delta = 0.005;

class RestaurantInfoScreen extends Component {
    constructor() {
        super()
        this.state = {
            xPosition: new Animated.Value(0),
            restaurantInfo: null,
            error: '',
            reviewLoading: true,
            distance: null,
            openHours: [
                {
                    type: 'Monday - Thursday',
                    time: '10:00 - 19:00'
                }, {
                    type: 'Friday - Sunday',
                    time: '9:00 - 22:00'
                }
            ],
            reviews: [],
            allReviews: [],
            yScrollPosition: new Animated.Value(0),
        }
        this.isFixed = false;
    }

    componentDidMount() {
        const restaurantInfo = this.props.navigation.getParam("restaurantInfo");
        if (restaurantInfo) {
            this.setState({ restaurantInfo });
            getReviews(restaurantInfo.id).then(res => {
                const reviews = res.slice(0, 4);
                this.setState({ reviews, allReviews: res, reviewLoading: false })
            })
            if (this.props.locationInfo.userLocation) {
                const distance = getDistance(this.props.locationInfo.userLocation, {
                    latitude: parseFloat(restaurantInfo.location.lat),
                    longitude: parseFloat(restaurantInfo.location.lng),
                })
                if (distance > 500) {
                    const dis = Math.round(distance / 100) / 10;
                    this.setState({ distance: (dis.toString() + "Km") })
                } else {
                    const dis = Math.round(distance / 100) / 100;
                    this.setState({ distance: (dis.toString() + "M") })
                }
            } else {
                console.log('this.props.locationInfo.userLocation is null')
            }
        } else {
            this.setState({ restaurantInfo: null, error: "Invalid Request", reviewLoading: false });
        }
    }

    showFixedTitlebar() {
        Animated.timing(this.state.xPosition, {
            toValue: 1,
            duration: 500
        }).start();
    }

    hideFixedTitlebar() {
        Animated.timing(this.state.xPosition, {
            toValue: 0,
            duration: 500
        }).start();
    }

    onScrollView(event) {
        const offsetY = event.nativeEvent.contentOffset.y
        if (this.isFixed && offsetY < 50) {
            this.isFixed = false;
            this.hideFixedTitlebar();
        } else if (this.isFixed === false && offsetY > 65) {
            this.isFixed = true;
            this.showFixedTitlebar();
        }
    }

    phoneCall(phone) {
        Linking.openURL(`tel:${phone}`);
    }

    render() {
        if (this.state.error) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ padding: 10, paddingTop: 10 + this.props.appInfo.statusbarHeight }}>
                        <RoundButton onPress={() => this.props.navigation.goBack()}>
                            <FeatherIcon name="arrow-left" color="#FF5D5D" size={25} />
                        </RoundButton>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#FF5D5D', fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16 }}>{this.state.error}</Text>
                    </View>
                </View>
            )
        } else if (this.state.restaurantInfo === null)
            return null;

        let { xPosition, restaurantInfo } = this.state;
        return (
            <View style={styles.container}>
                <Animated.View style={[{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    backgroundColor: 'white',
                    zIndex: 99,
                    opacity: this.state.yScrollPosition.interpolate({
                        inputRange: [0, 50, 150],
                        outputRange: [0, 0, 1]
                    }),
                    transform: [
                        {
                            translateY: this.state.yScrollPosition.interpolate({
                                inputRange: [0, 50, 51],
                                outputRange: [-50, 0, 0]
                            })
                        }
                    ]
                }, styles.shadow]}
                >
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
                        <Text style={styles.title}>{restaurantInfo.name}</Text>
                    </CeeboHeader1>
                </Animated.View>
                <ScrollView
                    style={{ flex: 1 }}
                    scrollEventThrottle={1}
                    scrollIndicatorInsets={{ right: 1 }}
                    // onScroll={(event) => this.onScrollView(event)} ref={ref => this.scrollView = ref}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.yScrollPosition } } }]
                    )}
                >
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 15 + this.props.appInfo.statusbarHeight,
                            left: 10,
                            zIndex: 2,
                            opacity: this.state.yScrollPosition.interpolate({
                                inputRange: [0, 20 + this.props.appInfo.statusbarHeight, 40 + this.props.appInfo.statusbarHeight],
                                outputRange: [1, 0.7, 0]
                            })
                        }}
                    >
                        <RoundButton onPress={() => this.props.navigation.goBack()} style={styles.shadow}>
                            <FeatherIcon name="arrow-left" color="#FF5D5D" size={25} />
                        </RoundButton>
                    </Animated.View>
                    {
                        this.state.restaurantInfo ? (
                            <MapView
                                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                                style={{ height: 375 }}
                                zoomControlEnabled={false}
                                zoomEnabled={false}
                                region={{
                                    latitude: parseFloat(restaurantInfo.location.lat),
                                    longitude: parseFloat(restaurantInfo.location.lng),
                                    latitudeDelta: delta,
                                    longitudeDelta: delta,
                                }}
                            >
                                <Marker coordinate={{
                                    latitude: parseFloat(restaurantInfo.location.lat),
                                    longitude: parseFloat(restaurantInfo.location.lng)
                                }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 25, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: 'center' }}>
                                        <EntypoIcon name="location-pin" size={20} color="white" />
                                    </View>
                                </Marker>
                            </MapView>
                        ) : (<View style={{ height: 475, backgroundColor: 'lightgray' }}></View>)
                    }

                    <View style={{ paddingVertical: 20 }}>
                        {/* basic info */}
                        <View style={{ paddingHorizontal: 10 }}>
                            <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 30, color: "#1A1824" }}>{restaurantInfo.name}</Text>

                            <View style={{ paddingTop: 20, flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 18, color: "#1A1A1A", marginBottom: 10 }}>{translate("address")}</Text>
                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#1A1824" }}>{restaurantInfo.formatted_address}</Text>
                                </View>
                            </View>

                            <View style={{ paddingVertical: 20 }}>
                                <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 18, color: "#1A1A1A", marginBottom: 10 }}>{translate("hours-information")}</Text>
                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#1A1824" }}>{restaurantInfo.opening_hours.selected_hour}</Text>
                            </View>
                        </View>

                        {/* call restaurant button */}
                        <TouchableOpacity
                            style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.lightgray, height: 50, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => this.phoneCall(restaurantInfo.phone_number)}>
                            <Text style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 17, color: "#FF5D5D" }}>{translate("call-restaurant")}</Text>
                            <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                        </TouchableOpacity>

                        {/* reviews */}
                        <View style={{ padding: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                                <Rating
                                    ratingCount={5}
                                    startingValue={parseFloat(restaurantInfo.rating)}
                                    fractions={2}
                                    ratingColor="#FF5D5D"
                                    isDisabled={true}
                                    imageSize={12}
                                    readonly={true}
                                    ratingBackgroundColor="black"
                                    style={{ justifyContent: 'center', marginRight: 10 }}
                                />
                                <Text style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 16, color: "#1A1824" }}>{`${restaurantInfo.rating} (${restaurantInfo.total_reviews})`}</Text>
                                {
                                    this.state.reviews.length > 0 && (
                                        <TouchableOpacity
                                            style={{ flexDirection: 'row' }}
                                            onPress={() => this.props.navigation.navigate("reviewall", { reviews: this.state.allReviews })}>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: "#1A1824" }}>{translate("view-all")}</Text>
                                            <EvilIcon name="chevron-right" color='black' size={25} />
                                        </TouchableOpacity>
                                    )
                                }
                            </View>

                            {/* review list */}
                            {
                                this.state.reviewLoading ? (
                                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator size="large" />
                                    </View>
                                ) : (
                                        this.state.reviews.map((item, index) => (
                                            <View key={index}>
                                                <View >
                                                    <View style={{ marginTop: 20, flexDirection: 'row' }}>
                                                        {/* <View style={{ width: 60 }}>
                                                            {
                                                                !item.image_url ? (
                                                                    <View style={{ width: 44, height: 44, borderRadius: 5, backgroundColor: '#EAEAEB' }}></View>
                                                                ) : (
                                                                        <Image source={{ uri: item.image_url }} style={{ width: 44, height: 44, borderRadius: 5, backgroundColor: '#EAEAEB' }} />
                                                                    )
                                                            }
                                                        </View> */}
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: '#1A1A1A', marginBottom: 10 }}>{item.first_name}</Text>
                                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099' }}>{item.created_at}</Text>
                                                        </View>
                                                        <View style={{ width: 56, height: 32, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }}>
                                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "white", marginRight: 5 }}>{item.rating}</Text>
                                                            <StarIcon width={15} height={15} color="white" />
                                                        </View>
                                                    </View>
                                                    {!item.expand && (<Text style={{ marginTop: 10, fontFamily: 'Circular Std', fontSize: 12, color: "#919099" }} numberOfLines={3}>{item.comments}</Text>)}
                                                    {/* </TouchableOpacity> */}
                                                </View>
                                            </View>
                                        ))
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

export default connect(mapStateToProps, null)(RestaurantInfoScreen)