import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    descItem: {
        flexDirection: 'row', 
        marginRight: 20,
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Circular Std', 
        fontSize: 17, 
        color: 'black',
        textAlign: 'center'
    },
    desc: {
        fontFamily: 'Circular Std', 
        fontSize: 16
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
    }
})

export default styles;