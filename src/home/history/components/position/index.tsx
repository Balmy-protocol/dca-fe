import * as React from 'react';
import { formatUnits } from '@ethersproject/units';
import find from 'lodash/find';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { Position, Token } from 'types';
import { getFrequencyLabel, STRING_SWAP_INTERVALS } from 'utils/parsing';
import ArrowRight from 'assets/svg/atom/arrow-right';
import { formatCurrencyAmount } from 'utils/currency';
import { BigNumber } from 'ethers';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledDetailWrapper = styled.div`
  margin-bottom: 5px;
`;

const StyledCardFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const StyledFreqLeft = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #dceff9;
  color: #0088cc;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
}

const ActivePosition = ({ position }: ActivePositionProps) => {
  const { from, to, swapInterval, swapped, totalDeposits, totalSwaps, remainingSwaps } = position;

  return (
    <StyledCard>
      <StyledCardContent>
        <StyledCardHeader>
          <StyledCardTitleHeader>
            <TokenIcon token={from} size="16px" />
            <Typography variant="body1">{from.symbol}</Typography>
            <ArrowRight size="20px" />
            <TokenIcon token={to} size="16px" />
            <Typography variant="body1">{to.symbol}</Typography>
          </StyledCardTitleHeader>
        </StyledCardHeader>
        <StyledDetailWrapper>
          <Typography variant="body2">
            <FormattedMessage
              description="current exercised"
              defaultMessage="{exercised} {to} swapped"
              values={{ exercised: formatCurrencyAmount(swapped, to), to: to.symbol }}
            />
          </Typography>
        </StyledDetailWrapper>
        <StyledDetailWrapper>
          <Typography variant="body2">
            <FormattedMessage
              description="current deposited"
              defaultMessage="{remainingLiquidity} {from} deposited"
              values={{ remainingLiquidity: formatCurrencyAmount(totalDeposits, from), from: from.symbol }}
            />
          </Typography>
        </StyledDetailWrapper>
        <StyledCardFooter>
          <StyledFreqLeft>
            <Typography variant="body2">
              <FormattedMessage
                description="days to finish"
                defaultMessage="Ran for {remainingDays} {type}"
                values={{
                  remainingDays: totalSwaps.sub(remainingSwaps).toString(),
                  type: getFrequencyLabel(swapInterval.toString(), totalSwaps.toString()),
                }}
              />
            </Typography>
          </StyledFreqLeft>
        </StyledCardFooter>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
