import colors from "../../utils/colors";

export default {
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
    },
    searchBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#EFEFEF',
        paddingTop: 20,
        paddingRight: 10,
        alignItems: 'center'
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
}