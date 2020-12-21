import React, { Component } from 'react';
import { View, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'

const width = Dimensions.get('window').width;

class CeeboHeader1 extends Component {
    renderLeftRight(itemInfo) {

        if (itemInfo.type === 'icon') {
            return (
                <TouchableOpacity onPress={() => itemInfo.callback && itemInfo.callback()}>
                    <Icon name={itemInfo.name} color={itemInfo.color} size={itemInfo.size} />
                </TouchableOpacity>
            )
        } else if (itemInfo.type === 'text') {
            return (
                <TouchableOpacity onPress={() => itemInfo.callback && itemInfo.callback()}>
                    <Text style={{ color: itemInfo.color, fontFamily: 'Circular Std', fontSize: itemInfo.size }}>{itemInfo.name}</Text>
                </TouchableOpacity>
            )
        }

        return null
    }

    render() {
        const { left, right, offset } = this.props;
        return (
            <View style={styles.shadow}>
                <View style={{height: offset, backgroundColor: 'white'}} />
                <View style={[(this.props.noBack ? styles.container_noback : styles.container)]}>
                    <View style={styles.left}>
                        {left && this.renderLeftRight(left)}
                    </View>
                    <View style={styles.center}>
                        {this.props.children}
                    </View>
                    <View style={styles.right}>
                        {right && this.renderLeftRight(right)}
                    </View>
                </View>
            </View>
        )
    }
}

export default CeeboHeader1;

const styles = StyleSheet.create({
    container: {
        width: width,
        height: 50,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        zIndex: 999
    },
    container_noback: {
        width: width,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        zIndex: 999
    },
    left: {
        flex: 1
        // width: 80
    },
    right: {
        flex: 1,
        // width: 80,
        alignItems: 'flex-end'
    },
    center: {

    },
    shadow: {
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,

        elevation: 5,
    }
})