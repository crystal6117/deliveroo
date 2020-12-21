import { Alert } from 'react-native'

export const ceeboAlert = (msg, okFunc, cancelable) => {
    Alert.alert(
        'Ceebo', msg,
        [
            { text: 'OK', onPress: () => okFunc && okFunc() },
        ],
        {cancelable: cancelable ? cancelable : false},
    )
}