import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7"
    },
    title: {
        fontFamily: 'Circular Std', 
        fontSize: 17, 
        color: 'black',
        textAlign: 'center'
    },
    maincontainer: {
        flex: 1
    },
    contentframe: {
        borderBottomWidth: 1, 
        borderTopWidth: 1, 
        borderColor: colors.lightgray, 
        backgroundColor: 'white', 
        paddingLeft: 10
    },
    title1: {
        fontFamily: 'Circular Std', 
        fontWeight: 'bold', 
        fontSize: 14, 
        color: "#242134"
    },
    desc: {
        fontFamily: 'Circular Std',
        fontSize: 12,
        color: "#1A1824"
    },
    deliveryStep: {
        height: 6,
        borderRadius: 3
    },
    subtitle: {
        fontFamily: "Circular Std",
        fontSize: 14, 
        fontWeight: 'bold',
        color: "#1A1824"
    },
    desc: {
        fontFamily: 'Circular Std',
        fontSize: 12,
        color: "#707070"
    },
    redlbl: {
        fontFamily: 'Circular Std',
        fontSize: 16,
        fontWeight: 'bold',
        color: "#FF5D5D"
    },
    grayTitle: {
        fontFamily: 'Circular Std',
        fontSize: 12,
        color: '#919099'
    }
})

export default styles;