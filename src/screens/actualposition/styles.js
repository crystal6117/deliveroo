import colors from '../../utils/colors';

export default {
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
        paddingVertical: 20, 
        paddingHorizontal: 40
    },
    socialcontainer: {
        flex: 1, 
        justifyContent: 'center'
    },
    subtopic: {
        fontFamily: 'Circular Std', 
        fontSize: 12, 
        lineHeight: 18, 
        textAlign: 'center'
    },
    contentframe: {
        borderBottomWidth: 1, 
        borderTopWidth: 1, 
        borderColor: colors.lightgray, 
        backgroundColor: 'white', 
        paddingLeft: 10
    }
}