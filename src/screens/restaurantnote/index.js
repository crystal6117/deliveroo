import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, Text, Dimensions, ScrollView, Keyboard, Platform, StatusBar } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import { CeeboInput } from '../../components/Input';
import { FrameButton, ButtonText } from '../../components/Button';
import styles from './styles'
import colors from '../../utils/colors';
import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { setCartRestaurantNote } from '../../actions/cart';

const screenWid = Dimensions.get('window').width;
const screenHei = Dimensions.get('window').height;

class RestaurantNoteScreen extends Component {
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
        this.setState({ comment: this.props.navigation.getParam("notes") });
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

    onAddComment() {
        if (!this.state.comment) {
            Toast.show(translate("type-notes"));
            this.commentInput.focus();
            return;
        }

        this.props.setCartRestaurantNote(this.state.comment);
        this.props.navigation.state.params.onDone(this.state.comment);
        this.props.navigation.goBack();
    }

    getContentHeight() {
        const minContentHei = this.state.frameHei + 126;
        const titleBarHei = 50;
        // if (this.state.keyboardOpen) {
        //     return minContentHei > (screenHei - this.state.keyboardHeight) ? minContentHei : (screenHei - this.state.keyboardHeight);
        // } else {
        //     return (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
        // }
        return (screenHei - this.props.appInfo.statusbarHeight - titleBarHei);
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
                        <Text style={styles.title}>{translate("add-restaurant-comment-title")}</Text>
                    </CeeboHeader1>

                    <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                        <View style={{ height: this.getContentHeight(), paddingTop: 40 }}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.contentframe} onLayout={(event) => this.setState({ frameHei: event.nativeEvent.layout.height })}>
                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 22, fontWeight: 'bold', color: "#1A1824", lineHeight: 36, paddingRight: 10 }}>{translate("add-restaurant-comment-subtitle")}</Text>
                                    <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "#919099", marginTop: 10, marginBottom: 44, paddingRight: 10 }}>{translate("add-restaurant-comment-desc")}</Text>
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

                            <View style={{ paddingHorizontal: 20 }}>
                                <FrameButton
                                    backgroundColor="#FF5D5D"
                                    width='100%'
                                    style={{ marginBottom: 20 }}
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

const mapDispatchToProps = dispatch => {
    return {
        setCartRestaurantNote: (note) => { dispatch(setCartRestaurantNote(note)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RestaurantNoteScreen)