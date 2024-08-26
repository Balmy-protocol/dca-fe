import React from 'react';
import styled from 'styled-components';
import useCountingAnimation from '@hooks/useCountingAnimation';
import { ContainerBox, HiddenNumber, Skeleton, Typography, TypographyProps, colors, ButtonProps } from 'ui-library';
import { useIntl } from 'react-intl';
import { formatUsdAmount, getDecimalSeparator } from '@common/utils/currency';
import { useShowBalances } from '@state/config/hooks';
import isUndefined from 'lodash/isUndefined';

const StyledNetWorth = styled(Typography).attrs({ fontWeight: 700 })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

const StyledNetWorthDecimals = styled.div<{ $lightDecimals?: boolean }>`
  ${({ theme: { palette }, $lightDecimals }) =>
    $lightDecimals &&
    `
    color: ${colors[palette.mode].typography.typo4};
  `}
`;

interface NetWorthNumberProps {
  value: number;
  withAnimation?: boolean;
  isLoading?: boolean;
  variant: TypographyProps['variant'];
  size?: ButtonProps['size'];
  isFiat?: boolean;
}

const NetWorthNumber = ({ value, withAnimation, isLoading, variant, size, isFiat = true }: NetWorthNumberProps) => {
  const animatedNetWorth = useCountingAnimation(value);
  const networthToUse = withAnimation ? animatedNetWorth : value;
  const intl = useIntl();
  const showBalance = useShowBalances();

  const baseNumber = isNaN(networthToUse) ? 0 : networthToUse;
  const fixedWorth = isFiat ? baseNumber.toFixed(2) : baseNumber.toString();
  const [totalInteger, totalDecimal] = fixedWorth.split('.');

  return (
    <StyledNetWorth variant={variant}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" />
      ) : (
        <ContainerBox>
          {showBalance ? (
            <>
              {isFiat && '$'}
              {formatUsdAmount({ amount: totalInteger || 0, intl })}
              {totalDecimal !== '' && !isUndefined(totalDecimal) && (
                <StyledNetWorthDecimals $lightDecimals={isFiat}>
                  {getDecimalSeparator(intl)}
                  {totalDecimal}
                </StyledNetWorthDecimals>
              )}
            </>
          ) : (
            <HiddenNumber size={size} />
          )}
        </ContainerBox>
      )}
    </StyledNetWorth>
  );
};

export default NetWorthNumber;
