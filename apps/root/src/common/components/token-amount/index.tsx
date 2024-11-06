import React from 'react';
import { useIntl } from 'react-intl';
import { Token, AmountsOfToken } from 'common-types';
import { ContainerBox, Skeleton, Typography, TypographyProps } from 'ui-library';
import TokenIcon from '../token-icon';
import {
  formatCurrencyAmount,
  formatUsdAmount,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import NetWorthNumber from '../networth-number';

const TokenAmount = ({
  token,
  amount,
  amountTypographyVariant = 'bodyBold',
  usdPriceTypographyVariant = 'labelLarge',
  amountColorVariant = 'typo2',
  subtitleColorVariant = 'typo3',
  addEqualIcon = false,
  overrideSubtitle,
  showIcon = true,
  titlePrefix,
  subtitlePrefix,
  iconSize = 8,
  isLoading = false,
  showSubtitle = true,
  maxDecimals,
  gap = 1,
  showSymbol = true,
  useNetworthNumber = false,
}: {
  token?: Token;
  amount?: AmountsOfToken;
  amountTypographyVariant?: TypographyProps['variant'];
  usdPriceTypographyVariant?: TypographyProps['variant'];
  amountColorVariant?: TypographyProps['color'];
  subtitleColorVariant?: TypographyProps['color'];
  addEqualIcon?: boolean;
  overrideSubtitle?: React.ReactNode;
  showIcon?: boolean;
  titlePrefix?: string;
  subtitlePrefix?: string;
  iconSize?: number;
  isLoading?: boolean;
  showSubtitle?: boolean;
  maxDecimals?: number;
  gap?: number;
  showSymbol?: boolean;
  useNetworthNumber?: boolean;
}) => {
  const intl = useIntl();

  if (!token || (!amount && !isLoading)) return null;

  if (isLoading) return <Skeleton variant="text" animation="wave" width="6ch" />;
  const tokenPrice = token.price;
  return (
    <ContainerBox flexDirection="column" key={token.address} gap={gap}>
      <ContainerBox gap={2} alignItems="center">
        {showIcon && (
          <Typography variant={amountTypographyVariant} sx={{ display: 'inline-flex' }}>
            <TokenIcon token={token} size={iconSize} />
          </Typography>
        )}
        <Typography variant={amountTypographyVariant} color={amountColorVariant} sx={{ display: 'inline-flex' }}>
          {titlePrefix && `${titlePrefix} `}
          {useNetworthNumber ? (
            <NetWorthNumber
              value={Number(amount?.amountInUnits)}
              isLoading={isLoading}
              withAnimation
              variant={amountTypographyVariant}
            />
          ) : (
            formatCurrencyAmount({ amount: amount?.amount, token, intl, maxDecimals })
          )}
          {showSymbol && ` ${token.symbol}`}
        </Typography>
      </ContainerBox>
      {showSubtitle && (
        <>
          {(overrideSubtitle && (
            <Typography variant={usdPriceTypographyVariant} color={subtitleColorVariant}>
              {overrideSubtitle}
            </Typography>
          )) ||
            ((tokenPrice || amount?.amountInUSD) && (
              <Typography variant={usdPriceTypographyVariant} color={subtitleColorVariant}>
                {subtitlePrefix && `${subtitlePrefix} `}
                {addEqualIcon && `≈ `}$
                {formatUsdAmount({
                  amount:
                    amount?.amountInUSD ||
                    parseUsdPrice(token, amount?.amount, parseNumberUsdPriceToBigInt(tokenPrice)),
                  intl,
                })}
              </Typography>
            ))}
        </>
      )}
    </ContainerBox>
  );
};

export default TokenAmount;
