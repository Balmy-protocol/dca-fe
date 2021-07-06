import * as React from 'react';
import Card from '@material-ui/core/Card';
import { formatUnits } from '@ethersproject/units';
import CardContent from '@material-ui/core/CardContent';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import { Position } from 'types';

const StyledCard = styled(Card)`
  margin: 10px;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 0px;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
`;

const PastPosition = ({ from, to, swapInterval, swapped, totalDeposits, remainingSwaps, withdrawn, id }: Position) => (
  <StyledCard>
    <StyledCardContent>
      <StyledCardHeader>
        <StyledCardTitleHeader>
          <Typography variant="h6">{from.symbol}</Typography>
          <ArrowForwardIcon />
          <Typography variant="h6">{to.symbol}</Typography>
        </StyledCardTitleHeader>
      </StyledCardHeader>
      <Typography variant="subtitle1">
        <FormattedMessage
          description="current exercised"
          defaultMessage="{exercised} {to} swapped"
          values={{ exercised: formatUnits(swapped, to.decimals), to: to.symbol }}
        />
      </Typography>
      <Typography variant="subtitle2">
        <FormattedMessage
          description="current deposited"
          defaultMessage="{totalDeposits} {from} deposited"
          values={{ totalDeposits: formatUnits(totalDeposits, from.decimals), from: from.symbol }}
        />
      </Typography>
      <Typography variant="body2" component="p">
        <FormattedMessage
          description="ran for"
          defaultMessage="Ran for {remainingDays} {type}"
          values={{
            remainingDays: remainingSwaps.toString(),
            type: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS],
          }}
        />
      </Typography>
    </StyledCardContent>
  </StyledCard>
);
export default PastPosition;
