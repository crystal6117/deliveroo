import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { FrameButton, ButtonText, AddMinusButton } from '../../components/Button';
import EntypoIcon from 'react-native-vector-icons/Entypo'
import FeatherIcon from 'react-native-vector-icons/Feather'
import Modal from 'react-native-modal';
import { Divider } from '../../components/Divider';
import styles from './styles';
import { connect } from 'react-redux';
import colors from '../../utils/colors';
import { updateQTY, getCart, deleteCartItem } from '../../apis/cart';
import { setCartInfo } from '../../actions/cart';
import Spinner from 'react-native-loading-spinner-overlay'
import { ceeboAlert } from '../../utils/alert';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class MyCartScreen extends Component {
    constructor() {
        super();
        this.state = {
            isEdit: false,
            activeItem: null,
            activeNo: -1,

            address: null,
            popup: false,
            cartInfo: null,
            rSelected: 'delivery',
            deliveryTime: 'ASAP',
            notes: '',
            amount: 0,
            loading: false,
            loadingMsg: ''
        }
        this.weekNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    }

    componentDidMount() {
        if (this.props.addresses && this.props.addresses.length > 0) {
            this.setState({ address: this.props.addresses[0] })
        }

        if (this.props.cart.restaurantNote) {
            this.setState({notes: this.props.cart.restaurantNote});
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const cartInfo = nextProps.cartInfo;
        var openHoursWithStartEnd = {}
        if (cartInfo && !Array.isArray(cartInfo) && cartInfo.length !== 0) {
            const weekNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            weekNames.forEach(dialy => {
                const openhours = cartInfo?.listing?.opening_hours?.hours[dialy];
                var dialyHours = []
                if (openhours) {
                    openhours.forEach(item => {
                        if (item) {
                            const res = item.split('-');
                            dialyHours.push({
                                start: res[0],
                                end: res[1] === '00:00' ? '24:00' : res[1]
                            })
                        }
                    })
                }
                openHoursWithStartEnd[dialy] = dialyHours;
            });
        }

        return {
            cartInfo,
            openHours: openHoursWithStartEnd
        }
    }

    onDeleteProductFromCart(item) {
        Alert.alert(
            translate("cart-alert-title"),
            translate("cart-delete-item"),
            [
                {
                    text: "No", onPress: () => { }
                },
                {
                    text: translate("yes"), onPress: () => this.onDeleteItem(item)
                }
            ],
            { cancelable: true }
        );
    }

    onDeleteItem(item) {
        const id = item.unique_id;
        this.setState({ loading: true, popup: false })
        deleteCartItem(id).then(res => {
            getCart().then(cartData => {
                this.props.setCartInfo(cartData);
                this.setState({ loading: false })
            })
        }).catch(error => {
            this.setState({ loading: false })
            setTimeout(() => {
                Alert.alert('', error)
            }, 400)
        })
    }

    onUpdateNote() {
        this.props.navigation.navigate("restaurantnote", { notes: this.state.notes, onDone: (notes) => this.setState({ notes }) })
    }

    getDeliveryStringFromDate(todayTime) {
        if (!todayTime) return "";

        var timeStr = "";
        const hour = todayTime.getHours();
        const minute = todayTime.getMinutes();
        if (hour < 10) timeStr += "0"
        timeStr += hour
        timeStr += ":"
        if (minute < 10) timeStr += "0"
        timeStr += minute
        return timeStr;
    }

    checkValidation(date) {
        const weekNo = date.getDay();
        const timeStr = this.getDeliveryStringFromDate(date)
        const openHours = this.state.openHours[this.weekNames[weekNo]]

        var valid = false;
        openHours.forEach(openHour => {
            console.log(timeStr, `${openHour.start} ~ ${openHour.end}`)
            if (openHour.start <= timeStr && openHour.end >= timeStr) {
                valid = true;
            }
        })

        if (valid) return '';
        else return translate("restaurant-closed");
    }

    onCheckout() {
        const min_order = parseFloat(this.state.cartInfo.listing.min_order);
        const total = parseFloat(this.state.cartInfo.cart_subtotal);
        if (min_order > total) {
            Alert.alert(translate("cart-alert-title"), translate(`min-order-desc`).replace('***', this.state.cartInfo.listing.min_order));
            return;
        }

        if (this.state.deliveryTime === 'ASAP') {
            const validRes = this.checkValidation(new Date());
            if (validRes !== '') {
                ceeboAlert(validRes);
                return;
            }
        }

        const params = {
            address: this.state.address,
            rSelected: this.state.rSelected,
            deliveryTime: this.state.deliveryTime,
            notes: this.state.notes,
            pickup: this.state.cartInfo.listing.pickup,
            paymethod: this.state.cartInfo.listing.payment_methods
        }
        this.props.navigation.navigate("checkout", params)
    }

    onApplyAmount() {
        const amount = this.state.amount;
        const id = this.state.activeItem.unique_id;
        this.setState({ popup: false })
        setTimeout(() => {
            this.setState({ loading: true })
            updateQTY(id, amount).then(res => {
                getCart().then(cartData => {
                    this.props.setCartInfo(cartData);
                    this.setState({ loading: false })
                })
            }).catch(error => {
                this.setState({ loading: false })
                setTimeout(() => {
                    Alert.alert('', error);
                }, 400)
            })
        }, 400)
    }

    calcPopupTotal() {
        const unitPrice = this.state.activeItem.total_price / parseInt(this.state.activeItem.qty);
        var totalPrice = unitPrice * this.state.amount;
        return Math.round(totalPrice * 100) / 100;
    }

    renderPopup() {
        if (this.state.activeItem === null)
            return (<View></View>);

        return (
            <View style={[styles.shadow, { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 20, padding: 20, paddingBottom: 30 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: "#1A1A1A", fontWeight: 'bold', flex: 1 }}>{this.state.activeItem.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AddMinusButton minus onPress={() => {
                            var amount = this.state.amount;
                            if (amount > 1) {
                                amount--;
                                this.setState({ amount })
                            }
                        }}>
                            <FeatherIcon name="minus" color="white" size={25} />
                        </AddMinusButton>
                        <Text style={{ paddingHorizontal: 10, fontFamily: 'Circular Std', fontSize: 16, color: "#1A1A1A", fontWeight: 'bold' }}>{this.state.amount}</Text>
                        <AddMinusButton onPress={() => {
                            var amount = this.state.amount;
                            amount++;
                            this.setState({ amount })
                        }}>
                            <FeatherIcon name="plus" color="white" size={25} />
                        </AddMinusButton>
                    </View>
                </View>

                {
                    this.state.activeItem.variants && this.state.activeItem.variants.map((variant, i) => (
                        <Text style={[styles.grayTitle, { paddingLeft: 30 }]} key={i}>{variant.name}</Text>
                    ))
                }

                <TouchableOpacity onPress={() => {
                    this.setState({ popup: false })
                    this.props.navigation.navigate("productdetail", { id: this.state.activeItem.id, cartItem: this.state.activeItem, listingId: this.state.cartInfo.listing.id })
                }}
                >
                    <Text style={{ fontFamily: 'Circular Std', fontSize: 13, color: '#FF5D5D', textAlign: 'center', marginVertical: 10 }}>{translate("custom-item")}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.rightRedlbl, { fontSize: 16, flex: 1 }]}>{translate("total")}</Text>
                    <Text style={[styles.rightRedlbl, { fontSize: 16 }]}>{this.calcPopupTotal()} €</Text>
                </View>

                <View style={{ paddingHorizontal: 0, paddingTop: 12 }}>
                    <FrameButton
                        backgroundColor="#FF5D5D"
                        width='100%'
                        onPress={() => this.onApplyAmount()}
                    >
                        <ButtonText textColor="white">{translate("confirm")}</ButtonText>
                    </FrameButton>
                </View>
            </View>
        )
    }

    render() {
        if (!(this.state.cartInfo && this.state.cartInfo.items)) {
            return (
                <View style={styles.container}>
                    <CeeboHeader1
                        left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                        offset={this.props.appInfo.statusbarHeight}
                    >
                        <Text style={styles.title}>{translate("shopping-cart")}</Text>
                    </CeeboHeader1>
                    <View style={{ flex: 1, paddingBottom: 40 }}>
                        <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 20 }}>{translate("empty-cart")}</Text>
                        <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.props.navigation.navigate("home")}
                            >
                                <ButtonText textColor="white">{translate("explore-restaurants")}</ButtonText>
                            </FrameButton>
                        </View>
                    </View>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent={this.state.loadingMsg} textStyle={{ color: '#FFF' }} />
                {(this.state.cartInfo && this.state.cartInfo.items) ? (
                    <CeeboHeader1
                        left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                        right={{ type: 'text', name: this.state.isEdit ? translate("done") : translate("edit"), fontFamily: 'Circular Std', size: 16, color: '#FE5D5D', callback: () => this.setState({ isEdit: !this.state.isEdit }) }}
                        offset={this.props.appInfo.statusbarHeight}
                    >
                        <Text style={styles.title}>{translate("shopping-cart")}</Text>
                    </CeeboHeader1>
                ) : (
                        <CeeboHeader1
                            left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                            offset={this.props.appInfo.statusbarHeight}
                        >
                            <Text style={styles.title}>{translate("shopping-cart")}</Text>
                        </CeeboHeader1>
                    )}
                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 35, paddingBottom: 25 }}>

                        <Divider left={0} />

                        <TouchableOpacity
                            style={{ height: 60, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginBottom: 30 }}
                            onPress={() =>
                                this.props.navigation.navigate("deliverytime", {
                                    deliveryTime: this.state.deliveryTime,
                                    restaurantInfo: this.state.cartInfo.listing,
                                    onDone: (deliveryTime) => this.setState({ deliveryTime })
                                })
                            }>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.grayTitle}>{translate("delivery-time")}:</Text>
                                <Text style={styles.txtContent}>{this.state.deliveryTime === "ASAP" ? "Il prima possibile" : this.state.deliveryTime}</Text>
                            </View>
                            <Text style={styles.rightRedlbl}>{translate("tax")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ height: 60, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' }}
                            onPress={() => this.props.navigation.navigate("restaurant", { id: this.state.cartInfo.listing.id })}>
                            <Text style={[styles.subtitle, { flex: 1 }]}>{this.state.cartInfo.listing.name}</Text>
                            <Text style={styles.rightRedlbl}>{translate("see-menu")}</Text>
                        </TouchableOpacity>

                        <Divider left={15} />

                        <View style={{ backgroundColor: 'white', marginTop: 22 }}>
                            <View style={{ height: 44, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.grayTitle}>{translate("select-product-to-change")}</Text>
                            </View>
                            <Divider left={30} />
                            {
                                this.state.cartInfo && this.state.cartInfo.items && this.state.cartInfo.items.map((item, index) => (
                                    <TouchableOpacity
                                        style={{ paddingLeft: 30 }} key={index}
                                        onPress={() => {
                                            const activeItem = { ...this.state.cartInfo.items[index] }
                                            this.setState({ activeNo: index, activeItem, popup: true, amount: activeItem.qty })
                                        }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingVertical: 15 }}>
                                            {this.state.isEdit ? (
                                                <View style={{ width: 40, alignItems: 'flex-start' }}>
                                                    <TouchableOpacity style={{ paddingVertical: 5 }} onPress={() => this.onDeleteProductFromCart(item)}>
                                                        <EntypoIcon name="circle-with-minus" color="#FF5D5D" size={20} />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (null)}
                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.subtitle, { marginBottom: 5 }]}>{item.qty + 'x   ' + item.name}</Text>
                                                    {
                                                        item.variants && item.variants.map((varaint, i) => (
                                                            <Text style={[styles.grayTitle, { paddingLeft: 30 }]} key={i}>{varaint.name}</Text>
                                                        ))
                                                    }
                                                    <Text style={[styles.grayTitle]}>{item.special_instructions}</Text>
                                                </View>
                                                <Text style={styles.rightRedlbl}>{item.total_price} €</Text>
                                            </View>
                                        </View>
                                        <Divider left={0} />
                                    </TouchableOpacity>
                                ))
                            }

                            {
                                (this.state.cartInfo && this.state.cartInfo.items) ? (
                                    <View style={{ paddingLeft: 30, paddingRight: 15, paddingVertical: 15 }}>
                                        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                            <Text style={[styles.grayTitle, { flex: 1 }]}>{translate("total")}</Text>
                                            <Text style={styles.grayTitle}>{this.state.cartInfo ? `${this.state.cartInfo.cart_subtotal} €` : ''}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                            <Text style={[styles.grayTitle, { flex: 1 }]}>{translate("delivery")}</Text>
                                            <Text style={styles.grayTitle}>{this.state.cartInfo ? `${this.state.cartInfo.delivery_fee} €` : ''}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={[styles.grayTitle, { flex: 1 }]}>{translate("service-cost")}</Text>
                                            <Text style={styles.grayTitle}>{this.state.cartInfo ? `${this.state.cartInfo.purchase_fee} €` : ''}</Text>
                                        </View>
                                    </View>
                                ) : (
                                        <View style={{ marginVertical: 30, paddingHorizontal: 15 }}>
                                            <Text style={{ textAlign: 'center', fontSize: 14 }}>{translate("no-cart")}</Text>
                                        </View>
                                    )
                            }
                        </View>

                        <TouchableOpacity style={{ marginTop: 22, backgroundColor: 'white', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: colors.lightgray }} onPress={() => this.onUpdateNote()}>
                            <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 }}>
                                <Text style={[styles.subtitle, { flex: 1 }]}>{translate("add-restaurant-comment-title")}</Text>
                                <Text style={styles.rightRedlbl}>{translate("add")}</Text>
                            </View>
                            {this.state.notes ? <Text style={{ paddingHorizontal: 15, paddingBottom: 10 }}>{this.state.notes}</Text> : null}
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {
                    (this.state.cartInfo && this.state.cartInfo.items) ? (
                        <View style={[styles.shadow, { paddingBottom: 30, borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}>
                            <View style={{ paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row' }}>
                                <Text style={[styles.txtContent, { flex: 1, color: '#FF5D5D' }]}>{translate("total")}</Text>
                                <Text style={[styles.txtContent, { color: '#FF5D5D' }]}>{this.state.cartInfo ? `${this.state.cartInfo.cart_total} €` : ''}</Text>
                            </View>
                            <Divider left={15} />

                            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
                                <FrameButton
                                    backgroundColor="#FF5D5D"
                                    width='100%'
                                    onPress={() => this.onCheckout()}
                                >
                                    <ButtonText textColor="white">{translate("proceed")}</ButtonText>
                                </FrameButton>
                            </View>
                        </View>
                    ) : (null)
                }
                <Modal
                    isVisible={this.state.popup}
                    deviceHeight={screenHei}
                    deviceWidth={screenWid}
                    style={{ margin: 0, justifyContent: 'flex-end' }}
                    backdropOpacity={0.0}
                    onBackdropPress={() => this.setState({ popup: false })}>
                    {this.renderPopup()}
                </Modal>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return {
        cartInfo: state.cart.cartInfo,
        addresses: state.signin.profile_info.addresses,
        ...state
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCartInfo: (cartData) => { dispatch(setCartInfo(cartData)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyCartScreen)