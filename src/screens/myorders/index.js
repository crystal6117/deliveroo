import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { FrameButton, ButtonText } from '../../components/Button';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import cardLogo from '../../../assets/images/order-logo.png';
import { Divider } from '../../components/Divider';
import styles from './styles';
import { getOrders } from '../../apis/order';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';

class MyOrderScreen extends Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            error: '',
            progressing: [],
            completed: []
        }
    }

    reloadOrders = () => {
        this.setState({ loading: true })
        getOrders().then(orders => {
            this.setState({ loading: false, progressing: orders.pending_orders ? orders.pending_orders : [], completed: orders.orders ? orders.orders : [] });
        })
    }

    componentDidMount() {
        this.reloadOrders();
    }

    isEmptyOrder() {
        if (this.state.progressing.length > 0)
            return false;

        if (this.state.completed.length > 0)
            return false;

        return true;
    }

    onDiscoverRestaurants() {

    }

    renderContent() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }

        if (this.state.error) {
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FF5D5D', fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16 }}>{this.state.error}</Text>
            </View>
        }

        if (this.isEmptyOrder()) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={cardLogo} style={{}} />
                        <View style={{ width: 240, justifyContent: 'center', marginTop: 30 }}>
                            <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 30, textAlign: 'center', lineHeight: 36 }}>{translate("no-order")}</Text>
                            <Text
                                style={{ fontFamily: 'Circular Std', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 10 }}
                                onPress={() => onDiscoverRestaurants()}>{translate("discover-restaurant-near-you")}</Text>
                        </View>
                    </View>
                    <View style={{ padding: 20 }}>
                        <FrameButton
                            backgroundColor="#FF5D5D"
                            width='100%'
                            style={{ marginBottom: 10 }}
                            onPress={() => {
                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'home' })],
                                });
                                this.props.navigation.dispatch(resetAction);
                            }}
                        >
                            <ButtonText textColor="white">{translate("discover-restaurant")}</ButtonText>
                        </FrameButton>
                    </View>
                </View>
            )
        }

        return (

            <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                <View style={{ paddingVertical: 35 }}>
                    {
                        (this.state.progressing.length > 0) && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ paddingHorizontal: 10, fontFamily: 'Circular Std', fontSize: 14, fontWeight: 'bold', color: "#1A1824", marginBottom: 10 }}>{translate("in-progress")}</Text>
                                <View style={styles.contentframe}>
                                    {
                                        this.state.progressing.map((item, index) => (
                                            <TouchableOpacity key={index} onPress={() => this.props.navigation.navigate("orderdetail", { orderId: item.id, status: "progressing" })}>
                                                <View style={{ flexDirection: 'row', height: 68, paddingHorizontal: 10, alignItems: 'center' }}>
                                                    {
                                                        item.listing?.image_url ? (
                                                            <Image source={{ uri: item.listing.image_url }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F2', marginRight: 20 }} />
                                                        ) : (
                                                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F7F7F7', marginRight: 20 }} />
                                                            )
                                                    }
                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Text style={[styles.title1, { flex: 1 }]}>{item.listing.name}</Text>
                                                            <Text style={styles.title1}>{item.total_price}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={[styles.desc, { color: item.status_color }]}>{item.status}</Text>
                                                            <Text style={[styles.desc, { flex: 1, textAlign: 'right' }]}>{item.created_at}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ width: 25, justifyContent: 'flex-end' }}>
                                                        <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                                                    </View>
                                                </View>
                                                {(this.state.progressing.length - 1 !== index) && <Divider />}
                                            </TouchableOpacity>
                                        ))
                                    }
                                </View>
                            </View>
                        )
                    }
                    {
                        (this.state.completed.length > 0) && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ paddingHorizontal: 10, fontFamily: 'Circular Std', fontSize: 14, fontWeight: 'bold', color: "#1A1824", marginBottom: 10 }}>{translate("completed")}</Text>
                                <View style={styles.contentframe}>
                                    {
                                        this.state.completed.map((item, index) => (
                                            <TouchableOpacity key={index} onPress={() => this.props.navigation.navigate("orderdetail", { orderId: item.id, status: "completed" })}>
                                                <View style={{ flexDirection: 'row', height: 68, paddingHorizontal: 10, alignItems: 'center' }}>
                                                    {
                                                        item.listing?.image_url ? (
                                                            <Image source={{ uri: item.listing.image_url }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F2', marginRight: 20 }} />
                                                        ) : (
                                                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F7F7F7', marginRight: 20 }} />
                                                            )
                                                    }
                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Text style={[styles.title1, { flex: 1 }]}>{typeof item.listing === 'object' ? item.listing.name : item.listing}</Text>
                                                            <Text style={styles.title1}>{item.total_price}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={[styles.desc, { color: item.status_color }]}>{item.status}</Text>
                                                            <Text style={[styles.desc, { flex: 1, textAlign: 'right' }]}>{item.created_at}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ width: 25, justifyContent: 'flex-end' }}>
                                                        <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                                                    </View>
                                                </View>
                                                {(this.state.completed.length - 1 !== index) && <Divider />}
                                            </TouchableOpacity>
                                        ))
                                    }
                                </View>
                            </View>
                        )
                    }
                </View>
            </ScrollView>
        )
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
                    <Text style={styles.title}>{translate("myorders")}</Text>
                </CeeboHeader1>
                {this.renderContent()}
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(MyOrderScreen)