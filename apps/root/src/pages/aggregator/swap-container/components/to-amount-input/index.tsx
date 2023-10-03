import styled from 'styled-components';
import React from 'react';
import isUndefined from 'lodash/isUndefined';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { Token } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useAppDispatch } from '@state/hooks';
import { setToValue } from '@state/aggregator/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import AggregatorTokenInput from '../aggregator-token-button';

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
  toValue: string;
  isLoadingRoute: boolean;
  isLoadingToPrice: boolean;
  toPrice?: number;
  startSelectingCoin: (newToken: Token) => void;
  isBuyOrder: boolean;
  priceImpact?: string | boolean;
};

const ToAmountInput = ({
  toValue,
  isLoadingRoute,
  isLoadingToPrice,
  toPrice,
  startSelectingCoin,
  isBuyOrder,
  priceImpact,
}: Props) => {
  const { to } = useAggregatorState();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  const onSetToValue = (newToValue: string) => {
    if (!to) return;
    dispatch(setToValue({ value: newToValue, updateMode: true }));
    if (!isBuyOrder) {
      trackEvent('Aggregator - Set buy order');
    }
  };

  return (
    <StyledTokensContainer>
      <StyledTitleContainer>
        <Typography variant="body1">
          <FormattedMessage description="youReceive" defaultMessage="You receive" />
        </Typography>
      </StyledTitleContainer>
      <StyledTokenInputContainer>
        <AggregatorTokenInput
          id="to-value"
          value={toValue}
          disabled={isLoadingRoute}
          onChange={onSetToValue}
          token={to}
          fullWidth
          isLoadingPrice={isLoadingToPrice}
          usdValue={(!isUndefined(toPrice) && parseFloat(toPrice.toFixed(2)).toFixed(2)) || undefined}
          onTokenSelect={() => startSelectingCoin(to || emptyTokenWithAddress('to'))}
          impact={priceImpact}
        />
      </StyledTokenInputContainer>
    </StyledTokensContainer>
  );
};

export default ToAmountInput;
