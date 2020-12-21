import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Keyboard } from 'react-native';
import { translate } from '../../translate';
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { CeeboInput } from '../../components/Input';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import { Divider } from '../../components/Divider';
import styles from './styles';
import { globalSearch } from '../../apis/listing';
import { connect } from 'react-redux';

class SearchScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
            kitchens: [],
            restaurants: [],
            geoHash: props.navigation.getParam('geoHash')
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.searchRef && this.searchRef.focus()
        }, 500)
    }

    onReload(search) {
        this.setState({ search });
        if (!search) {
            this.setState({ kitchens: [], restaurants: [] });
        } else {
            globalSearch(search, this.state.geoHash).then(res => {
                this.setState({ kitchens: res.collections, restaurants: res.listings });
            })
        }
    }

    render() {
        return (
            <View style={{ flex: 1, paddingTop: this.props.appInfo.statusbarHeight, backgroundColor: 'white' }}>
                <View style={styles.container}>
                    <View style={{position: 'absolute', right: 0, left: 0, height: 70, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20, zIndex: 99 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ padding: 7 }}><FontistoIcon name="close-a" size={18} /></TouchableOpacity>
                    </View>
                    <ScrollView
                        style={styles.maincontainer}
                        scrollIndicatorInsets={{ right: 1 }}
                        onScroll={(e) => Keyboard.dismiss()}
                    >
                        <View style={{ height: 70 }} />
                        <View style={{ paddingVertical: 15 }}>
                            <Text style={{ paddingHorizontal: 15, marginBottom: 20, fontFamily: 'Circular Std', color: '#1A1824', fontSize: 30, fontWeight: 'bold' }}>{translate("search-title")}</Text>
                            <View style={{ marginHorizontal: 15, height: 50, borderBottomWidth: 1, borderColor: '#1A1824', flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                <EvilIcon name="search" color="#95989A" size={25} />
                                <CeeboInput
                                    ref={ref => this.searchRef = ref}
                                    placeholder={translate("search-food")}
                                    isLast
                                    returnKeyType={"done"}
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    value={this.state.search}
                                    onChangeText={(search) => this.onReload(search)}
                                    blurOnSubmit={false}
                                    style={{ flex: 1 }}
                                />
                            </View>

                            {
                                this.state.kitchens && this.state.kitchens.length > 0 ? (
                                    <>
                                        <Text style={[styles.subtitle, { paddingHorizontal: 15, marginBottom: 5 }]}>{translate("kitchens")}</Text>
                                        <View style={[styles.contentframe, { paddingHorizontal: 15, marginBottom: 40 }]}>
                                            {
                                                this.state.kitchens.map((item, i) => (
                                                    <TouchableOpacity onPress={() => {
                                                        this.props.navigation.state.params.selectCollection(item);
                                                        // this.props.navigation.goBack();
                                                    }} key={i}>
                                                        <View style={{ height: 45, flexDirection: 'row', alignItems: 'center' }}>
                                                            <View style={{ width: 29, height: 29, borderRadius: 25, backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                                                <EvilIcon name="search" color="#95989A" size={25} />
                                                            </View>
                                                            <Text style={styles.item}>{item.name}</Text>
                                                        </View>
                                                        <Divider left={45} />
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </View>
                                    </>
                                ) : (null)
                            }

                            {
                                this.state.restaurants && this.state.restaurants.length > 0 ? (
                                    <>
                                        <Text style={[styles.subtitle, { paddingHorizontal: 15, marginBottom: 5 }]}>{translate("restaurant")}</Text>
                                        <View style={[styles.contentframe, { paddingHorizontal: 15, marginBottom: 40 }]}>
                                            {
                                                this.state.restaurants.map((item, i) => (
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('restaurant', { id: item.id })} key={i}>
                                                        <View style={{ height: 45, flexDirection: 'row', alignItems: 'center' }}>
                                                            {
                                                                item.image_url ? (
                                                                    <Image source={{ uri: item.image_url }} style={{ width: 29, height: 29, borderRadius: 25, marginRight: 16 }} imageStyle={{ backgroundColor: '#F7F7F7' }} />
                                                                ) : (
                                                                        <View style={{ width: 29, height: 29, borderRadius: 25, backgroundColor: '#F7F7F7', marginRight: 16 }} />
                                                                    )
                                                            }
                                                            <Text style={styles.item}>{item.name}</Text>
                                                        </View>
                                                        <Divider left={45} />
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </View>
                                    </>
                                ) : (null)
                            }
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(SearchScreen)