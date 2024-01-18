import React, { PropsWithChildren, CSSProperties, HTMLAttributes } from 'react';
import styled from 'styled-components';

interface ContainerBoxProps extends HTMLAttributes<HTMLDivElement> {
  flexDirection?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  alignContent?: CSSProperties['alignContent'];
  flexWrap?: CSSProperties['flexWrap'];
  gap?: number;
  fullWidth?: boolean;
}

const StyldContainerBox = styled.div<ContainerBoxProps>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection};
  justify-content: ${({ justifyContent }) => justifyContent};
  align-items: ${({ alignItems }) => alignItems};
  align-content: ${({ alignContent }) => alignContent};
  flex-wrap: ${({ flexWrap }) => flexWrap};
  width: ${({ fullWidth }) => fullWidth && '100%'};
  gap: ${({ gap, theme: { spacing } }) => gap && spacing(gap)};
`;

const ContainerBox = ({ children, ...props }: PropsWithChildren<ContainerBoxProps>) => {
  return <StyldContainerBox {...props}>{children}</StyldContainerBox>;
};

export { ContainerBox, ContainerBoxProps };
