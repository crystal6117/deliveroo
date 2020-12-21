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
        paddingLeft: 15
    },
    subtopic: {
        fontFamily: 'Circular Std', 
        fontSize: 13, 
        lineHeight: 18, 
    },
    lbl: {
        fontFamily: 'Circular Std',
        fontSize: 17,
        color: 'black',
        width: 160
    },
    input: {
        height: 50,
        fontFamily: 'Circular Std',
        fontSize: 17,
        textAlignVertical: 'center',
        color: '#242134'
    },
    field: {
        color: '#449aeb',
        borderColor: 'gray',
        borderWidth: 1
    }
})

export default styles;