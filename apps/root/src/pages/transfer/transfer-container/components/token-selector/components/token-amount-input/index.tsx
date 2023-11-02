import styled from 'styled-components';
import React from 'react';
import isUndefined from 'lodash/isUndefined';
import Button from '@common/components/button';
import useAccount from '@hooks/useAccount';
import { Typography, FormHelperText } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { Token } from '@types';
import { getMaxDeduction, getMinAmountForMaxDeduction } from '@constants';
import { formatUnits } from '@ethersproject/units';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import AggregatorTokenInput from '../token-button';
import { useAppDispatch } from '@hooks/state';
import { setAmount } from '@state/transfer/actions';

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

type TokenAmountInputProps = {
  cantFund: boolean | null;
  balance?: BigNumber;
  fromValue: string;
  isLoadingFromPrice: boolean;
  fromPrice?: number;
  selectedToken: Token | null;
  startSelectingCoin: (newToken: Token) => void;
};

const TokenAmountInput = ({
  cantFund,
  balance,
  fromValue,
  isLoadingFromPrice,
  fromPrice,
  selectedToken,
  startSelectingCoin,
}: TokenAmountInputProps) => {
  const dispatch = useAppDispatch();
  const account = useAccount();
  const currentNetwork = useCurrentNetwork();

  const onSetAmount = (newAmount: string) => {
    if (!selectedToken) return;
    dispatch(setAmount(newAmount));
  };

  const onSetMaxBalance = () => {
    if (balance && selectedToken) {
      if (selectedToken.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue = balance.gte(getMinAmountForMaxDeduction(currentNetwork.chainId))
          ? balance.sub(getMaxDeduction(currentNetwork.chainId))
          : balance;
        onSetAmount(formatUnits(maxValue, selectedToken.decimals));
      } else {
        onSetAmount(formatUnits(balance, selectedToken.decimals));
      }
    }
  };

  return (
    <StyledTokensContainer>
      <StyledTitleContainer>
        <Typography variant="body1">
          <FormattedMessage description="tokenToTransfer" defaultMessage="Token to transfer:" />
        </Typography>
        {balance && selectedToken && (
          <StyledFormHelperText onClick={onSetMaxBalance}>
            <FormattedMessage
              description="in wallet"
              defaultMessage="Balance: {balance}"
              values={{
                balance: formatCurrencyAmount(balance, selectedToken, 4),
              }}
            />
            <StyledButton onClick={onSetMaxBalance} color="secondary" variant="text">
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
          onChange={onSetAmount}
          token={selectedToken}
          fullWidth
          isLoadingPrice={isLoadingFromPrice}
          usdValue={(!isUndefined(fromPrice) && parseFloat(fromPrice.toFixed(2)).toFixed(2)) || undefined}
          onTokenSelect={() => startSelectingCoin(selectedToken || emptyTokenWithAddress('token'))}
        />
      </StyledTokenInputContainer>
    </StyledTokensContainer>
  );
};

export default TokenAmountInput;
