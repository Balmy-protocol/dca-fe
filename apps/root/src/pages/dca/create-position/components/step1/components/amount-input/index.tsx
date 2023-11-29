import TokenInput from '@common/components/token-input';
import styled from 'styled-components';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'ui-library';
import { BigNumber } from 'ethers';
import { useCreatePositionState } from '@state/create-position/hooks';
import useAutoFetchTokenBalance from '@hooks/useAutoFetchTokenBalance';
import useActiveWallet from '@hooks/useActiveWallet';

export const StyledRateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

type Props = {
  cantFund: boolean | null;
  balance?: BigNumber;
  fromValueUsdPrice: number;
  handleFromValueChange: (newFromValue: string) => void;
};

const AmountInput = ({ cantFund, balance, fromValueUsdPrice, handleFromValueChange }: Props) => {
  const activeWallet = useActiveWallet();
  const { fromValue, from } = useCreatePositionState();

  useAutoFetchTokenBalance({ token: from, walletAddress: activeWallet?.address });

  return (
    <StyledRateContainer>
      <Typography variant="body1">
        <FormattedMessage
          description="howMuchToSell"
          defaultMessage="How much {from} do you want to invest?"
          values={{ from: from?.symbol || '' }}
        />
      </Typography>
      <TokenInput
        id="from-value"
        error={cantFund ? 'Amount cannot exceed balance' : ''}
        value={fromValue}
        onChange={handleFromValueChange}
        withBalance={!!balance}
        balance={balance}
        token={from}
        withMax
        withHalf
        fullWidth
        usdValue={fromValueUsdPrice.toFixed(2)}
      />
    </StyledRateContainer>
  );
};

export default AmountInput;
