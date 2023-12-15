import TokenInput from '@common/components/token-input';
import styled from 'styled-components';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'ui-library';

import { useCreatePositionState } from '@state/create-position/hooks';

export const StyledRateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

type Props = {
  cantFund: boolean | null;
  balance?: bigint;
  fromValueUsdPrice: number;
  handleFromValueChange: (newFromValue: string) => void;
};

const AmountInput = ({ cantFund, balance, fromValueUsdPrice, handleFromValueChange }: Props) => {
  const { fromValue, from } = useCreatePositionState();

  return (
    <StyledRateContainer>
      <Typography variant="body">
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
