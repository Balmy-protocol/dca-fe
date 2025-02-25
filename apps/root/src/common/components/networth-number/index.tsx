import React from 'react';
import styled from 'styled-components';
import useCountingAnimation from '@hooks/useCountingAnimation';
import { ContainerBox, HiddenNumber, Skeleton, Typography, TypographyProps, colors, ButtonProps } from 'ui-library';
import { useIntl } from 'react-intl';
import { emptyTokenWithDecimals, formatCurrencyAmount, getDecimalSeparator } from '@common/utils/currency';
import { useShowBalances } from '@state/config/hooks';
import isUndefined from 'lodash/isUndefined';

type ColorVariant = keyof (typeof colors)[keyof typeof colors]['typography'];

const StyledNetWorth = styled(Typography)<{ $colorVariant?: ColorVariant; $fontWeight?: number }>`
  ${({ theme: { palette }, $colorVariant, $fontWeight }) => `
    font-weight: ${$fontWeight || 700};
    color: ${colors[palette.mode].typography[$colorVariant || 'typo2']};
  `}
`;

const StyledNetWorthDecimals = styled.div<{ $colorVariant?: ColorVariant }>`
  ${({ theme: { palette }, $colorVariant }) =>
    $colorVariant &&
    `
    color: ${colors[palette.mode].typography[$colorVariant]};
  `}
`;

export interface NetWorthNumberProps {
  value: number;
  withAnimation?: boolean;
  isLoading?: boolean;
  variant: TypographyProps['variant'];
  size?: ButtonProps['size'];
  isFiat?: boolean;
  colorVariant?: ColorVariant;
  disableHiddenNumber?: boolean;
  fontWeight?: number;
}

const NetWorthNumber = ({
  value,
  withAnimation,
  isLoading,
  variant,
  size,
  isFiat = true,
  colorVariant, // Overrides all colors
  disableHiddenNumber = false,
  fontWeight,
}: NetWorthNumberProps) => {
  const animatedNetWorth = useCountingAnimation(value);
  const networthToUse = withAnimation ? animatedNetWorth : value;
  const intl = useIntl();
  const showBalance = useShowBalances();

  const baseNumber = isNaN(networthToUse) ? 0 : networthToUse;
  const fixedWorth = isFiat ? baseNumber.toFixed(2) : baseNumber.toString();
  const [totalInteger, totalDecimal] = fixedWorth.split('.');

  return (
    <StyledNetWorth variant={variant} $colorVariant={colorVariant} $fontWeight={fontWeight}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" width="6ch" />
      ) : (
        <ContainerBox>
          {showBalance || disableHiddenNumber ? (
            <>
              {isFiat && '$'}
              {formatCurrencyAmount({ amount: BigInt(totalInteger || 0), token: emptyTokenWithDecimals(0), intl })}
              {totalDecimal !== '' && !isUndefined(totalDecimal) && (
                <StyledNetWorthDecimals $colorVariant={colorVariant || (isFiat ? 'typo4' : undefined)}>
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
