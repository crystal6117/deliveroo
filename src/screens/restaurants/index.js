import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import CeeboHeader1 from '../../components/CeeboHeader1';
import RestaurantFrame from '../../components/RestaurantFrame';
import styles from './styles';
import { explore } from '../../apis/listing';
import { connect } from 'react-redux';
import { translate } from '../../translate';

class RestaurantListScreen extends Component {
    constructor() {
        super()
        this.state = {
            title: '',
            restaurants: [],
            loading: true
        }
    }

    componentDidMount() {
        const urlLoad = this.props.navigation.getParam("urlLoad");
        if (urlLoad) {
            explore(urlLoad).then(restaurants => {
                this.setState({ title: "Filter Restaurants", restaurants: restaurants.listings, loading: false })
            }).catch(error => {
                this.setState({ loading: false, error: error.toString() })
            })
        } else {
            const restaurants = this.props.navigation.getParam('restaurants')
            if (restaurants) {
                this.setState({ title: restaurants.title ? restaurants.title : restaurants.name, restaurants: restaurants.listings, loading: false })
            }
        }
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
                    <Text style={styles.title}>{this.state.title}</Text>
                </CeeboHeader1>
                {
                    this.state.loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    ) : (
                            <ScrollView style={styles.maincontainer} scrollIndicatorInsets={{ right: 1 }}>
                                {
                                    this.state.restaurants.length > 0 ? this.state.restaurants.map((restaurant, index) => (
                                        <TouchableOpacity
                                            onPress={() => this.props.navigation.navigate("restaurant", { id: restaurant.id })}
                                            style={{ paddingHorizontal: 15, paddingVertical: 5 }}
                                            key={index}>
                                            <RestaurantFrame width={'100%'} height={200} info={restaurant} />
                                        </TouchableOpacity>
                                    )) : (
                                            <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 20 }}>{translate("no-restaurant")}</Text>
                                        )
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

export default connect(mapStateToProps, null)(RestaurantListScreen)