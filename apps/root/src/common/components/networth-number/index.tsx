import React from 'react';
import styled from 'styled-components';
import useCountingAnimation from '@hooks/useCountingAnimation';
import { ContainerBox, Skeleton, Typography, TypographyProps, colors } from 'ui-library';

const StyledNetWorth = styled(Typography).attrs({ fontWeight: 700 })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo1};
  `}
`;

const StyledNetWorthDecimals = styled.div`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};
  `}
`;

interface NetWorthNumberProps {
  value: number;
  withAnimation?: boolean;
  isLoading?: boolean;
  variant: TypographyProps['variant'];
}

const NetWorthNumber = ({ value, withAnimation, isLoading, variant }: NetWorthNumberProps) => {
  const animatedNetWorth = useCountingAnimation(value);
  const networthToUse = withAnimation ? animatedNetWorth : value;
  const [totalInteger, totalDecimal] = networthToUse.toFixed(2).split('.');

  return (
    <StyledNetWorth variant={variant}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" />
      ) : (
        <ContainerBox>
          ${totalInteger}
          <StyledNetWorthDecimals>.{totalDecimal}</StyledNetWorthDecimals>
        </ContainerBox>
      )}
    </StyledNetWorth>
  );
};

export default NetWorthNumber;
