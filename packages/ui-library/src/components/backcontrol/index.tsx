import { Typography } from '../typography';
import React from 'react';
import { colors } from '../../theme';
import styled, { useTheme } from 'styled-components';
import { ArrowRightLightIcon } from '../../icons';
import { ButtonProps } from '@mui/material';

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

const ControlContainer = styled.div<{ variant: ButtonProps['variant'] }>`
  ${({ theme: { palette, spacing }, variant }) => `
  display: flex;
  align-items: center;
  color: ${colors[palette.mode].accentPrimary};
  gap: ${variant === 'text' ? spacing(1) : spacing(3)};
  cursor: pointer;
  :hover {
    ${StyledArrowCircle} {
      background-color: ${colors[palette.mode].background.tertiary};
      transform: scale(1.05);
    }
  }
  `}
`;

const StyledBackIcon = styled(ArrowRightLightIcon)`
  ${({ theme: { palette, spacing } }) => `
  color: ${colors[palette.mode].accentPrimary};
  gap: ${spacing(3)};
  transform: rotate(180deg);
`}
`;

interface Props {
  onClick: () => void;
  label?: string;
  variant?: ButtonProps['variant'];
}

export const BackControl = ({ onClick, label, variant }: Props) => {
  const { spacing } = useTheme();
  return (
    <ControlContainer onClick={onClick} variant={variant}>
      {variant === 'text' && <StyledBackIcon size={spacing(6)} />}
      {variant !== 'text' && (
        <StyledArrowCircle>
          <StyledBackIcon size={spacing(5)} />
        </StyledArrowCircle>
      )}
      {label && (
        <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].accentPrimary}>
          {label}
        </Typography>
      )}
    </ControlContainer>
  );
};
