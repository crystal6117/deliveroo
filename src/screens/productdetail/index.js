import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Animated, ImageBackground, Alert } from 'react-native';
import { RoundButton, AddMinusButton } from '../../components/Button';
import { FrameButton, ButtonText } from '../../components/Button';
import FeatherIcon from 'react-native-vector-icons/Feather'
import EntypoIcon from 'react-native-vector-icons/Entypo';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import CeeboHeader1 from '../../components/CeeboHeader1';
import styles from './styles';
import colors from '../../utils/colors';
import { getSessionGuid } from '../../utils/session';
import { connect } from 'react-redux';
import { addToCart, getCart, updateToCart } from '../../apis/cart';
import { setCartInfo } from '../../actions/cart'
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import placeholderImg from '../../../assets/images/placeholder.png';
import { convertPriceStringToFloat } from '../../utils/string';
import { getProductItems } from '../../apis/listing';
import Modal from 'react-native-modal';
import FontistoIcon from 'react-native-vector-icons/Fontisto';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

const RadioItem = (props) => (
    <View style={{ height: 60, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 45, justifyContent: 'center' }}>
                {
                    props.checked ? (
                        <View style={{ width: 26, height: 26, borderRadius: props.checkButton ? 8 : 13, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: "center", }}>
                            <EntypoIcon name="check" color="white" size={12} />
                        </View>
                    ) : (
                            <View style={{ width: 26, height: 26, borderRadius: props.checkButton ? 8 : 13, borderWidth: 1, borderColor: '#D0D0D2' }}></View>
                        )
                }
            </View>
            <View style={{ flex: 1, height: 60, justifyContent: 'center', borderColor: colors.lightgray }}>
                {props.children}
            </View>
        </View>
    </View>
)

class ProductDetailScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            xPosition: new Animated.Value(0),
            detailInfo: null,
            amount: 1,
            special_instructions: '',
            loading: false,
            loadingMsg: "",
            totalPrice: 0,
            canAdd: false,
            visibleValid: false,
            listingId: this.props.navigation.getParam("listingId"),
            offsetPositions: [],
            offset: 0,
            disabledRestaurant: false,
            showCartModal: false,
            yScrollPosition: new Animated.Value(0),
        }
        this.isFixed = false;
    }

    async componentDidMount() {
        var detailInfo = null;
        this.setState({ loading: true });
        if (this.props.navigation.getParam("id") && !this.state.detailInfo) {
            const id = this.props.navigation.getParam("id");
            const cartItem = this.props.navigation.getParam("cartItem");

            this.setState({ id: cartItem.unique_id, loading: true, loadingMsg: "", special_instructions: cartItem.special_instructions, amount: parseInt(cartItem.qty) })
            const variants = cartItem.variants;
            detailInfo = await getProductItems(id);

            const getVariantCount = (mId, vId) => {
                var total = 0;
                for (var iv = 0; iv < variants.length; iv++) {
                    if (variants[iv].id === vId && variants[iv].modifier_group.id === mId) {
                        total += variants[iv].qty;
                    }
                }
                return total;
            }

            if (detailInfo.modifiers && Array.isArray(detailInfo.modifiers)) {
                for (var i = 0; i < detailInfo.modifiers.length; i++) {
                    detailInfo.modifiers[i].count = 0;
                    if (detailInfo.modifiers[i].variants && Array.isArray(detailInfo.modifiers[i].variants)) {
                        for (var j = 0; j < detailInfo.modifiers[i].variants.length; j++) {
                            const variantId = detailInfo.modifiers[i].variants[j].id;
                            const vCnt = getVariantCount(detailInfo.modifiers[i].id, variantId);
                            detailInfo.modifiers[i].variants[j].count = vCnt;
                            detailInfo.modifiers[i].count += vCnt;
                        }
                    }
                }
            }
            this.setState({ loading: false })
        } else {
            const id = this.props.navigation.getParam("itemId");
            detailInfo = await getProductItems(id);
            this.setState({ loading: false })
        }

        detailInfo.fprice = convertPriceStringToFloat(detailInfo.unit_price);
        this.setState({ totalPrice: detailInfo.fprice });
        if (detailInfo.modifiers && Array.isArray(detailInfo.modifiers)) {
            detailInfo.modifiers.forEach((modifier, iM) => {
                if (modifier.variants) {
                    modifier.variants.forEach((variant, iV) => {
                        detailInfo.modifiers[iM].variants[iV].fprice = convertPriceStringToFloat(detailInfo.modifiers[iM].variants[iV].price)
                    })
                }
            })
        }
        var disabledRestaurant = (detailInfo.listing.is_paused || detailInfo.listing.opening_hours.opened === false) ? true : false;
        await this.setState({ detailInfo, disabledRestaurant });
        this.canAddToCart();
        this.calcTotalPrice();
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

    async setItemValue(iM, iV, count) {
        var detailInfo = this.state.detailInfo;
        if (detailInfo.modifiers[iM].required) {
            if (detailInfo.modifiers[iM].min_qty === '1') {
                for (var i = 0; i < detailInfo.modifiers[iM].variants.length; i++) {
                    detailInfo.modifiers[iM].variants[i].count = 0;
                }
                detailInfo.modifiers[iM].count = 1;
                detailInfo.modifiers[iM].variants[iV].count = 1;
            } else {
                detailInfo.modifiers[iM].count = !detailInfo.modifiers[iM].count ? 0 : detailInfo.modifiers[iM].count;
                const estCnt = detailInfo.modifiers[iM].variants[iV].count === 1 ? -1 : 1;
                if (detailInfo.modifiers[iM].count + estCnt > parseInt(detailInfo.modifiers[iM].max_qty)) {
                    return;
                }

                if (detailInfo.modifiers[iM].variants[iV].count) {
                    detailInfo.modifiers[iM].variants[iV].count = 0;
                } else {
                    detailInfo.modifiers[iM].variants[iV].count = 1;
                }

                detailInfo.modifiers[iM].count += estCnt
            }
        } else {
            if (detailInfo.modifiers[iM].count === parseInt(detailInfo.modifiers[iM].max_qty)) {
                return;
            }

            if (detailInfo.modifiers[iM].variants[iV].count) {
                detailInfo.modifiers[iM].variants[iV].count += count;
            } else {
                detailInfo.modifiers[iM].variants[iV].count = count;
            }

            if (detailInfo.modifiers[iM].count) {
                detailInfo.modifiers[iM].count += count;
            } else {
                detailInfo.modifiers[iM].count = count;
            }
        }
        await this.setState({ detailInfo })

        this.canAddToCart();
        this.calcTotalPrice();
    }

    calcTotalPrice() {
        var detailInfo = this.state.detailInfo;
        var total = detailInfo.fprice;
        if (detailInfo.modifiers) {
            detailInfo.modifiers.forEach((modifier, iM) => {
                if (modifier.variants) {
                    modifier.variants.forEach((variant, iV) => {
                        if (variant.count)
                            total = total + variant.count * variant.fprice;
                    })
                }
            })
        }
        total = total * this.state.amount;
        this.setState({ totalPrice: total })
    }

    async resetItemCount(iM, iV) {
        var detailInfo = this.state.detailInfo;
        detailInfo.modifiers[iM].variants[iV].count = 0;
        detailInfo.modifiers[iM].count = 0;
        for (var i = 0; i < detailInfo.modifiers[iM].variants.length; i++) {
            detailInfo.modifiers[iM].count += detailInfo.modifiers[iM].variants[i].count ? detailInfo.modifiers[iM].variants[i].count : 0
        }
        await this.setState({ detailInfo });
        this.canAddToCart();
        this.calcTotalPrice();
    }

    canAddToCart() {
        var detailInfo = this.state.detailInfo;
        var canAdd = true;
        if (detailInfo.modifiers) {
            for (var i = 0; i < detailInfo.modifiers.length; i++) {
                if (detailInfo.modifiers[i].required) {
                    const min = parseInt(detailInfo.modifiers[i].min_qty);
                    const max = parseInt(detailInfo.modifiers[i].max_qty);
                    if (!detailInfo.modifiers[i].count || detailInfo.modifiers[i].count < min || (max && detailInfo.modifiers[i].count > max)) {
                        canAdd = false
                        detailInfo.modifiers[i].invalid = true
                    } else {
                        detailInfo.modifiers[i].invalid = false
                    }
                } else {
                    detailInfo.modifiers[i].invalid = false
                }
            }
        }
        this.setState({ canAdd, detailInfo })
    }

    addToCartWithValidation = async () => {
        this.setState({ showCartModal: false });
        const { detailInfo } = this.state;
        this.setState({ loading: true, loadingMsg: translate("adding-to-cart") })

        const sessId = await getSessionGuid()

        var params = {
            item_id: detailInfo.id,
            listing_id: this.state.listingId,
            session_guid: sessId,
            special_instructions: this.state.special_instructions,
            qty: this.state.amount,
            variants: []
        }

        if (detailInfo.modifiers) {
            detailInfo.modifiers.forEach(modifier => {
                if (modifier.variants) {
                    modifier.variants.forEach(variant => {
                        if (variant.count) {
                            const v = {
                                id: variant.id,
                                qty: variant.count,
                                modifier_group: modifier.id
                            }
                            params.variants.push(v);
                        }
                    })
                }
            })
        }

        var opFunc = null;
        if (this.state.id) {
            params.unique_id = this.state.id;
            opFunc = updateToCart;
        } else {
            opFunc = addToCart;
        }

        opFunc(params).then(res => {
            getCart().then(cartData => {
                this.props.setCartInfo(cartData);
            })
            this.setState({ loading: false });
            this.props.navigation.goBack();
        }).catch(error => {
            this.setState({ loading: false });
            console.log("ceebo-log-addToCart-error", error)
            Toast.show(error);
        })
    }

    async onAddToCart() {
        this.setState({ showCartModal: false });
        const { detailInfo } = this.state;

        if (!this.state.canAdd) {
            if (detailInfo.modifiers) {
                var firstInvalidModifier = 0;
                for (var i = 0; i < detailInfo.modifiers.length; i++) {
                    if (detailInfo.modifiers[i].invalid) {
                        firstInvalidModifier = i;
                        break;
                    }
                }
                this.scrollView.scrollTo({
                    x: 0,
                    y: this.state.offset + this.state.offsetPositions[firstInvalidModifier] - 10,
                    animated: true
                })
            }

            Toast.show(translate("check-item-again"));
            this.setState({ visibleValid: true })
            return;
        }
        
        if (Array.isArray(this.props.cart.cartInfo) || this.props.cart.cartInfo?.listing?.id === this.state.detailInfo.listing.id) {
            this.addToCartWithValidation();
        } else {
            this.setState({ showCartModal: true })
        }
    }

    onGetScrollPosition(iM, posY) {
        var offsetPositions = this.state.offsetPositions;
        offsetPositions[iM] = posY
        this.setState({ offsetPositions });
    }

    renderModifierValid(modifier) {
        if (!this.state.visibleValid || modifier.invalid === false) {
            return (
                <View style={{ marginTop: 5 }}>
                    <Text style={{ color: 'lightgray' }}>{modifier.modifier_label}</Text>
                </View>
            )
        }

        if (!modifier.required) {
            return (
                <View style={{ marginTop: 5 }}>
                    <Text style={{ color: 'lightgray' }}>{modifier.modifier_label}</Text>
                </View>
            )
        } else {
            return (
                <View style={{ marginTop: 5 }}>
                    <Text style={{ color: 'red' }}>{modifier.modifier_label}</Text>
                </View>
            )
        }
    }

    renderModifier = (modifier, iM) => {
        switch (modifier.type_field) {
            case 'radio':
                return (
                    <View key={iM} onLayout={e => this.onGetScrollPosition(iM, e.nativeEvent.layout.y)}>
                        <View style={styles.modifierTitle}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 18, fontWeight: 'bold', color: "#1A1A1A" }}>{modifier.name}</Text>
                            {this.renderModifierValid(modifier)}
                        </View>
                        {
                            modifier.variants && modifier.variants.length > 0 && modifier.variants.map((variant, iV) => (
                                <TouchableOpacity key={iV} onPress={() => this.setItemValue(iM, iV, 1)}>
                                    <RadioItem checked={variant.count ? true : false}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824', flex: 1 }}>{variant.name}</Text>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: '#707070', fontWeight: 'bold' }}>+ {variant.price}</Text>
                                        </View>
                                    </RadioItem>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                )
            case 'checkbox':
                return (
                    <View key={iM} onLayout={e => this.onGetScrollPosition(iM, e.nativeEvent.layout.y)}>
                        <View style={styles.modifierTitle}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 18, fontWeight: 'bold', color: "#1A1A1A" }}>{modifier.name}</Text>
                            {this.renderModifierValid(modifier)}
                        </View>
                        {
                            modifier.variants && modifier.variants.length > 0 && modifier.variants.map((variant, iV) => (
                                <TouchableOpacity key={iV} onPress={() => this.setItemValue(iM, iV, 1)}>
                                    <RadioItem checked={variant.count ? true : false} checkButton>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824', flex: 1 }}>{variant.name}</Text>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: '#707070', fontWeight: 'bold' }}>+ {variant.price}</Text>
                                        </View>
                                    </RadioItem>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                )
            case 'multiple':
                return (
                    <View key={iM} onLayout={e => this.onGetScrollPosition(iM, e.nativeEvent.layout.y)}>
                        <View style={styles.modifierTitle}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 18, fontWeight: 'bold', color: "#1A1A1A" }}>{modifier.name}</Text>
                            {this.renderModifierValid(modifier)}
                        </View>
                        {
                            modifier.variants && modifier.variants.length > 0 && modifier.variants.map((variant, iV) => (
                                <TouchableOpacity key={iV} onPress={() => this.setItemValue(iM, iV, 1)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 58 }}>
                                        <View style={{ width: 40 }}>
                                            {!variant.count ? (
                                                <View style={{ marginLeft: 10, width: 12, height: 12, borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 6 }}></View>
                                            ) : (
                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 17, fontWeight: 'bold', color: "#FF5D5D" }}>{variant.count}X</Text>
                                                )}
                                        </View>
                                        <Text style={{ flex: 1, fontFamily: 'Circular Std', fontSize: 14, color: "#1A1824" }}>{variant.name}(<Text style={{ color: '#898989' }}>+ {variant.price}</Text>)</Text>
                                        <View style={{ width: 60, alignItems: 'center', justifyContent: 'center' }}>
                                            <TouchableOpacity onPress={() => this.resetItemCount(iM, iV)}>
                                                <AntDesignIcon name="close" size={20} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                )
            default:
                return null;
        }
    }

    render() {
        let { xPosition, detailInfo, totalPrice } = this.state;

        if (!detailInfo) return (
            <Spinner visible={this.state.loading} textContent={this.state.loadingMsg} textStyle={{ color: '#FFF' }} />
        );

        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent={this.state.loadingMsg} textStyle={{ color: '#FFF' }} />
                <Animated.View
                    style={[styles.shadow, {
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        backgroundColor: 'white',
                        zIndex: 99,
                        elevation: 5,
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
                    }]}
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
                        <Text style={styles.title}>{detailInfo.name}</Text>
                    </CeeboHeader1>
                </Animated.View>
                <ScrollView
                    style={{ flex: 1 }}
                    scrollIndicatorInsets={{ right: 1 }}
                    scrollEventThrottle={1}
                    // onScroll={(event) => this.onScrollView(event)} 
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.yScrollPosition } } }]
                    )}
                    ref={ref => this.scrollView = ref}
                >
                    {
                        detailInfo.image_url ? (
                            <View style={{ width: '100%', height: 270 }}>
                                <Image source={placeholderImg} style={{ width: '100%', height: 270 }} />
                                {
                                    detailInfo.image_url ? (
                                        <Image source={{ uri: detailInfo.image_url }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 270, zIndex: 2 }} imageStyle={{ resizeMode: 'cover', overflow: 'hidden' }} />
                                    ) : (null)
                                }
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        top: 15 + this.props.appInfo.statusbarHeight,
                                        left: 10,
                                        zIndex: 3,
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
                            </View>
                        ) : (
                                <View style={{ width: '100%', height: 100 }}>
                                    <Animated.View
                                        style={{
                                            position: 'absolute',
                                            top: 15 + this.props.appInfo.statusbarHeight,
                                            left: 10,
                                            zIndex: 3,
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
                                </View>
                            )
                    }
                    <View style={{ paddingTop: 30, paddingBottom: 50, paddingHorizontal: 15 }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 30, color: '#1A1824', marginBottom: 20 }}>{detailInfo.name}</Text>
                        <Text style={styles.desc}>{detailInfo.description}</Text>
                        <View onLayout={e => this.setState({ offset: e.nativeEvent.layout.y })}>
                            {
                                detailInfo.modifiers && detailInfo.modifiers.length > 0 && detailInfo.modifiers.map((modifier, iM) => this.renderModifier(modifier, iM))
                            }
                        </View>
                    </View>

                    <View style={{ marginBottom: 40 }}>
                        <TouchableOpacity
                            style={{ height: 50, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.lightgray, alignItems: 'center', paddingHorizontal: 10, flexDirection: 'row', marginBottom: 10 }}
                            onPress={() => this.props.navigation.navigate("productnote", {
                                spec: this.state.special_instructions, onDone: (newSpec) => {
                                    this.setState({ special_instructions: newSpec });
                                }
                            })}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', flex: 1 }}>{translate("add-flat-information")}</Text>
                            <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                        </TouchableOpacity>
                        <Text style={[styles.desc, { marginHorizontal: 20 }]}>{this.state.special_instructions}</Text>
                    </View>
                    <View style={{ height: 90 }} />
                </ScrollView>

                {/* confirm button */}
                <View style={[styles.bottomAction, { borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}>
                    <Image style={{ flex: 1, backgroundColor: 'white', opacity: 0.9 }} blurRadius={10}>
                    </Image>
                    <View style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0, paddingVertical: 20 }}>
                        <View style={{ paddingHorizontal: 10, flexDirection: 'row', flex: 1 }}>
                            <View style={{ paddingRight: 10, flex: 10, backgroundColor: '#F5F6F8', borderRadius: 25, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                <TouchableOpacity onPress={async () => {
                                    if (this.state.amount === 1) return;
                                    await this.setState({ amount: this.state.amount - 1 })
                                    this.calcTotalPrice()
                                }}>
                                    <FeatherIcon name="minus" color="#A2A8B0" size={25} />
                                </TouchableOpacity>
                                <Text style={{ paddingHorizontal: 10, fontFamily: 'Circular Std', fontSize: 20, color: '#2C323A', fontWeight: 'bold' }}>{this.state.amount}</Text>
                                <TouchableOpacity onPress={async () => {
                                    await this.setState({ amount: this.state.amount + 1 })
                                    this.calcTotalPrice()
                                }
                                }>
                                    <FeatherIcon name="plus" color="#A2A8B0" size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingLeft: 10, flex: 16 }}>
                                {
                                    this.state.disabledRestaurant ? (
                                        <FrameButton
                                            backgroundColor="gray"
                                            width={'100%'}
                                            height={48}
                                            style={{ flexDirection: 'row' }}
                                            onPress={() => Toast.show("Can't order in this restaurant.")}
                                        >
                                            <ButtonText textColor="white" style={{ flex: 1 }}>{this.state.id ? translate("update") : translate("add")}</ButtonText>
                                            <View style={{ width: 80, alignItems: 'flex-end' }}>
                                                <ButtonText textColor="white" style={{ paddingRight: 20 }}>{totalPrice}€</ButtonText>
                                            </View>
                                        </FrameButton>
                                    ) : (
                                            <FrameButton
                                                backgroundColor="#FF5D5D"
                                                width={'100%'}
                                                height={48}
                                                style={{ flexDirection: 'row' }}
                                                onPress={() => this.onAddToCart()}
                                            >
                                                <ButtonText textColor="white" style={{ flex: 1 }}>{this.state.id ? translate("update") : translate("add")}</ButtonText>
                                                <View style={{ width: 80, alignItems: 'flex-end' }}>
                                                    <ButtonText textColor="white" style={{ paddingRight: 20 }}>{totalPrice} €</ButtonText>
                                                </View>
                                            </FrameButton>
                                        )
                                }
                            </View>
                        </View>
                    </View>
                </View>

                <Modal
                    isVisible={this.state.showCartModal}
                    deviceHeight={screenHei}
                    deviceWidth={screenWid}
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    backdropOpacity={0.0}
                    onBackdropPress={() => this.setState({ showCartModal: false })}>

                    <View style={[styles.shadow, { width: screenWid * 0.75, backgroundColor: 'white' }]}>
                        {
                            this.props.cart.cartInfo.listing ? (
                                <>
                                    <View style={{ height: 50, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 10 }}>
                                        <TouchableOpacity onPress={() => this.setState({ showCartModal: false })} style={{ padding: 7 }}>
                                            <FontistoIcon name="close-a" size={15} />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={[styles.title, { fontWeight: 'bold' }]}>{translate("start-new-cart")}</Text>
                                    <Text style={[styles.desc, { paddingHorizontal: 30, paddingVertical: 10, textAlign: 'center' }]}>{translate("start-new-cart-desc").replace("'****'", `"${this.props.cart.cartInfo.listing.name}"`)}</Text>
                                    <View style={{ alignItems: 'center', paddingBottom: 30 }}>
                                        <FrameButton
                                            backgroundColor="#FF5D5D"
                                            width={'75%'}
                                            onPress={() => this.addToCartWithValidation()}
                                        >
                                            <ButtonText textColor="white">{translate("sound-good")}</ButtonText>
                                        </FrameButton>
                                    </View>
                                </>
                            ) : (null)
                        }
                    </View>
                </Modal>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

const mapDispatchToProps = dispatch => {
    return {
        setCartInfo: (cartData) => { dispatch(setCartInfo(cartData)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailScreen)