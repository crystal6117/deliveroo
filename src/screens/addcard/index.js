import React, { Component } from 'react';
import { View, Text, Dimensions, Keyboard, ScrollView, KeyboardAvoidingView, TextInput, Platform, StatusBar, Alert } from 'react-native';
import dismissKeyboard from 'react-native/Libraries/Utilities/dismissKeyboard'
import { translate } from '../../translate';
import { FrameButton, ButtonText } from '../../components/Button';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { Divider } from '../../components/Divider';
import styles from './styles';
import stripe, { PaymentCardTextField } from 'tipsi-stripe';
import Toast from 'react-native-simple-toast';
import { createCard } from '../../apis/card';
import Spinner from 'react-native-loading-spinner-overlay'
import TextInputMask from 'react-native-text-input-mask';
import creditCardType from 'credit-card-type';
import { connect } from 'react-redux';

stripe.setOptions({
    publishableKey: 'pk_test_cJzcNynu2FfTD9cbnjYx71Uq00PrxLrygl'
})

const screenHei = Dimensions.get('window').height;

class AddCardScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cardname: '',
            valid: false,
            number: '',
            expMonth: '',
            expYear: '',
            cvc: '',
            keyboardOpen: false,
            keyboardHeight: 0,
            loading: false,

            cardType: null,
            mask: '[0000] [0000] [0000] [0000]',
            cvclen: 3,
            frameHei: 0
        }
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
    }

    componentWillUnmount() {
        if (this.keyboardDidShowListener) this.keyboardDidShowListener.remove();
        if (this.keyboardDidHideListener) this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = (e) => {
        this.setState({ keyboardOpen: true, keyboardHeight: e.endCoordinates.height })
    }

    _keyboardDidHide = () => {
        this.setState({ keyboardOpen: false, keyboardHeight: 0 })
    }

    checkCardType(cardNo) {
        if (cardNo === '') {
            this.setState({ mask: "[0000] [0000] [0000] [0000]", cardType: null, cvclen: 3 })
        }
        const res = creditCardType(cardNo)
        if (res.length === 1) {
            const len = res[0].lengths[0];
            var mask = '';
            for (var i = 0; i < len; i++) {
                mask += '0';
            }

            String.prototype.splice = function (idx, rem, str) {
                return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
            };

            for (var i = res[0].gaps.length - 1; i >= 0; i--) {
                mask = mask.splice(res[0].gaps[i], 0, '] [')
            }

            mask = "[" + mask + "]"
            this.setState({ mask, cardType: res[0].type, cvclen: res[0].code.size });
        }
    }

    cardNumberValidation = (cardNumber) => {
        const cards = {
            'mc': '5[1-5][0-9]{14}',
            'ec': '5[1-5][0-9]{14}',
            'vi': '4(?:[0-9]{12}|[0-9]{15})',
            'ax': '3[47][0-9]{13}',
            'dc': '3(?:0[0-5][0-9]{11}|[68][0-9]{12})',
            'bl': '3(?:0[0-5][0-9]{11}|[68][0-9]{12})',
            'di': '6011[0-9]{12}',
            'jcb': '(?:3[0-9]{15}|(2131|1800)[0-9]{11})',
            'er': '2(?:014|149)[0-9]{11}'
        };

        valid = false;
        for (card in cards) {
            if (cardNumber.match('^' + cards[card] + '$')) {
                valid = true
            }
        }
        return valid
    }

    async onAddCard() {
        if (!this.state.cardname) {
            Toast.show(translate("type-card-name"));
            this.nameInput.focus();
            return;
        }

        if (!this.state.number) {
            Toast.show(translate("type-card-number"));
            this.numberInput.focus();
            return;
        }

        if (!this.cardNumberValidation(this.state.number)) {
            Toast.show(translate("invalid-card-number"));
            this.numberInput.focus();
            return;
        }

        if (!this.state.expMonth || !this.state.expYear) {
            Toast.show(translate("type-exp-date"));
            this.expiryInput.focus();
            return;
        }

        if (parseInt(this.state.expMonth) > 12) {
            Toast.show(translate("invalid-exp-date"));
            this.expiryInput.focus();
            return;
        }

        if (!this.state.cvc || this.state.cvc.length != this.state.cvclen) {
            Toast.show(translate("invalid-cvc"));
            this.cvcInput.focus();
            return;
        }

        try {
            this.setState({ loading: true })
            const token = await stripe.createTokenWithCard({
                number: this.state.number,
                expMonth: this.state.expMonth,
                expYear: this.state.expYear,
                cvc: this.state.cvc,
                name: this.state.cardname
            })

            if (token.card) {
                const params = {
                    type: 'card',
                    card: token.card.cardId,
                    number: this.state.number,
                    expMonth: this.state.expMonth,
                    expYear: this.state.expYear,
                    cvc: this.state.cvc,
                    name: this.state.cardname
                }

                const source = await stripe.createSourceWithParams(params);
                await createCard(source.sourceId)
                await this.props.navigation.state.params.refreshProfile();
                this.setState({ loading: false })
                this.props.navigation.goBack();
            } else {
                this.setState({ loading: false })
                setTimeout(() => {
                    Alert.alert("", translate("add-card-failed"));
                }, 400)
            }
        } catch (error) {
            this.setState({ loading: false })
            setTimeout(() => {
                Alert.alert("", error.toString());
            }, 400)
        }
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
        //     return scrollViewHei - 86 - this.state.frameHei;
        // }
        return scrollViewHei - 86 - this.state.frameHei;
    }

    render() {
        return (
                <View style={styles.container}>
                    <Spinner visible={this.state.loading} textContent="Adding a new card..." textStyle={{ color: '#FFF' }} />
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
                        <Text style={styles.title}>{translate("new-card")}</Text>
                    </CeeboHeader1>

                    <ScrollView style={{ flex: 1 }} scrollIndicatorInsets={{ right: 1 }}>
                        <View style={{ paddingTop: 40 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                            <View style={styles.contentframe}>
                                {/* Cardinfo */}
                                <View style={{ paddingRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.lbl}>{translate("name")}</Text>
                                    <TextInput
                                        ref={ref => this.nameInput = ref}
                                        placeholder={translate("name-surname")}
                                        style={[styles.input, { flex: 1 }]}
                                        onChangeText={(cardname) => this.setState({ cardname })} />
                                </View>
                                <Divider />
                                <View style={{ paddingRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.lbl}>{translate("card-number")}</Text>
                                    <TextInputMask
                                        refInput={ref => this.numberInput = ref}
                                        placeholder="5400 1234 1233 1233"
                                        style={[styles.input, { flex: 1 }]}
                                        keyboardType="number-pad"
                                        mask={this.state.mask}
                                        onChangeText={(generated, number) => {
                                            this.checkCardType(number)
                                            this.setState({ number })
                                        }}
                                    />
                                </View>
                                <Divider />
                                <View style={{ paddingRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.lbl}>{translate("deadline")}</Text>
                                    <TextInputMask
                                        refInput={ref => { this.expiryInput = ref }}
                                        placeholder="10/18"
                                        style={[styles.input, { flex: 1 }]}
                                        mask="[00]{/}[00]"
                                        keyboardType="number-pad"
                                        onChangeText={(generated, expiry) => {
                                            const res = generated.split('/');
                                            this.setState({ expMonth: parseInt(res[0]), expYear: res[1] ? parseInt(res[1]) : null })
                                        }}
                                    />
                                </View>
                                <Divider />
                                <View style={{ paddingRight: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.lbl}>{translate("security-code")}</Text>
                                    <TextInput
                                        ref={ref => this.cvcInput = ref}
                                        placeholder="***"
                                        secureTextEntry
                                        keyboardType="number-pad"
                                        style={[styles.input, { flex: 1 }]}
                                        value={this.state.cvc}
                                        onChangeText={(cvc) => {
                                            if (cvc.length > this.state.cvclen) {
                                                return;
                                            }
                                            this.setState({ cvc })
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={{ paddingTop: 10, paddingBottom: 30, paddingHorizontal: 20 }}>
                                <Text style={styles.subtopic}>
                                    <Text style={{ color: "#3C3C43" }}>{translate("add-card-desc")}</Text>
                                </Text>
                            </View>
                        </View>

                        <View style={{ paddingTop: this.getOffsetHeight() }}>
                            <View style={{ padding: 20 }}>
                                <FrameButton
                                    backgroundColor="#FF5D5D"
                                    width='100%'
                                    onPress={() => this.onAddCard()}
                                >
                                    <ButtonText textColor="white" bold>{translate("add-card")}</ButtonText>
                                </FrameButton>
                            </View>
                        </View>
                        {Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight }} /> : null}
                    </ScrollView>
                </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(AddCardScreen)