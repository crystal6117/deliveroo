import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert, Image, ActivityIndicator } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { FrameButton, ButtonText } from '../../components/Button';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import Modal from 'react-native-modal';
import { Divider } from '../../components/Divider';
import checkoutImg from '../../../assets/images/checkout.png';
import styles from './styles';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { getSessionGuid, getSession } from '../../utils/session';
import { checkout, getCart, checkAddress } from '../../apis/cart';
import { ceeboAlert } from '../../utils/alert';
import { setCartInfo, setCartRestaurantNote } from '../../actions/cart'
import { getDefaultAddress } from '../../apis/address';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { StackActions, NavigationActions } from 'react-navigation';
import { getAllCards } from '../../apis/card';
import { customRound } from '../../utils/math';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

const RadioItem = (props) => (
    <TouchableOpacity
        style={{ paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', height: 58 }}
        onPress={() => props.onPress()}>
        <View style={{ width: 40 }}>
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
        <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: "#1A1824" }}>{props.name}</Text>
    </TouchableOpacity>
)

class CheckoutScreen extends Component {
    constructor() {
        super()
        this.state = {
            completed: false,
            address: null,
            rSelected: 'delivery',
            deliveryTime: null,
            notes: null,
            checkouting: false,
            pMethod: null,
            card: null,
            riderInfo: '',
            phonenumber: '',
            pickup: null,
            paymethod: null,
            loading: true,
            total: null,
            isValidAddress: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            total: nextProps.cartInfo.cart_total
        }
    }

    async componentDidMount() {
        const paymethod = this.props.navigation.getParam("paymethod")
        this.setState({
            notes: this.props.navigation.getParam("notes"),
            deliveryTime: this.props.navigation.getParam("deliveryTime"),
            pickup: this.props.navigation.getParam("pickup"),
            paymethod
        })

        if (paymethod['credit-card']) {
            await this.setState({ pMethod: 'credit-card' });
        } else if (paymethod['cash']) {
            await this.setState({ pMethod: 'cash' })
        }

        await this.onChangeType(this.state.rSelected, this.state.pMethod);

        const isCurrentPosition = await getSession("ISCURRENTPOSITION");
        if (isCurrentPosition && this.props.addressStatus?.validated) {
            const address = await getDefaultAddress();
            if (address) {
                this.setState({ address, riderInfo: address.notes, phonenumber: address.phone_number });
                const listingId = this.props.cart.cartInfo.listing.id;
                try {
                    await checkAddress(listingId, address.id);
                    this.setState({ isValidAddress: true })
                } catch (error) {
                    this.setState({ isValidAddress: false })
                }
            } else {
                this.emptyAddress();
            }
        } else {
            this.emptyAddress();
        }

        const cards = await getAllCards();
        this.setState({ card: cards[0] })

        this.setState({ loading: false })
    }

    emptyAddress() {
        this.setState({ loading: false })
        setTimeout(() => {
            Alert.alert(
                translate("delivery") + "?",
                translate("select-address-for-delivery"),
                [
                    {
                        text: translate("use-pickup"), onPress: () => {
                            if (this.state.pickup){
                                this.onChangeType('pickup', this.state.pMethod);
                            }
                        }
                    }, {
                        text: 'Ok', onPress: () => this.onChangeAddress(), style: 'default'
                    }
                ],
                { cancelable: false }
            )
        }, 400)
    }

    getExpiryDate(card) {
        const month = card.exp_month >= 10 ? "" + card.exp_month : "0" + card.exp_month;
        const year = card.exp_year - 2000 + "";
        return month + "/" + year;
    }

    getDeliveryTime() {
        if (!this.state.deliveryTime) return '';
        if (this.state.deliveryTime === 'ASAP') return translate('asap');
        return this.state.deliveryTime
    }

    onChangeCard() {
        this.props.navigation.navigate("paymentmethod", { checkout: true, card: this.state.card, onDone: (card) => this.setState({ card }) })
    }

    onAddCard() {
        this.props.navigation.navigate("paymentmethod", { checkout: true, card: this.state.card, onDone: (card) => this.setState({ card }) })
    }

    async onCheckout() {
        this.setState({ checkouting: true })

        const param = {
            type: this.state.rSelected,
            delivery_time: this.state.deliveryTime,
            session_guid: await getSessionGuid(),
            payment_method: this.state.pMethod,
            // address_id: this.state.address.id,
            notes: this.state.notes
        }

        if (this.state.rSelected === 'delivery') {
            param.address_id = this.state.address.id
        }

        if (this.state.pMethod === 'credit-card') {
            param.source_id = this.state.card.id
        }

        console.log("*********** checkout param", param);
        return ;

        checkout(param).then(async orderId => {
            this.props.setCartRestaurantNote('');
            const res = await getCart(this.state.pMethod, this.state.rSelected);
            this.props.setCartInfo(res);
            this.setState({ completed: true, orderId, checkouting: false })
        }).catch(error => {
            this.setState({ checkouting: false });
            setTimeout(() => {
                ceeboAlert(error);
            }, 300)
        })
    }

    onConfirm() {
        const resetAction = StackActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({ routeName: 'home' }),
                NavigationActions.navigate({ routeName: 'myorders' })
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    onChangeAddress() {
        this.props.navigation.navigate("myaddress", { selectAddress: true, onDone: (address) => this.setState({ address, isValidAddress: true }) })
    }

    onUpdateBellboyInfo() {
        if (!this.state.address) {
            return;
        }
        this.props.navigation.navigate("bellboy", {
            address: this.state.address,
            onDone: (riderInfo, phonenumber) => {
                var address = this.state.address
                address.notes = riderInfo;
                address.phone_number = phonenumber;
                this.setState({ address });
            }
        });
    }

    getPaymentTitle(payment) {
        if (!payment) return ''
        if (!payment['cash']) {
            return translate("not-accept-cash")
        } else if (payment['cash'] && !payment['credit-card']) {
            return translate("only-accept-cash")
        } else {
            return translate("accept-cash")
        }
    }

    onChangeType = async (type, payment) => {
        this.setState({ rSelected: type, pMethod: payment });
        const res = await getCart(payment, type)
        this.props.setCartInfo(res);
    }

    isCheckoutable = () => {
        if (!this.props.cart.cartInfo) {
            return { success: false, message: 'No Cart!' };
        }

        if (this.state.rSelected !== 'pickup' && !this.state.address) {
            return { success: false, message: translate("choose-address") };
        }

        if (this.state.rSelected !== 'pickup' && !this.state.isValidAddress) {
            return { success: false, message: translate("invalid-address") };
        }

        if (this.state.pMethod === 'credit-card' && !this.state.card) {
            return { success: false, message: translate("choose-card") };
        }

        return { success: true };
    }

    render() {
        const checkoutState = this.isCheckoutable();
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.checkouting} textContent="Processing ..." textStyle={{ color: '#FFF' }} />
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
                    <Text style={styles.title}>{translate("payment-method")}</Text>
                </CeeboHeader1>
                {
                    this.state.loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    ) : (
                            <>
                                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                                    <View style={{ paddingTop: 35, paddingBottom: 30 }}>

                                        <View style={{ marginBottom: 22, flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#EFEFEF' }}>
                                            <TouchableOpacity
                                                onPress={() => this.onChangeType('delivery', this.state.pMethod)}
                                                style={this.state.rSelected === 'delivery' ? styles.activeItem : styles.generalItem}>
                                                <Text style={[styles.itemBigTxt, this.state.rSelected === 'delivery' ? styles.activeTxt : styles.generalTxt]}>{translate("delivery")}</Text>
                                                <Text style={[styles.itemSmallTxt, this.state.rSelected === 'delivery' ? styles.activeTxt : styles.generalTxt]}>{translate("at-home")}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (!this.state.pickup) {
                                                        return;
                                                    }
                                                    this.onChangeType('pickup', this.state.pMethod)
                                                }}
                                                style={this.state.rSelected === 'pickup' ? styles.activeItem : styles.generalItem}>
                                                <Text style={[styles.itemBigTxt, this.state.rSelected === 'pickup' ? styles.activeTxt : styles.generalTxt]}>{translate("withdrawal")}</Text>
                                                {
                                                    !this.state.pickup ? (
                                                        <Text style={[styles.itemSmallTxt, styles.generalTxt]}>{translate("not available")}</Text>
                                                    ) : (
                                                            (<Text style={[styles.itemSmallTxt, this.state.rSelected === 'pickup' ? styles.activeTxt : styles.generalTxt]}>{translate("at-restaurant")}</Text>)
                                                        )
                                                }
                                            </TouchableOpacity>
                                        </View>

                                        <View>
                                            {
                                                this.state.address ? (
                                                    <TouchableOpacity
                                                        style={{ height: 60, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' }}
                                                        onPress={() => this.onChangeAddress()}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={[styles.txtNormal, { color: '#707070' }]}>{translate("delivery-in")}:</Text>
                                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 13, color: '#1A1824', fontWeight: 'bold' }} numberOfLines={1}>{this.state.address ? this.state.address.formatted_address : null}</Text>
                                                        </View>
                                                        <Text style={[styles.txtBold, { color: '#FF5D5D' }]}>{translate("change")}</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                        <TouchableOpacity
                                                            style={{ height: 60, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' }}
                                                            onPress={() => this.onChangeAddress()}>
                                                            <Text style={[styles.txtBold, { color: '#FF5D5D' }]}>{translate("select-address-for-delivery")}</Text>
                                                        </TouchableOpacity>
                                                    )
                                            }

                                            <Divider left={0} />
                                            <TouchableOpacity
                                                style={{ paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, backgroundColor: 'white' }}
                                                onPress={() => this.onUpdateBellboyInfo()}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.txtNormal, { color: '#707070' }]}>{translate("info-deliveryman")}:</Text>
                                                    <Text style={[styles.txtContent, { fontSize: 12, fontWeight: 'normal' }]}>{this.state.address ? this.state.address.notes : ""}</Text>
                                                </View>
                                                <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                            </TouchableOpacity>
                                            <Divider left={0} />
                                            {
                                                this.state.rSelected === 'pickup' ? (
                                                    <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, backgroundColor: '#F7F7F7', opacity: 0.6 }}></View>
                                                ) : (null)
                                            }
                                        </View>

                                        <View style={{ height: 52, marginTop: 10, marginBottom: 20, justifyContent: 'center', backgroundColor: 'white', paddingHorizontal: 15 }}>
                                            <Text style={[styles.txtNormal, { color: '#707070' }]}>{translate("delivery-time")}:</Text>
                                            <Text style={[styles.txtNormal, { fontWeight: 'bold', fontSize: 13 }]}>{this.state.deliveryTime}</Text>
                                        </View>

                                        {/* payment type */}
                                        {
                                            this.state.paymethod && (
                                                <>
                                                    <View style={{ backgroundColor: 'white', marginBottom: 22 }}>
                                                        <View style={{ height: 45, justifyContent: 'center' }}>
                                                            <Text style={[styles.txtNormal, { textAlign: 'center' }]}>{this.getPaymentTitle(this.state.paymethod)}</Text>
                                                        </View>
                                                        <Divider left={0} />
                                                        {this.state.paymethod['cash'] === true && (
                                                            <View>
                                                                <RadioItem
                                                                    checked={this.state.pMethod === 'cash' ? true : false}
                                                                    name={translate('pay-in-cash') + ' (-0.25€)'}
                                                                    onPress={() => this.onChangeType(this.state.rSelected, 'cash')}
                                                                />
                                                                <Divider left={55} />
                                                            </View>)
                                                        }
                                                        {
                                                            this.state.paymethod['credit-card'] === true && (
                                                                <View>
                                                                    <RadioItem
                                                                        checked={this.state.pMethod === 'credit-card' ? true : false}
                                                                        name={translate('credit-card')}
                                                                        onPress={() => this.onChangeType(this.state.rSelected, 'credit-card')}
                                                                    />
                                                                </View>
                                                            )
                                                        }
                                                    </View>

                                                    {/* Card No */}
                                                    {this.state.paymethod['credit-card'] &&
                                                        <View>
                                                            {
                                                                this.state.card ? (
                                                                    <TouchableOpacity
                                                                        style={{ height: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: 'white' }}
                                                                        onPress={() => this.onChangeCard()}>
                                                                        <View style={{ flex: 1 }}>
                                                                            {
                                                                                this.state.card.card ? (
                                                                                    <>
                                                                                        <Text style={[styles.txtBold, { color: '#1A1824' }]}>&#9679;&#9679;&#9679;&#9679; {this.state.card.card.last4}</Text>
                                                                                        <Text style={[styles.txtNormal, { color: "#707070" }]}>{this.state.card.card.brand + ' - ' + this.getExpiryDate(this.state.card.card)}</Text>
                                                                                    </>
                                                                                ) : (
                                                                                        <>
                                                                                            <Text style={[styles.txtBold, { color: '#1A1824' }]}>&#9679;&#9679;&#9679;&#9679; {this.state.card.last4}</Text>
                                                                                            <Text style={[styles.txtNormal, { color: "#707070" }]}>{this.state.card.brand + ' - ' + this.getExpiryDate(this.state.card)}</Text>
                                                                                        </>
                                                                                    )
                                                                            }
                                                                        </View>
                                                                        <Text style={[styles.txtBold, { color: '#FF5D5D' }]}>{translate("change")}</Text>
                                                                    </TouchableOpacity>
                                                                ) : (
                                                                        <TouchableOpacity
                                                                            style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: 'white' }}
                                                                            onPress={() => this.onAddCard()}>
                                                                            <FontAwesomeIcon name="credit-card" size={20} style={{ marginRight: 10 }} />
                                                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', flex: 1 }}>{translate("add-new-card")}</Text>
                                                                            <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                                                        </TouchableOpacity>
                                                                    )
                                                            }
                                                            {
                                                                this.state.pMethod === "cash" ? (
                                                                    <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, backgroundColor: '#F7F7F7', opacity: 0.4 }}></View>
                                                                ) : (null)
                                                            }
                                                        </View>
                                                    }
                                                </>
                                            )
                                        }
                                    </View>
                                </ScrollView>

                                <View style={[styles.shadow, { paddingBottom: 30, borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}>

                                    {/* Total */}
                                    <View style={{ paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row' }}>
                                        <Text style={[styles.total, { flex: 1 }]}>{translate("total")}</Text>
                                        <Text style={styles.total}>{this.state.total ? this.state.total : ''} €</Text>
                                    </View>
                                    <Divider left={0} />

                                    <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                                        {
                                            checkoutState.success ? (
                                                <FrameButton
                                                    backgroundColor="#FF5D5D"
                                                    width='100%'
                                                    onPress={() => this.onCheckout()}
                                                >
                                                    <ButtonText textColor="white">{translate("confirm-order")}</ButtonText>
                                                </FrameButton>
                                            ) : (
                                                    <FrameButton
                                                        backgroundColor="lightgray"
                                                        width='100%'
                                                    >
                                                        <ButtonText textColor="#FF5D5D">{checkoutState.message}</ButtonText>
                                                    </FrameButton>
                                                )
                                        }
                                    </View>
                                </View>
                            </>
                        )
                }

                <Modal
                    isVisible={this.state.completed}
                    deviceHeight={screenHei}
                    deviceWidth={screenWid}
                    style={{ margin: 0 }}
                    backdropOpacity={0.0}>

                    <View style={{ width: '100%', flex: 1, backgroundColor: 'white' }}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={checkoutImg} />
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 30, fontWeight: 'bold', color: "#1A1824", marginTop: 20 }}>{translate("order-success-title")}</Text>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: '#1A1824', marginTop: 5 }}>{translate("order-success-title")}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.onConfirm()}
                            >
                                <ButtonText textColor="white">{translate("goto-orders")}</ButtonText>
                            </FrameButton>
                            <View style={{ height: Platform.OS === 'ios' ? 60 : 30 }} />
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return {
        cartInfo: state.cart.cartInfo,
        addresses: state.signin.profile_info.addresses,
        addressStatus: state.locationInfo.addressStatus,
        ...state
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCartInfo: (cart) => { dispatch(setCartInfo(cart)) },
        setCartRestaurantNote: (note) => { dispatch(setCartRestaurantNote(note)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutScreen)