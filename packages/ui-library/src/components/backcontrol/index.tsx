import { Typography } from '../typography';
import React from 'react';
import { KeyboardBackspaceIcon } from '../../icons';
import { colors } from '../../theme';
import styled from 'styled-components';

const StyledArrowCircle = styled.div`
  ${({ theme: { palette, spacing } }) => `
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colors[palette.mode].background.secondary};
  border-radius: 50%;
  border: 1px solid ${colors[palette.mode].border.border1};
  width: ${spacing(10)};
  height: ${spacing(10)};
  transition: .5s;
  box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};
  `}
`;

const ControlContainer = styled.div`
  ${({ theme: { palette, spacing } }) => `
  display: flex;
  align-items: center;
  color: ${colors[palette.mode].accentPrimary};
  gap: ${spacing(3)};
  cursor: pointer;
  :hover {
    ${StyledArrowCircle} {
      background-color: ${colors[palette.mode].background.tertiary};
      transform: scale(1.05);
    }
  }
  `}
`;

const StyledBackIcon = styled(KeyboardBackspaceIcon)`
  ${({ theme: { palette, spacing } }) => `
color: ${colors[palette.mode].accentPrimary};
gap: ${spacing(3)};
`}
`;

interface Props {
  onClick: () => void;
  label?: string;
}

export const BackControl = ({ onClick, label }: Props) => {
  return (
    <ControlContainer onClick={onClick}>
      <StyledArrowCircle>
        <StyledBackIcon />
      </StyledArrowCircle>
      {label && (
        <Typography variant="bodyRegular" color={({ palette: { mode } }) => colors[mode].accentPrimary}>
          {label}
        </Typography>
      )}
    </ControlContainer>
  );
};
