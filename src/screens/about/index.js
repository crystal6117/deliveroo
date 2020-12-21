import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Linking } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import { Divider } from '../../components/Divider';
import styles from './styles';
import {connect} from 'react-redux';

const screenWid = Dimensions.get('window').width;

class AboutScreen extends Component {

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
                        <Text style={styles.title}>About</Text>
                    </CeeboHeader1>
                    <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 41, color: 'black', marginBottom: 30 }}>Ceebo.</Text>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 15, color: '#7C7C7C' }}>{translate("version")} app 1.0.0</Text>
                        </View>
                        <View style={styles.contentframe}>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => Linking.openURL('mailto:support@ceebo.com')}>
                                <Text style={styles.text}>{translate("contact")}</Text>
                                <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                            </TouchableOpacity>
                            <Divider />
                            <TouchableOpacity style={styles.btn}>
                                <Text style={styles.text}>{translate("goto-review-to-appstore")}</Text>
                                <EvilIcon name="chevron-right" color='#FF5D5D' size={30} />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(AboutScreen)