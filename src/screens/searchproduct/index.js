import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Dimensions, Image, TextInput, Keyboard } from 'react-native';
import styles from './styles'
import placeholderImg from '../../../assets/images/placeholder.png';
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { translate } from '../../translate';
import { connect } from 'react-redux';
import { Divider } from '../../components/Divider';

const screenWid = Dimensions.get('window').width;

class SearchProductScreen extends Component {
    constructor(props) {
        super(props)
        const restaurantInfo = props.navigation.getParam("restaurantInfo");
        const disabledRestaurant = (restaurantInfo.is_paused || restaurantInfo.opening_hours.opened === false) ? true : false;
        this.state = {
            restaurantInfo,
            disabledRestaurant,
            searchProducts: null,
            search: ''
        }

        this.products = props.navigation.getParam("products")
    }

    onSearch(search) {
        this.setState({ search });

        if (!search) {
            this.setState({ searchProducts: this.products });
        } else {
            const s = search.toLowerCase();
            var pResult = [];
            for (var i = 0; i < this.products.length; i++) {
                const menu = this.products[i]
                if (menu.items && Array.isArray(menu.items) && menu.items.length > 0) {
                    if (menu.name.toLowerCase().search(s) >= 0) {
                        pResult.push(menu)
                    } else {
                        var menuRes = [];
                        for (var j = 0; j < menu.items.length; j++) {
                            const product = menu.items[j];
                            if (product.name.toLowerCase().search(s) >= 0) {
                                menuRes.push(product)
                            }
                        }

                        if (menuRes.length > 0) {
                            pResult.push({
                                name: menu.name,
                                items: menuRes
                            })
                        }
                    }
                }
            }
            this.setState({ searchProducts: pResult.length > 0 ? pResult : null });
        }
    }

    componentDidMount() {
        this.onSearch('');

        setTimeout(() => {
            this.searchInputRef.focus();
        }, 200)
    }

    renderProductInfo(product, index, isLast) {
        return (
            <View key={index}>
                <TouchableOpacity 
                    style={{ paddingTop: 20, paddingBottom: 20, flexDirection: 'row' }} 
                    onPress={
                        () => {
                            if (this.state.disabledRestaurant) {
                                return;
                            }
                            this.props.navigation.goBack();
                            this.props.navigation.navigate("productdetail", { itemId: product.id, listingId: this.state.restaurantInfo.id })
                        }
                    }
                >
                    {
                        product.image_url === false ? (null) : (
                            <View style={{ width: 60 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 5 }}>
                                    <Image source={placeholderImg} style={{ width: 44, height: 44, borderRadius: 5, backgroundColor: '#EAEAEB' }} />
                                    <Image source={{ uri: product.image_url }} style={{ position: 'absolute', top: 0, left: 0, width: 44, height: 44 }} />
                                </View>
                            </View>
                        )
                    }
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: '#1A1A1A', marginBottom: 10 }}>{product.name}</Text>
                        <Text style={{ fontFamily: 'Circular Std', fontSize: 12, color: '#919099' }}>{product.description}</Text>
                    </View>
                    <View style={{ width: 70, alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 16, color: '#FF5D5D' }}>{product.unit_price}</Text>
                    </View>
                </TouchableOpacity>
                {!isLast && (<Divider />)}
            </View>
        )
    }

    render() {
        let { searchProducts } = this.state;
        return (
            <View style={{ flex: 1, paddingTop: this.props.appInfo.statusbarHeight, backgroundColor: 'white' }}>
                <View style={styles.container}>
                    <View style={{ height: 50, flexDirection: 'row', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingLeft: 10, paddingRight: 15 }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                            <EvilIcon name="search" color="#95989A" size={25} style={{ marginLeft: 7 }} />
                            <TextInput
                                style={{ height: 50, justifyContent: 'center', fontFamily: 'Circular Std', fontSize: 15, color: 'black', flex: 1 }}
                                value={this.state.search}
                                onChangeText={(search) => this.onSearch(search)}
                                ref={ref => this.searchInputRef = ref}
                            />
                        </View>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: '#FE5D5D' }}>{translate("cancel")}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={styles.maincontainer}
                        scrollIndicatorInsets={{ right: 1 }}
                        ref={ref => this.scrollViewRef = ref}
                    >
                        {
                            searchProducts ? (
                                searchProducts.map((menu, i) => (
                                    (menu.items && menu.items.length > 0) ? (
                                        <View key={i}>
                                            <View style={{ height: 55, justifyContent: 'center', paddingHorizontal: 10 }}>
                                                <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 24, color: "#1A1824" }}>{menu.name}</Text>
                                            </View>
                                            <View style={{ backgroundColor: 'white', paddingHorizontal: 10 }}>
                                                {
                                                    menu.items && menu.items.map((item, j) => this.renderProductInfo(item, j, (menu.items.length - 1 === j) ? true : false))
                                                }
                                            </View>
                                        </View>
                                    ) : (null)
                                ))
                            ) : (
                                    <View style={{ paddingHorizontal: 10, paddingBottom: 20 }}>
                                        <Text style={{ fontFamily: 'Circular Std', fontSize: 15, color: "#1A1824", textAlign: 'center', marginTop: 20 }}>Nessun risultato trovato</Text>
                                    </View>
                                )
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(SearchProductScreen)