import styled from 'styled-components';
import React from 'react';
import isUndefined from 'lodash/isUndefined';
import Button from '@common/components/button';
import TokenAmountInput from '@common/components/token-picker-with-amount/components/token-amount-input';
import useAccount from '@hooks/useAccount';
import { Typography, FormHelperText } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { Token } from '@types';
import { getMaxDeduction, getMinAmountForMaxDeduction } from '@constants';
import { formatUnits } from '@ethersproject/units';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

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

type TokenPickerWithAmountProps = {
  id: string;
  label: React.ReactNode;
  cantFund?: boolean;
  balance?: BigNumber;
  tokenAmount: string;
  isLoadingRoute?: boolean;
  isLoadingPrice?: boolean;
  tokenPrice?: number;
  selectedToken: Token | null;
  startSelectingCoin: (newToken: Token) => void;
  onSetTokenAmount: (newAmount: string) => void;
  maxBalanceBtn?: boolean;
  currentChainId?: number;
  priceImpact?: string | boolean;
};

const TokenPickerWithAmount = ({
  id,
  label,
  cantFund,
  balance,
  tokenAmount,
  isLoadingRoute,
  isLoadingPrice,
  tokenPrice,
  selectedToken,
  onSetTokenAmount,
  startSelectingCoin,
  maxBalanceBtn,
  currentChainId,
  priceImpact,
}: TokenPickerWithAmountProps) => {
  const account = useAccount();

  const onSetMaxBalance = () => {
    if (balance && selectedToken && currentChainId) {
      if (selectedToken.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue = balance.gte(getMinAmountForMaxDeduction(currentChainId))
          ? balance.sub(getMaxDeduction(currentChainId))
          : balance;
        onSetTokenAmount(formatUnits(maxValue, selectedToken.decimals));
      } else {
        onSetTokenAmount(formatUnits(balance, selectedToken.decimals));
      }
    }
  };

  return (
    <StyledTokensContainer>
      <StyledTitleContainer>
        <Typography variant="body1">{label}</Typography>
        {maxBalanceBtn && balance && selectedToken && (
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
        <TokenAmountInput
          id={id}
          error={cantFund && account ? 'Amount cannot exceed balance' : ''}
          value={tokenAmount}
          onChange={onSetTokenAmount}
          token={selectedToken}
          fullWidth
          isLoadingPrice={isLoadingPrice}
          usdValue={(!isUndefined(tokenPrice) && parseFloat(tokenPrice.toFixed(2)).toFixed(2)) || undefined}
          onTokenSelect={() => startSelectingCoin(selectedToken || emptyTokenWithAddress('token'))}
          impact={priceImpact}
          disabled={isLoadingRoute}
        />
      </StyledTokenInputContainer>
    </StyledTokensContainer>
  );
};

export default TokenPickerWithAmount;
