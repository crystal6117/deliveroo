import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    title: {
        fontFamily: 'Circular Std', 
        fontSize: 17, 
        color: 'black',
        textAlign: 'center'
    },
    maincontainer: {
        flex: 1, 
        backgroundColor: '#F7F7F7'
    },
    descItem: {
        flexDirection: 'row', 
        marginRight: 20,
        alignItems: 'center'
    },
    desc: {
        fontFamily: 'Circular Std', 
        fontSize: 16,
        color: '#1A1824'
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
    },
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 86
    },
})

export default styles;