import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';

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
        flex: 1
    },
    contentframe: {
        borderBottomWidth: 1, 
        borderTopWidth: 1, 
        borderColor: colors.lightgray, 
        backgroundColor: 'white'
    },
    desc: {
        fontFamily: 'Circular Std', 
        fontSize: 16
    }
})

export default styles;