import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, TextInput, ActivityIndicator, Keyboard, Platform } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { Divider } from '../../components/Divider';
import styles from './styles';
import { getOrderInteractions } from '../../apis/help';
import { connect } from 'react-redux';
import { translate } from '../../translate';

class HelpScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            orderDetail: props.navigation.getParam("orderDetail"),
            loading: true,
            helpInteractions: null,
            error: null,
            keyboardOpen: false,
            keyboardHeight: 0
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

        this.setState({ loading: true })
        getOrderInteractions(this.state.orderDetail.id).then(hInteractions => {
            this.setState({ helpInteractions: hInteractions, loading: false });
        }).catch(error => {
            this.setState({ error, loading: false })
        })
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
                    <Text style={styles.title}>{this.state.helpInteractions ? this.state.helpInteractions.title : translate("help-order")}</Text>
                </CeeboHeader1>
                {
                    this.state.loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    ) : (
                            this.state.error ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: 'FF5D5D', fontSize: 14, textAlign: 'center' }} >{this.state.error.toString()}</Text>
                                </View>
                            ) : (
                                    <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                                        <View style={{ paddingVertical: 35 }}>
                                            {
                                                (this.state.helpInteractions && this.state.helpInteractions.interactions.length > 0) ? this.state.helpInteractions.interactions.map(
                                                    (interaction, i) => (
                                                        <View key={i}>
                                                            <TouchableOpacity
                                                                style={styles.interaction}
                                                                onPress={() => this.props.navigation.navigate("helpinteraction", { data: interaction.data, title: interaction.title, footer: interaction.footer, orderId: this.state.orderDetail.id })}
                                                            >
                                                                <Text style={styles.itemText}>{interaction.title}</Text>
                                                                <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                                                            </TouchableOpacity>
                                                            {
                                                                i !== this.state.helpInteractions.interactions.length - 1 ? (<Divider />) : (null)
                                                            }
                                                        </View>
                                                    )
                                                ) : null
                                            }
                                        </View>
                                    </ScrollView>
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

export default connect(mapStateToProps, null)(HelpScreen)