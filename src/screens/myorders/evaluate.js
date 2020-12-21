import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, Text, Dimensions, TouchableOpacity, ScrollView, Keyboard, Platform, Alert, StatusBar } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import { FrameButton, ButtonText } from '../../components/Button';
import FoundationIcon from 'react-native-vector-icons/Foundation';
import colors from '../../utils/colors';
import styles from './styles'
import { addOrderReview } from '../../apis/order';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class EvaluateOrderScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rating: 0,
            comment: "",
            keyboardOpen: false,
            keyboardHeight: 0,
            orderId: props.navigation.getParam('orderId'),
            restaurantId: props.navigation.getParam('restaurantId'),
            loading: false,
            frameHei: 0
        }

        this.rates = [1, 2, 3, 4, 5];
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow,
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide,
        );

        this.setState({ orderId: this.props.navigation.getParam("orderId") })
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = (e) => {
        this.setState({ keyboardOpen: true, keyboardHeight: e.endCoordinates.height })
    }

    _keyboardDidHide = () => {
        this.setState({ keyboardOpen: false, keyboardHeight: 0 })
    }

    onSubmitReview() {
        if (this.state.rating === 0) {
            Alert.alert("Ceebo", translate("rate-experience"))
            return;
        }

        const param = {
            listing_id: this.state.restaurantId,
            rating: this.state.rating.toString(),
            comments: this.state.comment,
            order_ref: this.state.orderId
        }

        this.setState({ loading: true })
        addOrderReview(param).then(() => {
            this.setState({ loading: false })
            this.props.navigation.state.params.onDone({
                rating: this.state.rating,
                comment: this.state.comment
            });
            this.props.navigation.goBack();
        }).catch(error => {
            this.setState({ loading: false })
            setTimeout(() => {
                Alert.alert('', error);
            }, 400)
        })
    }

    getOffsetHeight() {
        const titleBarHei = 50;
        const scrollViewHei = (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
        // if (this.state.keyboardOpen) {
        //     if (this.state.frameHei > scrollViewHei - this.state.keyboardHeight) {
        //         return 0;
        //     } else {
        //         return scrollViewHei - this.state.keyboardHeight - this.state.frameHei;
        //     }
        // } else {
        //     const offset = scrollViewHei - 86 - this.state.frameHei;
        //     return offset < 0 ? 0 : offset;
        // }

        const offset = scrollViewHei - 86 - this.state.frameHei;
        return offset < 0 ? 0 : offset;
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent="" textStyle={{ color: '#FFF' }} />
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
                    <Text style={styles.title}>{translate("evaluate-order-title")}</Text>
                </CeeboHeader1>

                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        <View style={{ paddingTop: 35, paddingHorizontal: 15 }}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 22, fontWeight: 'bold', color: 'black', textAlign: 'center' }}>{translate("rate-title")}</Text>
                            <View style={{ paddingTop: 20, paddingBottom: 40, paddingHorizontal: 10, flexDirection: 'row' }}>
                                {
                                    this.rates.map((item, index) => (
                                        <View style={{ paddingHorizontal: 5, flex: 1 }} key={index}>
                                            <TouchableOpacity
                                                style={{ height: 32, backgroundColor: (this.state.rating === item) ? "#FF5D5D" : "#EAEAEB", borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                                onPress={() => this.setState({ rating: item })}>
                                                <Text style={{ color: (this.state.rating === item) ? "white" : "#1A1824" }}>{item}</Text>
                                                <FoundationIcon name="star" size={15} color={(this.state.rating === item) ? "white" : "#FF5D5D"} style={{ marginLeft: 5 }} />
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                }
                            </View>
                        </View>
                        <View style={[styles.contentframe]}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 22, fontWeight: 'bold', color: "#1A1824", lineHeight: 36, paddingRight: 10, marginTop: 40 }}>{translate("evaluate-order-subtitle")}</Text>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#919099", marginTop: 10, marginBottom: 30, paddingRight: 10 }}>{translate("evaluate-order-desc")}</Text>
                            <CeeboInput
                                placeholder={translate("add-comment")}
                                isLast
                                returnKeyType={"done"}
                                onChangeText={(comment) => this.setState({ comment })}
                                onSubmitEditing={() => this.onSubmitReview()}
                                blurOnSubmit={false}
                                style={{ borderTopWidth: 1, borderColor: colors.lightgray }}
                            />
                        </View>
                    </View>

                    <View style={{ paddingTop: this.getOffsetHeight() }}>
                        <View style={{ padding: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width='100%'
                                onPress={() => this.onSubmitReview()}
                            >
                                <ButtonText textColor="white" bold>{translate("submit-review")}</ButtonText>
                            </FrameButton>
                        </View>
                    </View>
                    {Platform.OS === 'ios' && <View style={{ height: this.state.keyboardHeight }} />}
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(EvaluateOrderScreen)