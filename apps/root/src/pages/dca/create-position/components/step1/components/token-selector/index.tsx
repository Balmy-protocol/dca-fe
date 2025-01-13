import React from 'react';
import { AmountsOfToken, Token } from 'types';
import styled from 'styled-components';
import {
  Typography,
  IconButton,
  colors,
  BackgroundPaper,
  ContainerBox,
  ToggleHorizontalArrowIcon,
  TokenPickerButton,
  EmptyWalletIcon,
  Skeleton,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import { emptyTokenWithAddress, formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { useCreatePositionState } from '@state/create-position/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useAnalytics from '@hooks/useAnalytics';
import { useAppDispatch } from '@state/hooks';
import { setTo, setFromValue, setFrom } from '@state/create-position/actions';
import useReplaceHistory from '@hooks/useReplaceHistory';
import TokenIcon from '@common/components/token-icon';
import { useThemeMode } from '@state/config/hooks';
import isUndefined from 'lodash/isUndefined';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { space } }) => `
    display: flex;
    align-items: flex-start;
    justify-content: space-evenly;
    padding: ${space.s05};
  `}
`;

const StyledToggleTokenButton = styled(IconButton)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    border: 1px solid ${colors[mode].border.border1};
    background: ${colors[mode].background.secondary};
    box-shadow: ${colors[mode].dropShadow.dropShadow100};
    color: ${colors[mode].accentPrimary};
  `}
`;

type Props = {
  startSelectingCoin: (token: Token) => void;
  fromBalance?: AmountsOfToken;
  isLoadingFromBalance?: boolean;
};

const TokenSelector = ({ startSelectingCoin, fromBalance, isLoadingFromBalance }: Props) => {
  const { from, to, fromValue } = useCreatePositionState();
  const selectedNetwork = useSelectedNetwork();
  const { trackEvent } = useAnalytics();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const mode = useThemeMode();
  const intl = useIntl();

  const toggleFromTo = () => {
    dispatch(setTo(from));

    // check for decimals
    if (to && from && to.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, to.decimals)}`;
      }

      dispatch(setFromValue(newFromValue));
    }
    dispatch(setFrom(to));

    if (to) {
      replaceHistory(`/invest/create/${selectedNetwork.chainId}/${to.address || ''}/${from?.address || ''}`);
    }
    trackEvent('DCA - Toggle from/to', { fromAddress: from?.address, toAddress: to?.address });
  };

  const fromWithIcon =
    (from && {
      ...from,
      icon: <TokenIcon token={from} />,
    }) ||
    undefined;
  const toWithIcon =
    (to && {
      ...to,
      icon: <TokenIcon token={to} />,
    }) ||
    undefined;
  return (
    <StyledBackgroundPaper variant="outlined">
      <ContainerBox flexDirection="column" gap={2} alignItems="flex-start" alignSelf="flex-start">
        <Typography variant="labelRegular">
          <FormattedMessage description="sell" defaultMessage="You sell" />
        </Typography>
        <TokenPickerButton
          token={fromWithIcon}
          showAction
          onClick={() => startSelectingCoin(from || emptyTokenWithAddress('from'))}
        />
        {!isUndefined(fromBalance) && from && (
          <ContainerBox alignItems="center" gap={1}>
            <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
              <EmptyWalletIcon />
            </Typography>
            <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
              {isLoadingFromBalance ? (
                <Skeleton variant="text" sx={{ minWidth: '10ch' }} />
              ) : (
                <>
                  {formatCurrencyAmount({ amount: fromBalance.amount, token: from, intl })}
                  {fromBalance.amountInUSD && ` / ≈$${formatUsdAmount({ amount: fromBalance.amountInUSD, intl })}`}
                </>
              )}
            </Typography>
          </ContainerBox>
        )}
      </ContainerBox>
      <ContainerBox alignSelf="center">
        <StyledToggleTokenButton onClick={toggleFromTo}>
          <ToggleHorizontalArrowIcon color="inherit" />
        </StyledToggleTokenButton>
      </ContainerBox>
      <ContainerBox flexDirection="column" gap={2} alignItems="flex-start" alignSelf="flex-start">
        <Typography variant="labelRegular">
          <FormattedMessage description="receive" defaultMessage="You receive" />
        </Typography>
        <TokenPickerButton
          token={toWithIcon}
          showAction
          onClick={() => startSelectingCoin(to || emptyTokenWithAddress('to'))}
        />
      </ContainerBox>
    </StyledBackgroundPaper>
  );
};

export default TokenSelector;
