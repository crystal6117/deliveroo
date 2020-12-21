import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, Text, Dimensions, Keyboard, ScrollView, Platform, StatusBar } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import { FrameButton, ButtonText } from '../../components/Button';
import styles from './styles'
import colors from '../../utils/colors';
import { connect } from 'react-redux';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class ProductNoteScreen extends Component {
    constructor() {
        super()
        this.state = {
            comment: "",
            keyboardOpen: false,
            keyboardHeight: 0,
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

        this.setState({ comment: this.props.navigation.getParam("spec") });
        setTimeout(() => {
            this.commentInput.focus();
        }, 300)
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

    onAddComment() {
        this.props.navigation.state.params.onDone(this.state.comment);
        this.props.navigation.goBack();
    }

    getContentHeight() {
        const minContentHei = this.state.frameHei + 126;
        const titleBarHei = 50;
        if (this.state.keyboardOpen) {
            return minContentHei > (screenHei - this.state.keyboardHeight) ? minContentHei : (screenHei - this.state.keyboardHeight);
        } else {
            return (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
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
                    <Text style={styles.title}>{translate("flat-note")}</Text>
                </CeeboHeader1>

                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 40 }} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                        <View style={styles.contentframe}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 22, fontWeight: 'bold', color: "#1A1824", lineHeight: 30, paddingRight: 10 }}>{translate("add-comment-title")}</Text>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#919099", marginTop: 10, marginBottom: 20, paddingRight: 10 }}>{translate("add-comment-desc")}</Text>
                            <CeeboInput
                                ref={ref => this.commentInput = ref}
                                placeholder={translate("add-comment")}
                                isLast
                                returnKeyType={"done"}
                                onChangeText={(comment) => this.setState({ comment })}
                                onSubmitEditing={() => this.onAddComment()}
                                blurOnSubmit={false}
                                value={this.state.comment}
                                style={{ borderTopWidth: 1, borderColor: colors.lightgray }}
                            />
                        </View>
                    </View>

                    <View style={{paddingTop: this.getOffsetHeight()}}>
                        <View style={{ padding: 20 }}>
                            <FrameButton
                                backgroundColor="#FF5D5D"
                                width={'100%'}
                                onPress={() => this.onAddComment()}
                            >
                                <ButtonText textColor="white" bold>{translate("add")}</ButtonText>
                            </FrameButton>
                        </View>
                    </View>
                    {Platform.OS === 'ios' ? (<View style={{ height: this.state.keyboardHeight }} />) : null}
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(ProductNoteScreen)