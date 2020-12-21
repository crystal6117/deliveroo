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
    bottomAction: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 88
    },
    shadow: {
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,

        elevation: 5,
    },
    desc: {
        fontFamily: 'Circular Std', 
        fontSize: 16, 
        color: '#1A1824', 
        lineHeight: 24, 
        marginBottom: 20
    },
    modifierTitle: { 
        height: 60,
        justifyContent: 'flex-end'
    }
})

export default styles;