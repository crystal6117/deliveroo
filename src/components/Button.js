import styled from 'styled-components';

export const FrameButton = styled.TouchableOpacity`
    width: ${props => props.width}
    justify-content: center;
    align-items: center;
    height: 46;
    border-radius: 23;
    background-color: ${props => props.backgroundColor};
`;

export const OutlineButton = styled.TouchableOpacity`
    width: ${props => props.width}
    justify-content: center;
    align-items: center;
    height: 46;
    border-radius: 15;
    border-width: 1;
    border-color: ${props => props.borderColor};
`

export const FlatButton = styled.TouchableOpacity`
    height: 46;
    padding-vertical: 10;
    justify-content: center;
    align-items: center;
`

export const ButtonText = styled.Text`
    font-family: 'Circular Std';
    ${props => props.bold ? "font-weight: bold;" : null}
    font-size: 16;
    line-height: 19;
    color: ${props => props.textColor};
    text-align: center;
`

export const RoundButton = styled.TouchableOpacity`
    width: 40;
    height: 40;
    border-radius: 20;
    background-color: white;
    justify-content: center;
    align-items: center
`

export const AddMinusButton = styled.TouchableOpacity`
    background-color: ${props => props.minus ? '#D0D0D2' : '#FF5D5D'};
    width: 40;
    height: 40;
    justify-content: center;
    align-items: center;
    border-radius: 20;
`