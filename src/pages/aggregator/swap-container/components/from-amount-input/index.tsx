import styled from 'styled-components';
import React from 'react';
import isUndefined from 'lodash/isUndefined';
import Button from '@common/components/button';
import FormHelperText from '@mui/material/FormHelperText';
import useAccount from '@hooks/useAccount';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { Token } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import { getMaxDeduction, getMinAmountForMaxDeduction } from '@constants';
import { formatUnits } from '@ethersproject/units';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useAppDispatch } from '@state/hooks';
import { setFromValue } from '@state/aggregator/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import AggregatorTokenInput from '../aggregator-token-button';

const StyledFormHelperText = styled(FormHelperText)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledButton = styled(Button)`
  padding: 0;
  min-width: 10px;
`;

const StyledTokensContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTokenInputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: stretch;
`;

type Props = {
  cantFund: boolean | null;
  balance?: BigNumber;
  fromValue: string;
  isLoadingRoute: boolean;
  isLoadingFromPrice: boolean;
  fromPrice?: number;
  startSelectingCoin: (newToken: Token) => void;
  isBuyOrder: boolean;
};

const FromAmountInput = ({
  cantFund,
  balance,
  fromValue,
  isLoadingRoute,
  isLoadingFromPrice,
  fromPrice,
  startSelectingCoin,
  isBuyOrder,
}: Props) => {
  const { from } = useAggregatorState();
  const account = useAccount();
  const selectedNetwork = useSelectedNetwork();
  const currentNetwork = useCurrentNetwork();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  const onSetFromValue = (newFromValue: string) => {
    if (!from) return;
    dispatch(setFromValue({ value: newFromValue, updateMode: true }));
    if (isBuyOrder) {
      trackEvent('Aggregator - Set sell order');
    }
  };

  const onSetMaxBalance = () => {
    if (balance && from) {
      if (from.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue = balance.gte(getMinAmountForMaxDeduction(currentNetwork.chainId))
          ? balance.sub(getMaxDeduction(currentNetwork.chainId))
          : balance;
        onSetFromValue(formatUnits(maxValue, from.decimals));
      } else {
        onSetFromValue(formatUnits(balance, from.decimals));
      }
    }
  };

  return (
    <StyledTokensContainer>
      <StyledTitleContainer>
        <Typography variant="body1">
          <FormattedMessage description="youPay" defaultMessage="You pay" />
        </Typography>
        {balance && from && currentNetwork.chainId === selectedNetwork.chainId && (
          <StyledFormHelperText onClick={onSetMaxBalance}>
            <FormattedMessage
              description="in wallet"
              defaultMessage="Balance: {balance}"
              values={{
                balance: formatCurrencyAmount(balance, from, 4),
              }}
            />
            <StyledButton onClick={onSetMaxBalance} disabled={isLoadingRoute} color="secondary" variant="text">
              <FormattedMessage description="maxWallet" defaultMessage="MAX" />
            </StyledButton>
          </StyledFormHelperText>
        )}
      </StyledTitleContainer>
      <StyledTokenInputContainer>
        <AggregatorTokenInput
          id="from-value"
          error={cantFund && account ? 'Amount cannot exceed balance' : ''}
          value={fromValue}
          disabled={isLoadingRoute}
          onChange={onSetFromValue}
          token={from}
          fullWidth
          isLoadingPrice={isLoadingFromPrice}
          usdValue={(!isUndefined(fromPrice) && parseFloat(fromPrice.toFixed(2)).toFixed(2)) || undefined}
          onTokenSelect={() => startSelectingCoin(from || emptyTokenWithAddress('from'))}
        />
      </StyledTokenInputContainer>
    </StyledTokensContainer>
  );
};

export default FromAmountInput;
