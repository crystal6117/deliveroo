import React, { Component } from 'react';
import { translate } from '../../translate';
import { View, ScrollView, Text, TouchableOpacity, ImageBackground, Image, Animated, ActivityIndicator, Linking } from 'react-native';
import FoundationIcon from 'react-native-vector-icons/Foundation';
import CeeboHeader1 from '../../components/CeeboHeader1';
import styles from './styles'
import { Divider } from '../../components/Divider'
import { connect } from 'react-redux';

class ReviewAllScreen extends Component {
    constructor() {
        super()
        this.state = {
            reviews: []
        }
        this.isFixed = false;
    }

    componentDidMount() {
        const reviews = this.props.navigation.getParam("reviews");
        this.setState({ reviews })
    }

    onExpandCollapse(i) {
        var reviews = [...this.state.reviews];
        const item = reviews[i];
        item.expand = !item.expand;
        reviews[i] = item;
        this.setState({ reviews });
    }

    render() {

        let { reviews } = this.state;
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
                    <Text style={styles.title}>{translate("reviews")}</Text>
                </CeeboHeader1>
                <ScrollView style={{ flex: 1 }} scrollIndicatorInsets={{ right: 1 }}>
                    <View style={{ paddingHorizontal: 10, backgroundColor: 'white', marginTop: 30 }}>
                        {
                            reviews.map((item, index) => (
                                <View key={index} style={{ marginVertical: 10 }}>
                                    {/* <TouchableOpacity style={{ marginBottom: 5, flexDirection: 'row' }} onPress={() => this.onExpandCollapse(index)}> */}
                                    <View style={{ marginBottom: 5, flexDirection: 'row' }}>
                                        {/* <View style={{ width: 60 }}>
                                            {
                                                item.image_url === false ? (
                                                    <View style={{ width: 44, height: 44, borderRadius: 5, backgroundColor: '#EAEAEB' }}></View>
                                                ) : (
                                                        <Image source={{ uri: item.image_url }} style={{ width: 44, height: 44, borderRadius: 5, backgroundColor: '#EAEAEB' }} />
                                                    )
                                            }
                                        </View> */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: '#1A1A1A', marginBottom: 10 }}>{item.first_name}</Text>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099' }}>{item.created_at}</Text>
                                        </View>
                                        <View style={{ width: 56, height: 32, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 5 }}>
                                            <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: "white", marginRight: 5 }}>{item.rating}</Text>
                                            <FoundationIcon name="star" size={15} color="white" style={{ marginRight: 5 }} />
                                        </View>
                                        {/* </TouchableOpacity> */}
                                    </View>
                                    {/* {item.expand && (<Text style={{ marginTop: 10, fontFamily: 'Circular Std', fontSize: 12, color: "#919099" }}>{item.comments}</Text>)} */}
                                    <Text style={{ marginTop: 10, fontFamily: 'Circular Std', fontSize: 12, color: "#919099" }}>{item.comments}</Text>
                                    {/* <Divider /> */}
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(ReviewAllScreen)