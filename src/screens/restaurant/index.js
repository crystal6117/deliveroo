import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, ScrollView, Text, TouchableOpacity, Platform, Animated, Dimensions, ActivityIndicator, Image, Share, StatusBar } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather'
import { FrameButton, ButtonText, RoundButton } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import styles from './styles'
import { getRestaurantInfo, addFavorite } from '../../apis/listing';
import { connect } from 'react-redux';
import placeholderImg from '../../../assets/images/placeholder.png';
import favorIcon from '../../../assets/icons/ic_heart.png';
import fillFavorIcon from '../../../assets/icons/ic_heart_fill.png';
import { Divider } from '../../components/Divider';
import { ShareIcon, BikeIcon, DollarSignIcon, ShoppingBagIcon, ClockIcon, StarIcon, FoodIcon, CartIcon, CartEmptyIcon } from '../../components/SvgIcons';

const screenWid = Dimensions.get('window').width;
const scrollOffsetX = 5

class RestaurantScreen extends Component {
    constructor() {
        super()
        this.state = {
            xPosition: new Animated.Value(0),
            restaurantInfo: null,
            error: '',
            loading: true,
            activeType: 0,
            positions: [],
            categoryOffset: 0,
            categoryPosition: [],
            disabledRestaurant: false,
            yScrollPosition: new Animated.Value(0),
            lastRestWidth: 0
        }
    }

    componentDidMount() {
        const restaurantId = this.props.navigation.getParam('id');
        if (restaurantId) {
            getRestaurantInfo(restaurantId, this.props.signin.profile_info ? true : false).then(({ restaurantInfo, error }) => {
                if (error) {
                    this.setState({ restaurantInfo: null, loading: false, error: error });
                } else {
                    var disabledRestaurant = (restaurantInfo.is_paused || restaurantInfo.opening_hours.opened === false) ? true : false;
                    this.setState({ restaurantInfo, loading: false, error: null, disabledRestaurant })
                }
            })
        } else {
            this.setState({ restaurantInfo: null, loading: false, error: "Invalid request" });
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

    async onScrollView(event) {
        const offset = 100 + this.props.appInfo.statusbarHeight;
        if (this.isScrolling) {
            return;
        }
        const offsetY = event.nativeEvent.contentOffset.y
        const scrollOffsetY = offsetY;

        if (event.nativeEvent.layoutMeasurement.height + event.nativeEvent.contentOffset.y + 1 >= event.nativeEvent.contentSize.height) {
            this.setState({ activeType: this.state.positions.length - 1 });
            this.categoryScrollView.scrollTo({ x: this.state.categoryPosition[this.state.positions.length - 1] + scrollOffsetX, y: 0, animated: true });
        } else {
            for (var i = 0; i < this.state.positions.length; i++) {
                if (this.state.positions[i] &&
                    this.state.positions[i].offsetY <= scrollOffsetY + offset &&
                    (this.state.positions[i].offsetY + this.state.positions[i].height) > scrollOffsetY + offset) {

                    if (this.state.activeType !== i) {
                        this.categoryScrollView.scrollTo({ x: this.state.categoryPosition[i] + scrollOffsetX, y: 0, animated: true });
                    }
                    this.setState({ activeType: i })
                    break;
                }
            }
        }
    }

    onCart() {
        if (!this.props.signin.profile_info) {
            this.props.navigation.navigate("signinlist");
        } else {
            this.props.navigation.navigate("mycart");
        }
    }

    onAddFavourite() {
        if (!this.props.signin.profile_info) {
            this.props.navigation.navigate("signinlist");
        } else {
            addFavorite(this.state.restaurantInfo.id).then(res => {
                var restaurantInfo = this.state.restaurantInfo;
                restaurantInfo.is_favorited = !restaurantInfo.is_favorited;
                this.setState({ restaurantInfo });
            }).catch(error => {
                console.log(error)
            })
        }
    }

    async onShare() {
        await Share.share({
            message: `${this.state.restaurantInfo.name}(${this.state.restaurantInfo.id})`,
        });
    }

    async onGotoMenu(i) {
        this.setState({ activeType: i });
        this.isScrolling = true
        await this.categoryScrollView.scrollTo({ x: this.state.categoryPosition[i] + scrollOffsetX, y: 0, animated: true });
        await this.scrollViewRef.scrollTo({ x: 0, y: this.state.positions[i].offsetY - 100 - this.props.appInfo.statusbarHeight, animated: true });
        setTimeout(() => {
            this.isScrolling = false
        }, 400)
    }

    getTotalCartCount(cartItems) {
        var total = 0;
        if (cartItems) {
            cartItems.forEach((item, index) => {
                total = total + parseInt(item.qty)
            })
        }
        return total;
    }

    getMenuPosition(i, pos, width) {
        if (i === this.state.restaurantInfo.menu.length - 1) {
            this.setState({ lastRestWidth: screenWid - width })
        }
        var categoryPosition = this.state.categoryPosition;
        categoryPosition[i] = pos;
        this.setState({ categoryPosition });
    }

    gotoProductDetail(product) {
        if (this.state.disabledRestaurant) {
            return;
        }

        this.props.navigation.navigate("productdetail", { itemId: product.id, listingId: this.state.restaurantInfo.id })
    }

    hasCart() {
        if (Array.isArray(this.props.cart.cartInfo) && this.props.cart.cartInfo.length === 0) return false;
        if (this.props.cart.cartInfo.listing?.id === this.state.restaurantInfo.id) return true;
        return false;
    }

    renderProductInfo(product, index, isLast) {
        return (
            <View key={index}>
                <TouchableOpacity style={{ paddingTop: 20, paddingBottom: 20, flexDirection: 'row' }} onPress={() => this.gotoProductDetail(product)}>
                    {
                        product.image_url === false ? (null) : (
                            <View style={{ width: 102 }}>
                                <View style={{ width: 86, height: 86, borderRadius: 4 }}>
                                    <Image source={placeholderImg} style={{ width: 86, height: 86, borderRadius: 4, backgroundColor: '#EAEAEB' }} />
                                    <Image source={{ uri: product.image_url }} style={{ position: 'absolute', top: 0, left: 0, width: 86, height: 86, borderRadius: 4 }} />
                                </View>
                            </View>
                        )
                    }
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: '#1A1A1A', marginBottom: 10 }}>{product.name}</Text>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099' }}>{product.description}</Text>
                    </View>
                    <View style={{ width: 70, alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: '#FF5D5D' }}>{product.unit_price}</Text>
                    </View>
                </TouchableOpacity>
                {!isLast && (<Divider />)}
            </View>
        )
    }

    renderProducts() {
        let { restaurantInfo } = this.state;

        if (!Array.isArray(restaurantInfo.menu)) {
            return (
                <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
                    <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 20, color: "#1A1824" }}>{restaurantInfo.menu && restaurantInfo.menu.error}</Text>
                </View>
            );
        }

        return (
            this.state.restaurantInfo.menu.map((menu, i) =>
                (menu.items && Array.isArray(menu.items) && menu.items.length > 0) ? (
                    <View key={i} onLayout={(e) => {
                        var positions = this.state.positions;
                        positions[i] = {
                            offsetY: e.nativeEvent.layout.y,
                            height: e.nativeEvent.layout.height
                        }
                        this.setState({ positions })
                    }}>
                        <View style={{ height: 55, justifyContent: 'center', paddingHorizontal: 10 }}>
                            <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 24, color: "#1A1824" }}>{menu.name}</Text>
                        </View>
                        <View style={{ backgroundColor: 'white', paddingHorizontal: 10 }}>
                            {
                                menu.items.map((item, j) => this.renderProductInfo(item, j, (menu.items.length - 1 === j) ? true : false))
                            }
                        </View>
                    </View>
                ) : (null)
            )
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ padding: 10, paddingTop: 15 + this.props.appInfo.statusbarHeight }}>
                        <RoundButton onPress={() => this.props.navigation.goBack()}>
                            <FeatherIcon name="arrow-left" color="#FF5D5D" size={25} />
                        </RoundButton>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" />
                    </View>
                </View>
            )
        } else if (this.state.error && !this.state.loading) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ padding: 10, paddingTop: 15 + this.props.appInfo.statusbarHeight }}>
                        <RoundButton onPress={() => this.props.navigation.goBack()}>
                            <FeatherIcon name="arrow-left" color="#FF5D5D" size={25} />
                        </RoundButton>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#FF5D5D', fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16 }}>{this.state.error}</Text>
                    </View>
                </View>
            )
        }

        let { xPosition, restaurantInfo } = this.state;
        return (
            <View style={styles.container}>
                <Animated.View style={[{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    zIndex: 99,
                    elevation: 5,
                    opacity: this.state.yScrollPosition.interpolate({
                        inputRange: [0, 50, 250],
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
                }]}
                >
                    {/* <View style={{height: this.props.appInfo.statusbarHeight, backgroundColor: 'white'}} /> */}
                    <CeeboHeader1
                        left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                        right={{ type: 'icon', name: 'search', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.navigate("searchproduct", { products: restaurantInfo.menu, restaurantInfo: this.state.restaurantInfo }) }}
                        offset={this.props.appInfo.statusbarHeight}
                    >
                        <Text style={styles.title}>{restaurantInfo.name}</Text>
                    </CeeboHeader1>
                </Animated.View>
                {
                    this.state.categoryOffset ? (
                        <Animated.View
                            style={[styles.shadow, {
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 100 + this.props.appInfo.statusbarHeight,
                                zIndex: 10,
                                transform: [
                                    {
                                        translateY: this.state.yScrollPosition.interpolate({
                                            inputRange: [0, this.state.categoryOffset - 50 - this.props.appInfo.statusbarHeight, this.state.categoryOffset - 49 - this.props.appInfo.statusbarHeight, this.state.categoryOffset - 48 - this.props.appInfo.statusbarHeight],
                                            outputRange: [-100 - this.props.appInfo.statusbarHeight, -100 - this.props.appInfo.statusbarHeight, 0, 0]
                                        })
                                    }
                                ]
                            }]}
                        >
                            <View style={{ height: this.props.appInfo.statusbarHeight, backgroundColor: 'white' }} />
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                ref={ref => this.categoryScrollView = ref}
                                style={{ marginTop: 50, height: 50, paddingHorizontal: 10, paddingVertical: 15 }}>
                                {
                                    Array.isArray(restaurantInfo.menu) && restaurantInfo.menu && restaurantInfo.menu.map((item, index) => (item.items && Array.isArray(item.items) && item.items.length > 0) ? (
                                        <TouchableOpacity
                                            style={{ paddingHorizontal: 7 }}
                                            onPress={() => this.onGotoMenu(index)}
                                            onLayout={e => this.getMenuPosition(index, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
                                            key={index}>
                                            <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: this.state.activeType === index ? '#FF5D5D' : '#707070' }}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ) : (null))
                                }
                                <View style={{ width: 20 + this.state.lastRestWidth }} />
                            </ScrollView>
                        </Animated.View>
                    ) : (null)
                }
                <ScrollView
                    scrollEventThrottle={1}
                    style={styles.maincontainer}
                    scrollIndicatorInsets={{ right: 1 }}
                    // onScroll={(event) => this.onScrollView(event)}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.yScrollPosition } } }],
                        { listener: (event) => this.onScrollView(event) }
                    )}
                    ref={ref => this.scrollViewRef = ref}
                >
                    <View style={{ width: '100%', height: 250 }}>
                        <Image source={placeholderImg} style={{ width: '100%', height: 250 }} />
                        <Image source={{ uri: restaurantInfo.image_url }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 250, zIndex: 2 }} imageStyle={{ resizeMode: 'cover', overflow: 'hidden', backgroundColor: '#EDEDED' }} />
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3 }}>
                            <Animated.View
                                style={{
                                    flexDirection: 'row',
                                    padding: 10,
                                    paddingTop: 15 + this.props.appInfo.statusbarHeight,
                                    opacity: this.state.yScrollPosition.interpolate({
                                        inputRange: [0, 20 + this.props.appInfo.statusbarHeight, 40 + this.props.appInfo.statusbarHeight],
                                        outputRange: [1, 0.7, 0]
                                    })
                                }}
                            >
                                <RoundButton onPress={() => this.props.navigation.goBack()} style={styles.shadow}>
                                    <FeatherIcon name="arrow-left" color="#FF5D5D" size={25} />
                                </RoundButton>
                                <View style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
                                    <RoundButton style={[styles.shadow, { marginRight: 5 }]} onPress={() => this.onShare()}>
                                        <ShareIcon width={18} height={18} color="black" />
                                    </RoundButton>
                                    <RoundButton style={{ marginRight: 5 }} onPress={() => this.onAddFavourite()}>
                                        <Image source={restaurantInfo.is_favorited ? fillFavorIcon : favorIcon} style={{ width: 21, height: 18 }} />
                                    </RoundButton>
                                    <RoundButton style={[styles.shadow, { position: 'relative' }]} onPress={() => this.onCart()}>
                                        {
                                            this.hasCart() ? (
                                                <CartIcon color="black" dotColor="#FF2222" width={24} height={24} />
                                            ) : (
                                                <CartEmptyIcon color="black" width={24} height={24} />
                                            )
                                        }
                                    </RoundButton>
                                </View>
                            </Animated.View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 15 }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}
                                    onPress={() => this.props.navigation.navigate("restaurantinfo", { restaurantInfo })}>
                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: "#1A1824" }}>{translate("more-info")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* restaurant info */}
                    <View style={{ paddingHorizontal: 10, paddingVertical: 20, backgroundColor: 'white' }}>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 20, fontWeight: 'bold', color: 'black' }}>{restaurantInfo.name}</Text>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 13, color: 'black', lineHeight: 24 }}>{restaurantInfo.cuisine}</Text>
                        <View style={[styles.descItem, { marginVertical: 5 }]}>
                            <StarIcon width={15} height={15} color="#FF5D5D" />
                            <Text style={[styles.desc, { marginLeft: 5 }]}>{`${restaurantInfo.rating} (${restaurantInfo.total_reviews})`}</Text>
                        </View>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 13, color: '#797979', lineHeight: 18, marginBottom: 5 }}>{restaurantInfo.description}</Text>
                    </View>

                    {
                        restaurantInfo && (restaurantInfo.opening_hours.opened === false || restaurantInfo.is_paused === true) && (
                            <View style={{ paddingHorizontal: 10, paddingVertical: 15, backgroundColor: '#FCF8BE', marginTop: 12, marginHorizontal: 10 }}>
                                <Text style={{ fontFamily: 'Circular Std', fontSize: 13, color: '#C34C05' }}>{restaurantInfo.opening_hours.opened === false ? restaurantInfo.opening_hours.opened_meta : restaurantInfo.is_paused_meta}</Text>
                            </View>
                        )
                    }

                    <View style={{ paddingHorizontal: 10, height: 43, backgroundColor: 'white', marginTop: 12, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.descItem}>
                                <ClockIcon width={15} height={15} color="#1A1824" />
                                <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824', marginLeft: 10 }}>{translate("average-delivery-time")}: </Text>
                                <Text style={[styles.desc, { color: 'black' }]}>{restaurantInfo.timing}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 55, backgroundColor: 'white', marginTop: 12, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View style={{ height: 20, justifyContent: 'center' }}>
                                    <BikeIcon width={15} height={11.6} color="#707070" />
                                </View>
                                <Text style={styles.desc}>{restaurantInfo.delivery_fee}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View style={{ height: 20, justifyContent: 'center' }}>
                                    <FoodIcon width={15} height={15} color="#707070" />
                                </View>
                                <Text style={styles.desc}>min: {restaurantInfo.min_order}</Text>
                            </View>
                            <View style={{ flex: 1.5, alignItems: 'center' }}>
                                <View style={{ height: 20, justifyContent: 'center' }}>
                                    <ShoppingBagIcon width={15} height={15} color="#707070" />
                                </View>
                                <Text style={styles.desc}>Ritiro: {restaurantInfo.pickup ? translate("available") : translate("not available")}</Text>
                            </View>
                        </View>
                    </View>

                    <View onLayout={(e) => this.setState({ categoryOffset: e.nativeEvent.layout.y })}></View>
                    {this.renderProducts()}
                    <View style={{ height: 90 }} />
                </ScrollView>

                {/* confirm button */}
                {
                    this.hasCart() ? (
                        <View style={[styles.bottomAction, { borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}>
                            <Image style={{ flex: 1, backgroundColor: 'white', opacity: 0.9 }} blurRadius={10} />
                            <View style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0, paddingVertical: 20, paddingHorizontal: 20 }}>
                                <FrameButton
                                    backgroundColor="#FF5D5D"
                                    width={'100%'}
                                    // onPress={() => this.props.navigation.navigate("productdetail", { id: cartItem.id, cartItem, listingId: this.state.restaurantInfo.id })}
                                    onPress={
                                        () => {
                                            if (!this.props.signin.profile_info) {
                                                this.props.navigation.navigate("signinlist");
                                            } else {
                                                this.props.navigation.navigate("mycart");
                                            }
                                        }
                                    }
                                    style={{ marginBottom: 20, flexDirection: 'row', paddingHorizontal: 20 }}
                                >
                                    <View style={{ width: 70 }}>
                                        <ButtonText textColor="white" bold style={{ textAlign: 'left' }}>{this.getTotalCartCount(this.props.cart.cartInfo.items)}</ButtonText>
                                    </View>
                                    <ButtonText style={{ flex: 1 }} textColor="white" bold>{translate("you-open")}</ButtonText>
                                    <View style={{ width: 70 }}>
                                        <ButtonText textColor="white" bold style={{ textAlign: 'right' }}>{this.props.cart.cartInfo.cart_total}€</ButtonText>
                                    </View>
                                </FrameButton>
                            </View>
                        </View>
                    ) : (null)
                }
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(RestaurantScreen)