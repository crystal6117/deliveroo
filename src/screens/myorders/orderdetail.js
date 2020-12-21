import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Animated, Easing } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import styles from './styles';
import { FrameButton, ButtonText } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { getOrderDetail, getOrderStatus } from '../../apis/order';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import { CreditCardIcon, CashIcon, FrecciaIcon } from '../../components/SvgIcons';
import { ShoppingBagIcon } from '../../components/SvgIcons';
import OpenMap from "react-native-open-map";

const deliveryStatus = {
    SENT: 0,
    PREPARING: 1,
    DELIVERING: 2,
    DELIVERED: 3
}

class OrderDetailScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orderId: props.navigation.getParam('orderId'),
            status: props.navigation.getParam('status'),
            orderDetail: null,
            deliveryStatus: deliveryStatus.DELIVERING,
            loading: true,
            activeState: new Animated.Value(0),
            orderStatus: null
        }
    }

    componentDidMount = async () => {
        const orderDetail = await getOrderDetail(this.state.orderId);
        this.setState({ orderDetail, loading: false });

        if (this.state.status === 'progressing') {
            await this.getOrderProgressStatus();
            this.getOrderStatusInterval = setInterval(async () => {
                await this.getOrderProgressStatus();
            }, 30000)

            Animated.loop(
                Animated.sequence([
                    Animated.timing(this.state.activeState, { toValue: 1, duration: 1000, easing: Easing.sin }),
                    Animated.delay(200),
                    Animated.timing(this.state.activeState, { toValue: 0, duration: 10 }),
                ])
            ).start();
        }
    }

    getOrderProgressStatus = async () => {
        var orderStatus = await getOrderStatus(this.state.orderId);
        if (orderStatus) {
            orderStatus.current_progress_percentage = parseInt(orderStatus.current_progress_percentage);
            orderStatus.processing_steps.map((step, i) => {
                orderStatus.processing_steps[i].start_at_percentage = parseInt(orderStatus.processing_steps[i].start_at_percentage);
                orderStatus.processing_steps[i].finish_at_percentage = parseInt(orderStatus.processing_steps[i].finish_at_percentage);
                if (step.is_current) {
                    this.setState({ statusMessage: step.title });
                }
            })
            this.setState({ orderStatus });
        }
    }

    componentWillUnmount() {
        if (this.getOrderStatusInterval) {
            clearInterval(this.getOrderStatusInterval);
        }
    }

    gotoRestaurant() {
        const restaurantId = this.state.orderDetail.pickup.id;
        this.props.navigation.navigate("restaurant", { id: restaurantId });
    }

    gotoGoogleMap() {
        const restaurant = this.state.orderDetail.pickup;
        const location = {
            latitude: parseFloat(restaurant.location.lat),
            longitude: parseFloat(restaurant.location.lng),
            title: restaurant.name,
            cancelText: 'Close',
            actionSheetTitle: translate("choose-app"),
            actionSheetMessage: translate("available-map-applications")
        }
        OpenMap.show(location)
        // this.props.navigation.navigate("googlemap", { restaurant: this.state.orderDetail.pickup });
    }

    gotoEvaluate() {
        if (this.state.orderDetail && this.state.orderDetail.id) {
            this.props.navigation.navigate("evaluateorder", {
                orderId: this.state.orderDetail.id,
                restaurantId: this.state.orderDetail.pickup.id,
                onDone: (review) => {
                    var orderDetail = this.state.orderDetail;
                    orderDetail.review.push(review);
                    this.setState({ orderDetail });
                }
            });
        }
    }

    gotoHelp() {
        this.props.navigation.navigate("help", {
            orderDetail: this.state.orderDetail, onCancel: () => {
                this.props.navigation.goBack()
                this.props.navigation.state.params.onReloadOrders();
            }
        })
    }

    onOrderAgain() {
        this.props.navigation.navigate("restaurant", { id: this.state.orderDetail.pickup.id });
    }

    onDiscoverRestaurant() {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'home' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    renderDeliveryStatus() {
        return (
            <View style={{ marginVertical: 10, height: 6, flexDirection: 'row' }}>
                {
                    this.state.orderStatus && this.state.orderStatus.processing_steps && this.state.orderStatus.processing_steps.map((step, index) => (
                        <>
                            {
                                index !== 0 && (<View style={{ width: 2 }} key={index * 2 - 1} />)
                            }
                            <View style={[styles.deliveryStep, { flex: step.finish_at_percentage - step.start_at_percentage, backgroundColor: "#B5B5B5" }]} key={index * 2}>
                                {
                                    step.is_current ? (
                                        <Animated.View style={[styles.deliveryStep, {
                                            backgroundColor: '#FF5D5D',
                                            width: this.state.activeState.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', "100%"]
                                            }),
                                            opacity: this.state.activeState.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 0.4]
                                            })
                                        }]} />
                                    ) : (
                                            this.state.orderStatus.status_id > step.id ? (
                                                <View style={[styles.deliveryStep, { backgroundColor: '#FF5D5D' }]} />
                                            ) : (null)
                                        )
                                }
                            </View>
                        </>
                    ))
                }
            </View>
        )
    }

    render() {
        const { orderDetail, status, loading } = this.state;

        return (
            <View style={styles.container}>
                {
                    (this.state.status === 'progressing' && loading === false && orderDetail) ? (
                        <CeeboHeader1
                            left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                            right={{ type: 'text', name: translate('help'), fontFamily: 'Circular Std', size: 16, color: '#FE5D5D', callback: () => this.gotoHelp() }}
                            offset={this.props.appInfo.statusbarHeight}
                        >
                            <Text style={styles.title}>{translate("orderdetail")}</Text>
                        </CeeboHeader1>
                    ) : (
                            <CeeboHeader1
                                left={{ type: 'icon', name: 'arrow-left', size: 25, color: '#FF5D5D', callback: () => this.props.navigation.goBack() }}
                                offset={this.props.appInfo.statusbarHeight}
                            >
                                <Text style={styles.title}>{translate("orderdetail")}</Text>
                            </CeeboHeader1>
                        )
                }

                {
                    loading ? (
                        <View style={{ marginTop: 30 }}>
                            <ActivityIndicator size="large" />
                        </View>
                    ) : (
                            (!orderDetail || orderDetail.length === 0) ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#FF5D5D', fontSize: 20 }}>Something went wrong</Text>
                                </View>
                            ) : (
                                    <ScrollView style={{ flex: 1, backgroundColor: "#F7F7F7" }} scrollIndicatorInsets={{ right: 1 }}>
                                        <View style={[styles.maincontainer, { paddingTop: 35 }]}>
                                            <View style={{ paddingHorizontal: 15 }}>
                                                <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 22, color: '#1A1824', textAlign: 'center' }}>Ordine #{orderDetail.id}</Text>
                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: '#707070', textAlign: 'center' }}>{orderDetail.created_at}</Text>
                                                {
                                                    status === 'progressing' ? (
                                                        orderDetail.type == 'pickup' ? (
                                                            <>
                                                                <View style={{ marginVertical: 5, alignItems: 'center' }}>
                                                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                                                        <ShoppingBagIcon width={20} height={20} color="#464646" />
                                                                    </View>
                                                                </View>
                                                                <View style={{ paddingHorizontal: '15%' }}>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 16, lineHeight: 19, color: '#414F3E', textAlign: 'center' }}>{translate("Show the order to the restaurant to pick it up")}</Text>
                                                                </View>
                                                                <View style={{ marginTop: 20, marginBottom: 10 }}>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#707070' }}>{translate("Expected pick up time")}</Text>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 22, fontWeight: 'bold', color: '#1A1824' }}>{orderDetail.status_slug === 'new' ? '-' : (orderDetail.dropoff_deadline + ' - ' + orderDetail.dropoff_deadline_max)}</Text>
                                                                </View>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: "#414F3E", marginBottom: 10 }}>{this.state.statusMessage}</Text>
                                                            </>
                                                        ) : (
                                                                <>
                                                                    <View style={{ marginTop: 20 }}>
                                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#707070' }}>{translate("expected-delivery-time")}</Text>
                                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 22, fontWeight: 'bold', color: '#1A1824' }}>{orderDetail.status_slug === 'new' ? '-' : (orderDetail.dropoff_deadline + ' - ' + orderDetail.dropoff_deadline_max)}</Text>

                                                                        {this.renderDeliveryStatus()}

                                                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: "#414F3E", marginBottom: 10 }}>{this.state.statusMessage}</Text>
                                                                    </View>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099', marginTop: 10 }}>{translate("delivered-in")}</Text>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#1A1824' }}>{orderDetail.dropoff ? orderDetail.dropoff.formatted_address : orderDetail.pickup.formatted_address}</Text>
                                                                </>
                                                            )
                                                    ) : (
                                                            <>
                                                                <Text style={{ marginTop: 5, fontFamily: 'Circular Std', fontSize: 16, color: "#414F3E", textAlign: 'center' }}>{orderDetail.status}</Text>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099', marginTop: 10 }}>{translate("delivered-in")}</Text>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#1A1824' }}>{orderDetail.dropoff ? orderDetail.dropoff.formatted_address : orderDetail.pickup.formatted_address}</Text>
                                                            </>
                                                        )
                                                }
                                            </View>

                                            {
                                                orderDetail.type == 'pickup' ? (
                                                    <View style={{ backgroundColor: 'white', marginVertical: 15 }}>
                                                        <TouchableOpacity
                                                            style={{ flexDirection: 'row', padding: 15, alignItems: 'center' }}
                                                            onPress={() => this.gotoGoogleMap()}>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099' }}>{translate("Pick up at")}</Text>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#1A1824' }} numberOfLines={1}>{orderDetail.pickup.formatted_address}</Text>
                                                            </View>
                                                            <TouchableOpacity onPress={() => this.gotoGoogleMap()}>
                                                                <FrecciaIcon width={22} height={22} color="#FF5D5D" />
                                                            </TouchableOpacity>
                                                        </TouchableOpacity>
                                                        <Divider left={15} />
                                                        <View style={{ flexDirection: 'row', padding: 15, alignItems: 'center' }}>
                                                            <Text style={[styles.subtitle, { flex: 1 }]}>{orderDetail.pickup.name}</Text>
                                                            <TouchableOpacity onPress={() => this.gotoRestaurant()}>
                                                                <Text style={styles.redlbl}>{translate("see-menu")}</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ) : (
                                                        <View style={{ backgroundColor: 'white', marginTop: 15 }}>
                                                            <View style={{ flexDirection: 'row', padding: 15, alignItems: 'center' }}>
                                                                <Text style={[styles.subtitle, { flex: 1 }]}>{orderDetail.pickup.name}</Text>
                                                                <TouchableOpacity onPress={() => this.gotoRestaurant()}>
                                                                    <Text style={styles.redlbl}>{translate("see-menu")}</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Divider left={15} />
                                                        </View>
                                                    )
                                            }

                                            <View style={{ backgroundColor: 'white' }}>
                                                {
                                                    orderDetail.items.map((item, i) => (
                                                        <View key={i}>
                                                            <View style={{ paddingLeft: 35, paddingRight: 15, paddingVertical: 15 }}>
                                                                <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                                                                    <Text style={[styles.subtitle, { flex: 1 }]}>{`${item.qty}x    ${item.name}`}</Text>
                                                                    <Text style={styles.redlbl}>{item.total_price}</Text>
                                                                </View>
                                                                <View style={{ paddingLeft: 35 }}>
                                                                    {
                                                                        (item.variants && Array.isArray(item.variants) && item.variants.length > 0) ? (
                                                                            item.variants.map((variant, iV) => (
                                                                                <Text style={styles.desc} key={iV}>{variant.name}</Text>
                                                                            ))
                                                                        ) : (null)
                                                                    }
                                                                    <Text style={[styles.grayTitle]}>{item.special_instructions}</Text>
                                                                </View>
                                                            </View>
                                                            <Divider left={35} />
                                                        </View>
                                                    ))
                                                }

                                                <View style={{ paddingLeft: 35, paddingRight: 15, paddingVertical: 15 }}>
                                                    <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                                        <Text style={[styles.desc, { flex: 1 }]}>{translate("total-product")}</Text>
                                                        <Text style={styles.desc}>{orderDetail.subtotal_price}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                                        <Text style={[styles.desc, { flex: 1 }]}>{translate("delivery-cost")}</Text>
                                                        <Text style={styles.desc}>{orderDetail.delivery_fee}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                                        <Text style={[styles.desc, { flex: 1 }]}>{translate("purchase-cost")}</Text>
                                                        <Text style={styles.desc}>{orderDetail.purchase_fee}</Text>
                                                    </View>
                                                </View>
                                                <Divider left={35} />

                                                <View style={{ padding: 15, flexDirection: 'row' }}>
                                                    <Text style={[styles.redlbl, { flex: 1 }]}>{translate("total")}</Text>
                                                    <Text style={styles.redlbl}>{orderDetail.total_price}</Text>
                                                </View>

                                                {
                                                    (this.state.status === "completed" && this.state.orderDetail.review.length == 0 && this.state.orderDetail.status_slug !== 'cancelled') ? (
                                                        <>
                                                            <Divider left={35} />
                                                            <TouchableOpacity
                                                                style={{ height: 44, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' }}
                                                                onPress={() => this.gotoEvaluate()}>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: 'black', flex: 1 }}>{translate("evaluate-order")}</Text>
                                                                <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                                                            </TouchableOpacity>
                                                        </>
                                                    ) : (null)
                                                }
                                            </View>

                                            <View style={{ height: 44, backgroundColor: 'white', paddingHorizontal: 15, justifyContent: 'flex-end', alignItems: 'center', marginTop: 15, flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824', marginRight: 10 }}>{translate("paid-with")}</Text>
                                                {
                                                    this.state.orderDetail.payment_method === 'credit-card' ? (
                                                        <CreditCardIcon width={20} height={20} color="#000000" />
                                                    ) : (
                                                            this.state.orderDetail.payment_method === 'cash' ? (
                                                                <CashIcon width={29} height={20} color="#000000" />
                                                            ) : null
                                                        )
                                                }
                                            </View>

                                            {
                                                this.state.status === 'completed' ? (
                                                    <View style={{ padding: 20 }}>
                                                        <FrameButton
                                                            backgroundColor="#444444"
                                                            width='100%'
                                                            style={{ marginBottom: 10 }}
                                                            onPress={() => this.onOrderAgain()}
                                                        >
                                                            <ButtonText textColor="white">{translate("order-again")}</ButtonText>
                                                        </FrameButton>
                                                    </View>
                                                ) : (
                                                        <View style={{ height: 30 }}></View>
                                                    )
                                            }
                                        </View>
                                    </ScrollView >
                                )
                        )
                }
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(OrderDetailScreen)