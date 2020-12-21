import styled from 'styled-components';
import colors from '../utils/colors';

export const CeeboInput = styled.TextInput`
    height: 50;
    background-color: white;
    font-size: 17;
    font-family: 'Circular Std';
    line-height: 22;
    color: black;
    ${props => props.isLast ? null : `border-color: ${colors.lightgray}; border-bottom-width: 1`}
`