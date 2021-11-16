import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { FullPosition, GetPairSwapsData } from 'types';
import { calculateStale, getFrequencyLabel } from 'utils/parsing';
import { BigNumber } from 'ethers';
import useIsStale, { STALE } from 'hooks/useIsStale';

const PositionStatusContainer = styled.div`
  display: flex;
  align-self: flex-start;
`;

const StyledFreqLeft = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #2cc941;
  color: #fafafa;
  margin-right: 15px;
`;

const StyledStale = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #f9f3dc;
  color: #cc6d00;
  * {
    font-weight: 600 !important;
  }
`;

const StyledNoFunds = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #f9dcdc;
  color: #f50000;
  * {
    font-weight: 600 !important;
  }
`;

interface PositionStatusProps {
  position: FullPosition;
  pair?: GetPairSwapsData;
}

const PositionStatus = ({ position, pair }: PositionStatusProps) => {
  if (!pair) return null;
  const lastExecutedAt = (pair.swaps && pair.swaps[0] && pair.swaps[0].executedAtTimestamp) || '0';
  const [calculateStale, isLoadingStale] = useIsStale(pair);

  const isStale =
    isLoadingStale &&
    calculateStale(
      parseInt(lastExecutedAt, 10) || 0,
      BigNumber.from(position.swapInterval.interval),
      parseInt(pair.createdAtTimestamp, 10) || 0
    ) === STALE;

  const hasNoFunds = BigNumber.from(position.current.remainingLiquidity).lte(BigNumber.from(0));

  const isTerminated = position.status === 'TERMINATED';
  return (
    <PositionStatusContainer>
      {isTerminated ? (
        <StyledNoFunds>
          <Typography variant="body1">
            <FormattedMessage description="terminated" defaultMessage="Terminated" />
          </Typography>
        </StyledNoFunds>
      ) : hasNoFunds ? (
        <StyledNoFunds>
          <Typography variant="body1">
            <FormattedMessage description="no funds" defaultMessage="No funds!" />
          </Typography>
        </StyledNoFunds>
      ) : isStale ? (
        <StyledStale>
          <Typography variant="body1">
            <FormattedMessage description="stale" defaultMessage="Stale" />
          </Typography>
        </StyledStale>
      ) : (
        <StyledFreqLeft>
          <Typography variant="body1">
            <FormattedMessage
              description="days to finish"
              defaultMessage="{remainingDays} {type} left"
              values={{
                remainingDays: position.current.remainingSwaps,
                type: getFrequencyLabel(position.swapInterval.interval, position.current.remainingSwaps),
              }}
            />
          </Typography>
        </StyledFreqLeft>
      )}
    </PositionStatusContainer>
  );
};

export default PositionStatus;
