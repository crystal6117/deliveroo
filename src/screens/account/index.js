import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Linking } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import OctIcon from 'react-native-vector-icons/Octicons';
import { FlatButton, ButtonText } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { connect } from 'react-redux';
import { setSigninUserInfo, setProfileInfo } from '../../actions/signin';
import { removeUserToken, removeSigninInfo } from '../../utils/session';
import styles from './styles';
import { StackActions, NavigationActions } from 'react-navigation';
import { OrderIcon, HeartIcon, LocationIcon, CreditCardIcon, } from '../../components/SvgIcons';
import { logout } from '../../apis/user';
import Spinner from 'react-native-loading-spinner-overlay';
import { GoogleSignin } from '@react-native-community/google-signin';

const screenWid = Dimensions.get('window').width;

class AccountScreen extends Component {
    constructor() {
        super()
        this.state = {
            profileInfo: null,
            loading: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.signin.profile_info) {
            const profileInfo = nextProps.signin.profile_info.data;
            if (profileInfo) {
                return {
                    profileInfo
                }
            } else {
                return { profileInfo: null };
            }
        } else {
            return { profileInfo: null };
        }
    }

    async logout() {
        this.setState({ loading: true })
        logout(this.props.signin.profile_info.data.id).then(async () => {
            await removeUserToken();
            await removeSigninInfo();
            const resetAction = StackActions.reset({
                index: 1,
                actions: [
                    NavigationActions.navigate({ routeName: 'first' }),
                    NavigationActions.navigate({ routeName: 'signinlist' })
                ],
            });
            this.props.navigation.dispatch(resetAction);
            this.props.setSigninUserInfo(null);
            this.props.setProfileInfo(null);
            const isGoogelSignedIn = await GoogleSignin.isSignedIn();
            if (isGoogelSignedIn) {
                console.log("**** google signed in ****");
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            }
            this.setState({ loading: false })
        }).catch(error => {
            this.setState({ loading: false });
            setTimeout(() => {
                Alert.alert("", error);
            }, 400);
        })
    }

    onLogout() {
        Alert.alert(
            translate("logout"),
            translate("sure-log-out"),
            [
                { text: "No", onPress: () => { } },
                { text: translate("yes"), onPress: () => this.logout() }
            ],
            { cancelable: true }
        );
    }

    render() {
        const { profileInfo } = this.state;

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
                    <Text style={styles.title}>{translate("account")}</Text>
                </CeeboHeader1>
                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingTop: 35, paddingBottom: 40 }}>
                        {profileInfo ? (
                            <>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate("profile")}>
                                    <View style={[styles.contentframe, { height: 80, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', paddingRight: 10 }]}>
                                        <Image source={{ uri: profileInfo.image_url }} style={{ width: 63, height: 63, backgroundColor: 'lightgray', borderRadius: 35 }} />
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 21, color: 'black', lineHeight: 22 }}>{profileInfo.first_name + ' ' + profileInfo.last_name}</Text>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 14, color: '#98989F', lineHeight: 22 }}>
                                                {profileInfo.email}
                                                {profileInfo.phone_number ? (
                                                    <Text>, {profileInfo.phone_number}</Text>
                                                ) : (null)}
                                            </Text>
                                        </View>
                                        <EvilIcon name="chevron-right" color="#616065" size={30} />
                                    </View>
                                </TouchableOpacity>
                                <View style={{ height: 20 }} />
                            </>
                        ) : (
                                <View style={styles.contentframe}>
                                    <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("signinlist")}>
                                        <Text style={[styles.textItem, { flex: 1, textAlign: 'center' }]}>{translate("login-register")}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                        {profileInfo && (
                            <View style={styles.contentframe}>
                                <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("myorders")}>
                                    <View style={{ width: 30 }}>
                                        <OrderIcon width={20} height={20} color="#637381" />
                                    </View>
                                    <Text style={[styles.textItem, { flex: 1 }]}>{translate("myorders")}</Text>
                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                    <View style={{ width: 10 }} />
                                </TouchableOpacity>
                                <Divider left={30} />

                                <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("favorite")}>
                                    <View style={{ width: 30 }}>
                                        <HeartIcon width={20} height={20} color="#637381" />
                                    </View>
                                    <Text style={[styles.textItem, { flex: 1 }]}>{translate("favorite")}</Text>
                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                    <View style={{ width: 10 }} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {profileInfo && (
                            <View style={[styles.contentframe, { marginTop: 20 }]}>
                                <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("myaddress")}>
                                    <View style={{ width: 30 }}>
                                        <LocationIcon width={20} height={20} color="#637381" />
                                    </View>
                                    <Text style={[styles.textItem, { flex: 1 }]}>{translate("myaddresses")}</Text>
                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                    <View style={{ width: 10 }} />
                                </TouchableOpacity>
                                <Divider left={30} />

                                <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("paymentmethod")}>
                                    <View style={{ width: 30 }}>
                                        <CreditCardIcon width={20} height={20} color="#637381" />
                                    </View>
                                    <Text style={[styles.textItem, { flex: 1 }]}>{translate("paymentmethods")}</Text>
                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                    <View style={{ width: 10 }} />
                                </TouchableOpacity>
                                <Divider left={30} />

                                <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("profile")}>
                                    <View style={{ width: 30, justifyContent: 'center' }}>
                                        <OctIcon name="settings" color="#637381" size={20} />
                                    </View>
                                    <Text style={[styles.textItem, { flex: 1 }]}>{translate("setting")}</Text>
                                    <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                    <View style={{ width: 10 }} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={[styles.contentframe, { marginTop: 20 }]}>
                            <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("about")}>
                                <Text style={[styles.textItem, { flex: 1 }]}>{translate("about")}</Text>
                                <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                <View style={{ width: 10 }} />
                            </TouchableOpacity>
                            <Divider left={10} />

                            {/* <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("termscondition")}> */}
                            <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("https://ceebo.com/legal/terms")}>
                                <Text style={[styles.textItem, { flex: 1 }]}>{translate("terms-condition")}</Text>
                                <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                <View style={{ width: 10 }} />
                            </TouchableOpacity>
                            <Divider left={10} />

                            {/* <TouchableOpacity style={styles.btn} onPress={() => this.props.navigation.navigate("privacypolicy")}> */}
                            <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("https://ceebo.com/legal/policy")}>
                                <Text style={[styles.textItem, { flex: 1 }]}>{translate("privacy-policy")}</Text>
                                <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                <View style={{ width: 10 }} />
                            </TouchableOpacity>
                            <Divider left={10} />

                            <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("https://support.ceebo.com/customer")}>
                                <Text style={[styles.textItem, { flex: 1 }]}>{translate("need-help")}</Text>
                                <EvilIcon name="chevron-right" color="#FF5D5D" size={30} />
                                <View style={{ width: 10 }} />
                            </TouchableOpacity>
                        </View>

                        {profileInfo && (
                            <View style={[styles.contentframe, { marginTop: 40, paddingRight: 15 }]}>
                                <FlatButton width={screenWid} style={{ paddingLeft: 0 }} onPress={() => this.onLogout()}>
                                    <ButtonText textColor="#DC3545">{translate("logout")}</ButtonText>
                                </FlatButton>
                            </View>
                        )}
                    </View>
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
        setSigninUserInfo: (user) => { dispatch(setSigninUserInfo(user)) },
        setProfileInfo: (profileInfo) => { dispatch(setProfileInfo(profileInfo)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountScreen)