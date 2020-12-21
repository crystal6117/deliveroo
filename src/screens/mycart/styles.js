import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7'
    },
    title: {
        fontFamily: 'Circular Std', 
        fontSize: 17, 
        color: 'black',
        textAlign: 'center'
    },
    maincontainer: {
        flex: 1, 
    },
    shadow: {
        backgroundColor: 'white', 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,

        elevation: 5,
    },
    grayTitle: {
        fontFamily: 'Circular Std',
        fontSize: 12,
        color: '#919099'
    },
    txtContent: {
        fontFamily: 'Circular Std',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1824'
    },
    rightRedlbl: {
        fontFamily: 'Circular Std',
        fontSize: 14,
        fontWeight: 'bold',
        color: "#FF5D5D"
    },
    subtitle: {
        fontFamily: 'Circular Std',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1824'
    },
    activeItem: {
        backgroundColor: 'white',
        borderBottomWidth: 4,
        borderColor: '#FE5D5D',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: 60
    },
    generalItem: {
        backgroundColor: '#F7F7F7',
        borderBottomWidth: 4,
        borderColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        height: 60
    },
    itemBigTxt: {
        fontFamily: 'Circular Std',
        fontSize: 14,
        fontWeight: 'bold'
    },
    itemSmallTxt: {
        fontFamily: 'Circular Std',
        fontSize: 12
    },
    activeTxt: {
        color: '#FE5D5D'
    },
    generalTxt: {
        color: '#919099'
    }
})

export default styles;