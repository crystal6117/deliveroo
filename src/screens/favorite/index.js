import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { translate } from '../../translate';
import CeeboHeader1 from '../../components/CeeboHeader1';
import styles from './styles';
import config from '../../config';
import Axios from 'axios';
import RestaurantFrame from '../../components/RestaurantFrame';
import { connect } from 'react-redux';
import { getFavorites } from '../../apis/listing';

class FavoriteScreen extends Component {
    constructor() {
        super()
        this.state = {
            restaurants: [],
            loading: true
        }
    }

    componentDidMount() {
        getFavorites().then(res => {
            this.setState({ restaurants: res, loading: false })
        }).catch(error => {
            this.setState({ restaurants: [], loading: false })
        })
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
                        <Text style={styles.title}>{translate("favorite")}</Text>
                    </CeeboHeader1>
                    {
                        this.state.loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" />
                            </View>
                        ) : (
                                <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                                    {
                                        this.state.restaurants.map((restaurant, index) => (
                                            <TouchableOpacity
                                                onPress={() => this.props.navigation.navigate("restaurant", { id: restaurant.id })}
                                                style={{ paddingHorizontal: 15, paddingVertical: 5 }}
                                                key={index}>
                                                <RestaurantFrame width={'100%'} height={200} info={restaurant} />
                                            </TouchableOpacity>
                                        ))
                                    }
                                </ScrollView>
                            )
                    }
                </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(FavoriteScreen)