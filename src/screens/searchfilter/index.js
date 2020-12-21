import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { translate } from '../../translate';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import CeeboHeader1 from '../../components/CeeboHeader1';
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { FrameButton, FlatButton, ButtonText } from '../../components/Button';
import styles from './styles';
import config from '../../config';
import { explore } from '../../apis/listing';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';

const FilterItem = (props) => (
    <View style={{ flexDirection: 'row', height: 60 }}>
        <View style={{ width: 50, justifyContent: 'center' }}>
            {
                props.checked ? (
                    <View style={{ width: 26, height: 26, borderRadius: 5, backgroundColor: '#FF5D5D', justifyContent: 'center', alignItems: "center", }}>
                        <EntypoIcon name="check" color="white" size={15} />
                    </View>
                ) : (
                        <View style={{ width: 26, height: 26, borderRadius: 5, borderWidth: 1, borderColor: '#D0D0D2' }}></View>
                    )
            }
        </View>
        <View style={{ height: 60, flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Circular Std', fontSize: 16, color: "#1A1824" }}>{props.name}</Text>
        </View>
    </View>
)

class SearchFilterScreen extends Component {
    constructor() {
        super()
        this.state = {
            categories: [],
            diets: [],
            geoHash: null,
            loading: false,
            fulfillment: null
        }
    }

    async componentDidMount() {
        var categories = this.props.navigation.getParam("categories");
        for (var i = 0; i < categories.length; i++) {
            categories[i].checked = false
        }

        var diets = this.props.navigation.getParam("diets");
        for (var i = 0; i < diets.length; i++) {
            diets[i].checked = false
        }
        var geoHash = this.props.navigation.getParam("geoHash");
        var fulfillment = this.props.navigation.getParam("fulfillment");
        this.setState({ categories, diets, geoHash, fulfillment });
    }

    async onApplyFilter() {
        var url = config.exploreTabURL + "?geohash=" + this.state.geoHash + "&fulfillment=" + this.state.fulfillment

        var isOk = false;
        this.state.categories.forEach(cat => {
            if (cat.checked) {
                url = url + "&category[]=" + cat.slug;
                isOk = true;
            }
        })

        this.state.diets.forEach(diet => {
            if (diet.checked) {
                url = url + "&dietary[]=" + diet.slug;
                isOk = true;
            }
        })

        if (isOk) {
            this.setState({ loading: true })
            explore(url).then(res => {
                this.props.navigation.navigate("restaurants", { restaurants: { title: translate("filter-restaurants"), listings: res.listings } })
                this.setState({ loading: false })
            }).catch(error => {
                this.setState({ loading: false })
                setTimeout(() => {
                    Alert.alert('Ceebo', error.toString());
                }, 400)
            })
        }
        else {
            Alert.alert('Ceebos', translate("select-filters"));
        }
    }

    async onRemoveFilter() {
        var categories = this.state.categories;
        var diets = this.state.diets;
        categories.forEach((category, i) => {
            categories[i].checked = false;
        })
        diets.forEach((diet, i) => {
            diets[i].checked = false;
        })

        this.setState({ categories, diets });
    }

    onToggleCategory(i, type) {
        var categories = this.state.categories;
        if (!categories[i].checked || type === 'format') {
            categories[i].checked = true;
        } else {
            categories[i].checked = false;
        }
        this.setState({ categories });
    }

    onToggleDiet(i, type) {
        var diets = this.state.diets;
        if (!diets[i].checked || type === 'format') {
            diets[i].checked = true;
        } else {
            diets[i].checked = false;
        }
        this.setState({ diets });
    }

    render() {
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
                    right={{
                        type: 'text',
                        name: translate('remove'),
                        fontFamily: 'Circular Std',
                        size: 16,
                        color: '#FE5D5D',
                        callback: () => this.onRemoveFilter()
                    }}
                    offset={this.props.appInfo.statusbarHeight}
                >
                    <Text style={styles.title}>{translate("search")}</Text>
                </CeeboHeader1>

                {/* main content */}
                <ScrollView style={{ flex: 1, paddingTop: 35 }} scrollIndicatorInsets={{ right: 1 }}>
                    <Text style={{ fontFamily: 'Circular Std', fontSize: 30, color: "#1A1824", paddingHorizontal: 20 }}>{translate("custom-your-search")}</Text>

                    <View style={{ marginTop: 40, paddingHorizontal: 20 }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 24, color: 'black', marginBottom: 10 }}>{translate("select-category")}</Text>
                        {
                            this.state.categories.map((category, i) => (
                                <TouchableOpacity onPress={() => this.onToggleCategory(i)} key={i}>
                                    <FilterItem checked={category.checked} name={category.name} />
                                </TouchableOpacity>
                            ))
                        }
                    </View>

                    <View style={{ marginTop: 30, paddingBottom: 20, paddingHorizontal: 20 }}>
                        <Text style={{ fontFamily: 'Circular Std', fontWeight: 'bold', fontSize: 24, color: 'black', marginBottom: 10 }}>{translate("select-diet")}</Text>
                        {
                            this.state.diets.map((diet, i) => (
                                <TouchableOpacity onPress={() => this.onToggleDiet(i)} key={i}>
                                    <FilterItem checked={diet.checked} name={diet.name} />
                                </TouchableOpacity>
                            ))
                        }
                    </View>

                    {/* confirm button */}
                    <View style={{ paddingHorizontal: 20, borderTopLeftRadius: 6, borderTopRightRadius: 6, paddingVertical: 15 }}>
                        <FrameButton
                            backgroundColor="#FF5D5D"
                            width='100%'
                            style={{ marginBottom: 10 }}
                            onPress={() => this.onApplyFilter()}
                        >
                            <ButtonText textColor="white" bold>{translate("apply-filter")}</ButtonText>
                        </FrameButton>
                    </View>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return state
}

export default connect(mapStateToProps, null)(SearchFilterScreen)