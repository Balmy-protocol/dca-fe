import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from 'common/button';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { Position, Token } from 'types';
import Chip from '@mui/material/Chip';
import { getFrequencyLabel } from 'utils/parsing';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useHistory } from 'react-router-dom';
import { formatCurrencyAmount } from 'utils/currency';
import { POSITION_VERSION_3, STABLE_COINS } from 'config/constants';
import { BigNumber } from 'ethers';
import useUsdPrice from 'hooks/useUsdPrice';

const StyledChip = styled(Chip)`
  margin: 0px 5px;
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
`;

const StyledCardContent = styled(CardContent)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const StyledCardHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex-wrap: wrap;
`;

const StyledArrowRightContainer = styled.div`
  margin: 0 5px !important;
  font-size: 35px;
  display: flex;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  flex-grow: 1;
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

const StyledProgressWrapper = styled.div`
  margin: 12px 0px;
`;

const StyledCardFooterButton = styled(Button)`
  margin-top: 8px;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
}

const ActivePosition = ({ position }: ActivePositionProps) => {
  const { from, to, swapInterval, swapped, totalDeposits, executedSwaps } = position;
  const history = useHistory();
  const [toPrice, isLoadingToPrice] = useUsdPrice(to, swapped);
  const showToPrice = !STABLE_COINS.includes(to.symbol) && !isLoadingToPrice && !!toPrice;

  const onViewDetails = () => {
    history.push(`/positions/${position.id}`);
  };
  return (
    <StyledCard variant="outlined">
      <StyledCardContent>
        <StyledContentContainer>
          <StyledCardHeader>
            <StyledCardTitleHeader>
              <TokenIcon token={from} size="27px" />
              <Typography variant="body1">{from.symbol}</Typography>
              <StyledArrowRightContainer>
                <ArrowRightAltIcon fontSize="inherit" />
              </StyledArrowRightContainer>
              <TokenIcon token={to} size="27px" />
              <Typography variant="body1">{to.symbol}</Typography>
            </StyledCardTitleHeader>
          </StyledCardHeader>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="history deposited" defaultMessage="Deposited:" />
            </Typography>
            <Typography
              variant="body1"
              color={totalDeposits.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
              sx={{ marginLeft: '5px' }}
            >
              <FormattedMessage
                description="history full deposited"
                defaultMessage="{totalDepositted} {from}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  totalDepositted: formatCurrencyAmount(totalDeposits, from, 4),
                  from: from.symbol,
                }}
              />
            </Typography>
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="history run for in position" defaultMessage="Run for: " />
            </Typography>
            <Typography variant="body1" color="#FFFFFF" sx={{ marginLeft: '5px' }}>
              {getFrequencyLabel(swapInterval.toString(), executedSwaps.toString())}
            </Typography>
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="history swapped in position" defaultMessage="Swapped: " />
            </Typography>
            <Typography
              variant="body1"
              color={swapped.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
              sx={{ marginLeft: '5px' }}
            >
              {`${formatCurrencyAmount(swapped, to, 4)} ${to.symbol}`}
            </Typography>
            <Typography variant="body1">
              {showToPrice && (
                <StyledChip
                  size="small"
                  variant="outlined"
                  label={
                    <FormattedMessage
                      description="current swapped in position price"
                      defaultMessage="({toPrice} USD)"
                      values={{
                        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                        toPrice: toPrice?.toFixed(2),
                      }}
                    />
                  }
                />
              )}
            </Typography>
          </StyledDetailWrapper>
        </StyledContentContainer>
        <StyledProgressWrapper />
        <StyledCallToActionContainer>
          {position.version === POSITION_VERSION_3 && (
            <StyledCardFooterButton variant="outlined" color="pending" onClick={onViewDetails} fullWidth>
              <Typography variant="body2">
                <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
              </Typography>
            </StyledCardFooterButton>
          )}
        </StyledCallToActionContainer>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
