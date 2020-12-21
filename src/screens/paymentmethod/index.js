import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { FrameButton, ButtonText } from '../../components/Button';
import cardLogo from '../../../assets/images/card-logo.png';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import styles from './styles';
import { Divider } from '../../components/Divider';
import { connect } from 'react-redux';
import { deleteCard, defaultCard, getAllCards } from '../../apis/card';
import { ceeboAlert } from '../../utils/alert';
import Spinner from 'react-native-loading-spinner-overlay';
import { setProfileInfo } from '../../actions/signin';
import { getProfileInfo } from '../../apis/user'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { CreditCardIcon } from '../../components/SvgIcons'

const screenHei = Dimensions.get('window').height;

class PaymentMethodScreen extends Component {
    constructor(props) {
        super(props);
        const checkout = props.navigation.getParam('checkout');
        const card = props.navigation.getParam('card')
        this.state = {
            defaultCardId: card?.id,
            cards: [],
            loading: false,
            loadingStr: '',
            selectedCard: card,
            frameHei: 0,
            loadingCards: true,
            checkout: checkout ? true : false
        }
    }

    async onLoadCards(isLoading) {
        if (!isLoading) {
            this.setState({ loadingCards: true })
        }

        const cards = await getAllCards();
        if (!isLoading) {
            this.setState({ loadingCards: false })
        }
        await this.setState({ cards })
    }

    componentDidMount = async () => {
        await this.onLoadCards();
        // if (this.state.checkout) {
        //     const { cards } = this.state;
        //     if (cards.length === 0) {
        //         this.onAddCard();
        //     }
        // }
    }

    deleteCard = async (index) => {
        var list = [...this.state.cards];
        const cardId = list[index].id;
        try {
            this.setState({ loading: true, loadingStr: "" });
            await deleteCard(cardId);
            await this.onLoadCards(true);
            this.setState({ loading: false })
        } catch (error) {
            this.setState({ loading: false })
            setTimeout(() => {
                ceeboAlert(error, null)
            }, 400)
        }
    }

    onDeleteCard = async (index) => {
        Alert.alert(
            translate("delete-card"),
            translate("delete-card-desc"),
            [
                { text: "No", onPress: () => { } },
                { text: translate("yes"), onPress: () => this.deleteCard(index) }
            ],
            { cancelable: true }
        );
    }

    getExpiryDate(card) {
        const month = card.exp_month >= 10 ? "" + card.exp_month : "0" + card.exp_month;
        const year = card.exp_year - 2000 + "";
        return month + "/" + year;
    }

    async setDefaultCard(card) {
        if (this.state.checkout) {
            await this.setState({ defaultCardId: card.id, selectedCard: card })
        } else {
            try {
                this.setState({ loading: true, loadingStr: translate("default-card-setting") });
                await defaultCard(card.id);
                this.setState({ defaultCardId: card.id })
                this.setState({ loading: false })
            } catch (error) {
                this.setState({ loading: false })
                setTimeout(() => {
                    ceeboAlert(error, null)
                }, 400)
            }
        }
    }

    onAddCard() {
        this.props.navigation.navigate(
            "addcard",
            {
                newCard: null,
                refreshProfile: async () => {
                    const len = this.state.cards.length;
                    await this.onLoadCards()
                    const { cards } = this.state;
                    if (this.state.checkout && len === 0 && cards.length > 0) {
                        await this.setDefaultCard(cards[0]);
                    }
                }
            }
        );
    }

    onDone() {
        if (!this.state.selectedCard) {
            Alert.alert(translate("card-payment", translate("select-card")))
            return;
        }

        this.props.navigation.state.params.onDone(this.state.selectedCard);
        this.props.navigation.goBack();
    }

    getOffsetHeight() {
        const titleBarHei = 50;
        const scrollViewHei = (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
        return scrollViewHei - 86 - this.state.frameHei;
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.loading} textContent={this.state.loadingStr} textStyle={{ color: '#FFF' }} />
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
                    <Text style={styles.title}>{translate("paymentmethods")}</Text>
                </CeeboHeader1>

                {
                    this.state.loadingCards ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    ) : ((!this.state.cards || this.state.cards.length === 0) ? (
                        <View style={{ flex: 1 }}>
                            <View style={[styles.contentframe, { marginTop: 10 }]}>
                                <TouchableOpacity
                                    style={{ height: 52, flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center' }}
                                    onPress={() => this.onAddCard()}>
                                    <CreditCardIcon width={20} height={20} color="black" />
                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', flex: 1, marginLeft: 10 }}>{translate("add-new-card")}</Text>
                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 }}>
                                <Image source={cardLogo} style={{}} />
                                <View style={{ width: 240, justifyContent: 'center', marginTop: 30 }}>
                                    <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 30, textAlign: 'center', lineHeight: 36 }}>{translate("no-creditcard")}</Text>
                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 10 }}>{translate("no-creditcard-desc")}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                            <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                                <View style={{ paddingTop: 35 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                                    <View style={styles.contentframe}>
                                        {
                                            this.state.cards.map((item, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={{ paddingLeft: 15 }}
                                                    onPress={() => this.setDefaultCard(item)}>
                                                    <View style={{ height: 70, flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ width: 40 }}>
                                                            {
                                                                (item.id === this.state.defaultCardId) ? (
                                                                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: "center", }}>
                                                                        <EntypoIcon name="check" color="white" size={12} />
                                                                    </View>
                                                                ) : (
                                                                        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#D0D0D2' }}></View>
                                                                    )
                                                            }
                                                        </View>
                                                        {item.card ? (
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 14, color: '#1A1824' }}>&#9679;&#9679;&#9679;&#9679; {item.card.last4}</Text>
                                                                <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#8C8B91' }}>{item.card.brand + ' - ' + this.getExpiryDate(item.card)}</Text>
                                                            </View>
                                                        ) : (
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 14, color: '#1A1824' }}>&#9679;&#9679;&#9679;&#9679; {item.last4}</Text>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#8C8B91' }}>{item.brand + ' - ' + this.getExpiryDate(item)}</Text>
                                                                </View>
                                                            )}
                                                        {
                                                            !this.state.checkout ? (
                                                                <TouchableOpacity onPress={() => this.onDeleteCard(index)}>
                                                                    <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 14, color: '#FF5D5D', paddingRight: 10 }}>{translate("delete")}</Text>
                                                                </TouchableOpacity>
                                                            ) : null
                                                        }
                                                    </View>
                                                    {index !== this.state.cards.length - 1 ? <Divider left={50} /> : (null)}
                                                </TouchableOpacity>
                                            ))
                                        }
                                    </View>
                                    <View style={[styles.contentframe, { marginTop: 10 }]}>
                                        <TouchableOpacity
                                            style={{ height: 52, flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center' }}
                                            onPress={() => this.onAddCard()}>
                                            <FontAwesomeIcon name="credit-card" size={20} style={{ marginRight: 10 }} />
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 17, color: 'black', flex: 1 }}>{translate("add-new-card")}</Text>
                                            <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {
                                    this.state.checkout && (
                                        <View style={{ paddingTop: this.getOffsetHeight() }}>
                                            <View style={{ padding: 20 }}>
                                                <FrameButton
                                                    backgroundColor="#FF5D5D"
                                                    width='100%'
                                                    onPress={() => this.onDone()}
                                                >
                                                    <ButtonText textColor="white">{translate("confirm")}</ButtonText>
                                                </FrameButton>
                                            </View>
                                        </View>
                                    )
                                }
                            </ScrollView>
                        ))
                }
            </View>
        )
    }
}

const mapStateToProps = state => {
    return {
        profileInfo: state.signin.profile_info,
        ...state
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentMethodScreen)