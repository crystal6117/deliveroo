import React, { Component } from 'react';
import { View, Text, Dimensions, ScrollView, Keyboard, Platform, StatusBar, TouchableOpacity, Linking, Alert } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EntypoIcon from 'react-native-vector-icons/Entypo';

import { FrameButton, ButtonText } from '../../components/Button';
import styles from './styles'
import { Divider } from '../../components/Divider';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { StackActions, NavigationActions } from 'react-navigation';
import Axios from 'axios';
import { getUserToken } from '../../utils/session';
import Spinner from 'react-native-loading-spinner-overlay';
import {connect} from 'react-redux';

const screenHei = Dimensions.get('window').height;

const RadioItem = (props) => (
    <View style={{ height: 45, justifyContent: 'center', flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 45, justifyContent: 'center' }}>
                {
                    props.checked ? (
                        <View style={{ width: 22, height: 22, borderRadius: props.checkButton ? 8 : 12, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: "center", }}>
                            <EntypoIcon name="check" color="white" size={12} />
                        </View>
                    ) : (
                            <View style={{ width: 22, height: 22, borderRadius: props.checkButton ? 8 : 12, borderWidth: 1, borderColor: '#D0D0D2' }}></View>
                        )
                }
            </View>
            <View style={{ flex: 1, height: 45, justifyContent: 'center' }}>
                {props.children}
            </View>
        </View>
    </View>
)

class HelpInteractionScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: props.navigation.getParam("data"),
            title: props.navigation.getParam("title"),
            footer: props.navigation.getParam("footer"),
            orderId: props.navigation.getParam("orderId"),
            keyboardOpen: false,
            keyboardHeight: 0,
            frameHei: 0,
            processing: false
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
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = (e) => {
        this.setState({ keyboardOpen: true, keyboardHeight: e.endCoordinates.height })
    }

    _keyboardDidHide = () => {
        this.setState({ keyboardOpen: false, keyboardHeight: 0 })
    }

    phoneCall(phone) {
        Linking.openURL(`tel:${phone}`);
    }

    onClickTextItem(action) {
        if (action.type === 'call_number') {
            this.phoneCall(action.number)
        }
    }

    onClickRadioItem(no) {
        var data = this.state.data;
        var actions = this.state.data.actions;
        for (var i = 0; i < actions.length; i++) {
            actions[i].checked = (i === no) ? true : false
        }

        data.actions = actions;
        this.setState({ data })
    }

    async onTakeAction() {
        var selectedAction = null
        this.state.data.actions.forEach(action => {
            if (action.checked) selectedAction = action;
        })

        if (!selectedAction) {
            Alert.alert('', "Please select one of items.");
            return;
        }

        this.setState({ processing: true })
        const token = await getUserToken();
        Axios({
            method: 'put',
            url: "https://ceebo.com" + this.state.footer.url,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: {
                order_id: this.state.orderId,
                interaction_id: selectedAction.id
            }
        }).then(res => {
            this.setState({ processing: false })
            if (res.data.success) {
                setTimeout(() => {
                    Alert.alert(
                        "Ceebo Help",
                        res.data.message,
                        [
                            {
                                text: 'OK', onPress: () => {
                                    const resetAction = StackActions.reset({
                                        index: 2,
                                        actions: [
                                            NavigationActions.navigate({ routeName: 'home' }),
                                            NavigationActions.navigate({ routeName: 'account' }),
                                            NavigationActions.navigate({ routeName: 'myorders' })
                                        ],
                                    });
                                    this.props.navigation.dispatch(resetAction);
                                }
                            }
                        ],
                        { cancelable: false }
                    )
                }, 400)
            } else {
                setTimeout(() => {
                    Alert.alert('', res.data.message)
                }, 400)
            }
        }).catch(error => {
            this.setState({ processing: false })
            setTimeout(() => {
                Alert.alert('', error.toString());
            }, 400)
        })
    }

    getOffsetContentHeight() {
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

    renderActionItem(type, action, i) {
        if (type === 'text') {
            return (
                <View key={i}>
                    <TouchableOpacity style={styles.interaction} onPress={() => this.onClickTextItem(action)}>
                        <Text style={styles.itemText}>{action.title}</Text>
                        <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                    </TouchableOpacity>
                    {
                        i !== this.state.data.actions.length - 1 ? (<Divider />) : (null)
                    }
                </View>
            )
        }

        if (type === 'radio') {
            return (
                <View key={i}>
                    <TouchableOpacity style={styles.interaction} onPress={() => this.onClickRadioItem(i)}>
                        <RadioItem checked={action.checked}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#1A1824' }}>{action.title}</Text>
                        </RadioItem>
                    </TouchableOpacity>
                    {
                        i !== this.state.data.actions.length - 1 ? (<Divider />) : (null)
                    }
                </View>
            )
        }

        return (
            <View key={i}>
                <TouchableOpacity style={styles.interaction} onPress={() => this.onClickRadioItem(i)}>
                </TouchableOpacity>
                {
                    i !== this.state.data.actions.length - 1 ? (<Divider />) : (null)
                }
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.processing} textContent="" textStyle={{ color: '#FFF' }} />
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
                    <Text style={styles.title}>{this.state.title}</Text>
                </CeeboHeader1>

                <ScrollView style={{ flex: 1, backgroundColor: '#F7F7F7' }} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 35, paddingBottom: 5 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        {
                            (this.state.data && this.state.data.actions.length > 0) ? this.state.data.actions.map(
                                (action, i) => this.renderActionItem(this.state.data.type, action, i)
                            ) : null
                        }
                    </View>
                    {
                        this.state.footer.action_type === 'cta' ? (
                            <View style={{ padding: 20, marginTop: this.getOffsetContentHeight() }}>
                                <FrameButton
                                    backgroundColor="#FF5D5D"
                                    width='100%'
                                    onPress={() => this.onTakeAction()}
                                >
                                    <ButtonText textColor="white" bold>{this.state.footer.cta_meta}</ButtonText>
                                </FrameButton>
                            </View>
                        ) : (null)
                    }
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(HelpInteractionScreen)