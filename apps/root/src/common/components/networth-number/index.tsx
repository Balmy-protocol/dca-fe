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
  addDolarSign?: boolean;
  size?: ButtonProps['size'];
}

const NetWorthNumber = ({
  value,
  withAnimation,
  isLoading,
  variant,
  fixNumber = true,
  addDolarSign = false,
  size,
}: NetWorthNumberProps) => {
  const animatedNetWorth = useCountingAnimation(value);
  const networthToUse = withAnimation ? animatedNetWorth : value;
  const intl = useIntl();
  const showBalance = useShowBalances();

  const baseNumber = isNaN(networthToUse) ? 0 : networthToUse;
  const fixedWorth = fixNumber ? baseNumber.toFixed(2) : baseNumber.toString();
  const [totalInteger, totalDecimal] = fixedWorth.split('.');

  return (
    <StyledNetWorth variant={variant}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" />
      ) : (
        <ContainerBox>
          {showBalance ? (
            <>
              {!!addDolarSign && '$'}
              {formatUsdAmount({ amount: totalInteger || 0, intl })}
              {totalDecimal !== '' && !isUndefined(totalDecimal) && (
                <StyledNetWorthDecimals>
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
