import React from 'react';
import styled from 'styled-components';
import useCountingAnimation from '@hooks/useCountingAnimation';
import { ContainerBox, Skeleton, Typography, TypographyProps, colors } from 'ui-library';
import { useIntl } from 'react-intl';
import { formatUsdAmount, getDecimalSeparator } from '@common/utils/currency';

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
  fixNumber?: boolean;
}

const NetWorthNumber = ({ value, withAnimation, isLoading, variant, fixNumber = true }: NetWorthNumberProps) => {
  const animatedNetWorth = useCountingAnimation(value);
  const networthToUse = withAnimation ? animatedNetWorth : value;
  const intl = useIntl();

  const baseNumber = isNaN(networthToUse) ? 0 : networthToUse;
  const fixedWorth = fixNumber ? baseNumber.toFixed(2) : baseNumber.toString();
  const [totalInteger, totalDecimal] = fixedWorth.split('.');

  return (
    <StyledNetWorth variant={variant}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" />
      ) : (
        <ContainerBox>
          {formatUsdAmount({ amount: totalInteger || 0, intl })}
          <StyledNetWorthDecimals>
            {getDecimalSeparator(intl)}
            {totalDecimal}
          </StyledNetWorthDecimals>
        </ContainerBox>
      )}
    </StyledNetWorth>
  );
};

export default NetWorthNumber;
