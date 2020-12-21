export default {
    container: {
        width: '100%',
        height: '100%'
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    maincontent: {
        backgroundColor: 'white',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingVertical: 50,
        paddingHorizontal: 20,

        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5
    },
    title: { 
        fontFamily: 'Circular Std', 
        fontWeight: 'bold', 
        fontSize: 30, 
        lineHeight: 36, 
        color: "#1A1824" 
    },
    desc: {
        marginTop: 10,
        fontFamily: 'Circular Std', 
        fontSize: 16, 
        lineHeight: 24, 
        color: "#1A1824"
    }
}