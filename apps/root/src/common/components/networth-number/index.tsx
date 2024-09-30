import React from 'react';
import styled from 'styled-components';
import useCountingAnimation from '@hooks/useCountingAnimation';
import { ContainerBox, HiddenNumber, Skeleton, Typography, TypographyProps, colors, ButtonProps } from 'ui-library';
import { useIntl } from 'react-intl';
import { formatUsdAmount, getDecimalSeparator } from '@common/utils/currency';
import { useShowBalances } from '@state/config/hooks';
import isUndefined from 'lodash/isUndefined';

type ColorVariant = keyof (typeof colors)[keyof typeof colors]['typography'];

const StyledNetWorth = styled(Typography).attrs({ fontWeight: 700 })<{ $colorVariant?: ColorVariant }>`
  ${({ theme: { palette }, $colorVariant }) => `
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

interface NetWorthNumberProps {
  value: number;
  withAnimation?: boolean;
  isLoading?: boolean;
  variant: TypographyProps['variant'];
  size?: ButtonProps['size'];
  isFiat?: boolean;
  colorVariant?: ColorVariant;
}

const NetWorthNumber = ({
  value,
  withAnimation,
  isLoading,
  variant,
  size,
  isFiat = true,
  colorVariant, // Overrides all colors
}: NetWorthNumberProps) => {
  const animatedNetWorth = useCountingAnimation(value);
  const networthToUse = withAnimation ? animatedNetWorth : value;
  const intl = useIntl();
  const showBalance = useShowBalances();

  const baseNumber = isNaN(networthToUse) ? 0 : networthToUse;
  const fixedWorth = isFiat ? baseNumber.toFixed(2) : baseNumber.toString();
  const [totalInteger, totalDecimal] = fixedWorth.split('.');

  return (
    <StyledNetWorth variant={variant} $colorVariant={colorVariant}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" />
      ) : (
        <ContainerBox>
          {showBalance ? (
            <>
              {isFiat && '$'}
              {formatUsdAmount({ amount: totalInteger || 0, intl })}
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
