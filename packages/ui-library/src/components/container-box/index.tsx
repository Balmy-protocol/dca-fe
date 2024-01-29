import { CSSProperties, HTMLAttributes } from 'react';
import styled from 'styled-components';

interface ContainerBoxProps extends HTMLAttributes<HTMLDivElement> {
  flexDirection?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  flexWrap?: CSSProperties['flexWrap'];
  flexGrow?: CSSProperties['flexGrow'];
  alignSelf?: CSSProperties['alignSelf'];
  flex?: CSSProperties['flex'];
  gap?: number;
  fullWidth?: boolean;
}

const ContainerBox = styled.div<ContainerBoxProps>`
  display: flex;
  flex-direction: ${({ flexDirection = 'row' }) => flexDirection};
  justify-content: ${({ justifyContent = 'flex-start' }) => justifyContent};
  align-items: ${({ alignItems = 'stretch' }) => alignItems};
  flex-wrap: ${({ flexWrap = 'nowrap' }) => flexWrap};
  flex-grow: ${({ flexGrow = 0 }) => flexGrow};
  align-self: ${({ alignSelf = 'auto' }) => alignSelf};
  flex: ${({ flex = '0 1 auto' }) => flex};
  width: ${({ fullWidth }) => fullWidth && '100%'};
  gap: ${({ gap, theme: { spacing } }) => gap && spacing(gap)};
`;

export { ContainerBox, ContainerBoxProps };
