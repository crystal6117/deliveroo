import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native'
import placeholderImg from '../../assets/images/placeholder.png';
import { BikeIcon, ClockIcon, ShoppingBagIcon, DollarSignIcon, StarIcon, FoodIcon } from './SvgIcons'

export default RestaurantFrame = (props) => (
    <View style={[styles.container, {width: props.width}]}>
        <View style={[styles.imgContainer, {height: props.height}]}>
            {
                props.info.image_url ? (
                    <>
                        <Image  source={placeholderImg} style={{width: props.width, height: props.height, borderRadius: 6, borderColor: "#DADEDF", borderWidth: 1,}} />
                        <Image source={{uri: props.info.image_url}} style={{position: 'absolute', top: 0, left: 0, width: props.width, height: props.height, borderRadius: 6}} />
                    </>
                ) : (
                    <View style={{width: props.width, height: props.height, borderRadius: 20}} />
                )
            }
            <View style={styles.toolbar}>
                <View style={styles.toolbarBack}>
                    <BikeIcon width={15} height={11.6} color="#707070" />
                    <Text style={[styles.price, {marginLeft: 5}]}>{props.info.delivery_fee}</Text>
                </View>
                {
                    props.info.pickup && (
                        <View style={styles.toolbarBack}>
                            <ShoppingBagIcon width={15} height={15} color="#464646" />
                        </View>
                    )
                }
            </View>
        </View>
        <Text style={styles.title}>{props.info.name}</Text>
        <Text style={styles.desc}>{props.info.cuisine}</Text>
        <View style={{flexDirection: 'row'}}>
            <View style={styles.descItem}>
                <StarIcon width={15} height={15} color="#FF5D5D" />
                <Text style={[styles.desc, {marginLeft: 5}]}>{`${props.info.rating ? props.info.rating : ''} (${props.info.total_reviews})`}</Text>
            </View>
            <View style={styles.descItem}>
                <ClockIcon  width={15} height={15} color="#707070" />
                <Text style={[styles.desc, {marginLeft: 5}]}>{props.info.timing}</Text>
            </View>
            <View style={styles.descItem}>
                <FoodIcon width={15} height={15} color="#707070" />
                <Text style={[styles.desc, {marginLeft: 5}]}>{props.info.min_order}</Text>
            </View>
        </View>
    </View>
)

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10
    },
    imgContainer: {
        marginBottom: 10, 
        position: 'relative', 
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6
    },
    img: {
        width: '100%', 
        height: 200
    },
    toolbar: {
        position: 'absolute', 
        bottom: 10, 
        right: 5, 
        flexDirection: 'row'
    },
    toolbarBack: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        backgroundColor: 'white', 
        borderRadius: 15, 
        height: 30, 
        marginRight: 5, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    price: {
        fontFamily: 'Circular Std', 
        fontWeight: 'bold', 
        fontSize: 12
    },
    title: {
        fontFamily: 'Circular Std', 
        fontSize: 18, 
        fontWeight: 'bold',
        marginBottom: 5
    },
    desc: {
        fontFamily: 'Circular Std', 
        fontSize: 12,
        marginBottom: 12
    },
    descItem: {
        flexDirection: 'row', 
        marginRight: 10,
        justifyContent: 'center'
    }
});