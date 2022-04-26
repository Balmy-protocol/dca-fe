import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from 'common/button';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { Position, Token } from 'types';
import { getFrequencyLabel } from 'utils/parsing';
import ArrowRight from 'assets/svg/atom/arrow-right';
import { useHistory } from 'react-router-dom';
import { formatCurrencyAmount } from 'utils/currency';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
  flex-grow: 1;
  display: flex;
`;

const StyledCardHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex-wrap: wrap;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledDetailWrapper = styled.div`
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const StyledFreqLeft = styled.div`
  ${({ theme }) => `
    padding: 10px 13px;
    border-radius: 15px;
    text-align: center;
    border: 1px solid ${theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
  `}
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledCallToActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const StyledCardFooterButton = styled(Button)`
  margin-top: 8px;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
}

const ActivePosition = ({ position }: ActivePositionProps) => {
  const { from, to, swapInterval, swapped, totalDeposits, totalSwaps, remainingSwaps, executedSwaps } = position;
  const history = useHistory();

  const onViewDetails = () => {
    history.push(`/positions/${position.id}`);
  };
  return (
    <StyledCard variant="outlined">
      <StyledCardContent>
        <Grid container>
          <Grid item xs={12} sm={9} md={10}>
            <StyledContentContainer>
              <StyledCardHeader>
                <StyledCardTitleHeader>
                  <TokenIcon token={from} size="16px" />
                  <Typography variant="body1">{from.symbol}</Typography>
                  <ArrowRight size="20px" />
                  <TokenIcon token={to} size="16px" />
                  <Typography variant="body1">{to.symbol}</Typography>
                </StyledCardTitleHeader>
                <StyledFreqLeft>
                  <Typography variant="body2">
                    <FormattedMessage
                      description="days to finish"
                      defaultMessage="Ran for {type}"
                      values={{
                        remainingDays: totalSwaps.sub(remainingSwaps).toString(),
                        type: getFrequencyLabel(swapInterval.toString(), executedSwaps.toString()),
                      }}
                    />
                  </Typography>
                </StyledFreqLeft>
              </StyledCardHeader>
              <StyledDetailWrapper>
                <Typography variant="body2">
                  <FormattedMessage
                    description="current exercised"
                    defaultMessage="<b>{exercised}</b> {to} swapped"
                    values={{
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                      exercised: formatCurrencyAmount(swapped, to),
                      to: to.symbol,
                    }}
                  />
                </Typography>
              </StyledDetailWrapper>
              <StyledDetailWrapper>
                <Typography variant="body2">
                  <FormattedMessage
                    description="current deposited"
                    defaultMessage="<b>{remainingLiquidity} {from}</b> deposited"
                    values={{
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                      remainingLiquidity: formatCurrencyAmount(totalDeposits, from),
                      from: from.symbol,
                    }}
                  />
                </Typography>
              </StyledDetailWrapper>
            </StyledContentContainer>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <StyledCallToActionContainer>
              <StyledCardFooterButton variant="contained" color="secondary" onClick={onViewDetails} fullWidth>
                <Typography variant="body2">
                  <FormattedMessage description="View details" defaultMessage="View details" />
                </Typography>
              </StyledCardFooterButton>
            </StyledCallToActionContainer>
          </Grid>
        </Grid>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
