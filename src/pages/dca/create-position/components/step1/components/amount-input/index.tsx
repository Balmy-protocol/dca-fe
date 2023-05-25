import TokenInput from '@common/components/token-input';
import styled from 'styled-components';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCreatePositionState } from '@state/create-position/hooks';
import TokenButton from '@pages/dca/create-position/components/token-button';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { Token } from '@types';

export const StyledRateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const StyledFundWith = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type Props = {
  cantFund: boolean | null;
  balance?: BigNumber;
  fromValueUsdPrice: number;
  handleFromValueChange: (newFromValue: string) => void;
  startSelectingCoin: (token: Token, multiChain?: boolean) => void;
};

const AmountInput = ({ cantFund, balance, fromValueUsdPrice, handleFromValueChange, startSelectingCoin }: Props) => {
  const { fromValue, from, fundWith } = useCreatePositionState();

  return (
    <StyledRateContainer>
      <StyledFundWith>
        <Typography variant="body1">
          <FormattedMessage description="howMuchToSell" defaultMessage="Fund with:" />
        </Typography>
        <TokenButton
          token={fundWith || from}
          showChain={!!fundWith && fundWith.chainId !== from?.chainId}
          onClick={() => startSelectingCoin(emptyTokenWithAddress('from'), true)}
        />
      </StyledFundWith>
      <Typography variant="body1">
        <FormattedMessage
          description="howMuchToSell"
          defaultMessage="How much {from} do you want to invest?"
          values={{ from: (fundWith || from)?.symbol || '' }}
        />
      </Typography>
      <TokenInput
        id="from-value"
        error={cantFund ? 'Amount cannot exceed balance' : ''}
        value={fromValue}
        onChange={handleFromValueChange}
        withBalance={!!balance}
        balance={balance}
        token={fundWith || from}
        withMax
        withHalf
        fullWidth
        usdValue={fromValueUsdPrice.toFixed(2)}
        showChain={!!fundWith && fundWith.chainId !== from?.chainId}
      />
    </StyledRateContainer>
  );
};

export default AmountInput;
