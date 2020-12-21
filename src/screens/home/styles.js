import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headercontainer: {
        zIndex: 3,
    },
    maincontainer: {
        flex: 1
    },
    headertitle: {
        backgroundColor: 'white',
        paddingHorizontal: 10,
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
        zIndex: 3
    },
    searchBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#EFEFEF',
        paddingTop: 5,
        paddingRight: 10,
        alignItems: 'center',
    },
    activeCollection: {
        borderWidth: 2,
        borderColor: 'blue'
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


export default styles