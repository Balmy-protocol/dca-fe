import * as React from 'react';
import find from 'lodash/find';
import Card from '@material-ui/core/Card';
import LinearProgress from '@material-ui/core/LinearProgress';
import CardContent from '@material-ui/core/CardContent';
import Button from 'common/button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { getTimeFrequencyLabel, sortTokens, calculateStale, STALE } from 'utils/parsing';
import { Position, Token } from 'types';
import { useHistory } from 'react-router-dom';
import { STRING_SWAP_INTERVALS } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRight from 'assets/svg/atom/arrow-right';
import { createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount } from 'utils/currency';
import { buildEtherscanTransaction } from 'utils/etherscan';
import CallMadeIcon from '@material-ui/icons/CallMade';
import Link from '@material-ui/core/Link';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import MigratePositionModal from 'common/migrate-position-modal';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';

const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 22,
      borderRadius: 5,
      '&::after': {
        content: (props: { swaps: number }) =>
          `"${props.swaps !== 0 ? `${props.swaps} swap${props.swaps > 1 ? 's' : ''} left` : ''}"`,
        position: 'absolute',
        top: '0',
        bottom: '0',
        right: '0',
        left: '0',
        textAlign: 'center',
      },
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#1a90ff',
    },
  })
)(LinearProgress);

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

const StyledProgressWrapper = styled.div`
  margin-top: 14px;
  margin-bottom: 21px;
`;

const StyledCardFooterButton = styled(Button)`
  margin-top: 8px;
`;

const StyledFreqLeft = styled.div`
  ${({ theme }) => `
    padding: 10px 13px;
    border-radius: 15px;
    text-align: center;
    border: 1px solid ${theme.palette.type === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
  `}
`;

const StyledStale = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #f9f3dc;
  color: #cc6d00;
  text-align: center;
  * {
    font-weight: 600 !important;
  }
`;

const StyledNoFunds = styled.div`
  ${({ theme }) => `
    padding: 8px 11px;
    border-radius: 5px;
    background-color: ${theme.palette.type === 'light' ? '#dceff9' : '#275f7c'};
    color: ${theme.palette.type === 'light' ? '#0088cc' : '#ffffff'};
    text-align: center;
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
  justify-content: space-between;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
}

const ActivePosition = ({ position }: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity,
    remainingSwaps,
    rate,
    totalSwaps,
    pendingTransaction,
    toWithdraw,
  } = position;
  const [shouldShowMigrate, setShouldShowMigrate] = React.useState(false);
  const availablePairs = useAvailablePairs();
  const currentNetwork = useCurrentNetwork();
  const history = useHistory();

  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [token0, token1] = sortTokens(from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from, to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to);
  const pair = find(
    availablePairs,
    (findigPair) => findigPair.token0.address === token0.address && findigPair.token1.address === token1.address
  );

  const hasNoFunds = remainingLiquidity.lte(BigNumber.from(0));

  console.log(pair, availablePairs, token0, token1);
  const isStale =
    calculateStale(pair?.lastExecutedAt || 0, swapInterval, position.startedAt, pair?.swapInfo || '1') === STALE;

  const onViewDetails = () => {
    history.push(`/positions/${position.id}`);
  };

  return (
    <StyledCard variant="outlined">
      <MigratePositionModal onCancel={() => setShouldShowMigrate(false)} open={shouldShowMigrate} position={position} />
      <StyledCardContent>
        <Grid container>
          <Grid item xs={12} sm={9} md={10}>
            <StyledContentContainer>
              <StyledCardHeader>
                <StyledCardTitleHeader>
                  <TokenIcon token={from} size="20px" />
                  <Typography variant="body1">{from.symbol}</Typography>
                  <ArrowRight size="20px" />
                  <TokenIcon token={to} size="20px" />
                  <Typography variant="body1">{to.symbol}</Typography>
                </StyledCardTitleHeader>
                {!isPending && !hasNoFunds && (
                  <StyledFreqLeft>
                    <Typography variant="body2">
                      <FormattedMessage
                        description="days to finish"
                        defaultMessage="{type} left"
                        values={{
                          type: getTimeFrequencyLabel(swapInterval.toString(), remainingSwaps.toString()),
                        }}
                      />
                    </Typography>
                  </StyledFreqLeft>
                )}
              </StyledCardHeader>
              <StyledDetailWrapper>
                <Typography variant="body2">
                  <FormattedMessage
                    description="current remaining"
                    defaultMessage="Remaining: <b>{remainingLiquidity} {from} ({rate} {from} {frequency})</b>"
                    values={{
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                      rate: formatCurrencyAmount(rate, from),
                      frequency:
                        STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb,
                      remainingLiquidity: formatCurrencyAmount(remainingLiquidity, from),
                      from: from.symbol,
                    }}
                  />
                </Typography>
              </StyledDetailWrapper>
              <StyledDetailWrapper>
                <Typography variant="body2" component="span">
                  <FormattedMessage
                    description="current swapped in position"
                    defaultMessage="To withdraw: <b>{exercised} {to}</b>"
                    values={{
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                      exercised: formatCurrencyAmount(toWithdraw, to),
                      to: to.symbol,
                    }}
                  />
                </Typography>
              </StyledDetailWrapper>
            </StyledContentContainer>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <StyledCallToActionContainer>
              {!isPending && !hasNoFunds && !isStale && (
                <StyledFreqLeft>
                  <Typography variant="body2">
                    <FormattedMessage description="in progress" defaultMessage="In progress" />
                  </Typography>
                </StyledFreqLeft>
              )}
              {!isPending && hasNoFunds && (
                <StyledNoFunds>
                  <Typography variant="body2">
                    <FormattedMessage description="no funds" defaultMessage="Position finished" />
                  </Typography>
                </StyledNoFunds>
              )}
              {!isPending && !hasNoFunds && isStale && (
                <StyledStale>
                  <Typography variant="body2">
                    <FormattedMessage description="stale" defaultMessage="Stale" />
                  </Typography>
                </StyledStale>
              )}
              <StyledCardFooterButton
                variant="contained"
                color={isPending ? 'pending' : 'secondary'}
                onClick={() => !isPending && onViewDetails()}
                fullWidth
              >
                {isPending ? (
                  <Link
                    href={buildEtherscanTransaction(pendingTransaction, currentNetwork.chainId)}
                    target="_blank"
                    rel="noreferrer"
                    underline="none"
                    color="inherit"
                  >
                    <Typography variant="body2" component="span">
                      <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
                    </Typography>
                    <CallMadeIcon style={{ fontSize: '1rem' }} />
                  </Link>
                ) : (
                  <Typography variant="body2">
                    <FormattedMessage description="View details" defaultMessage="View details" />
                  </Typography>
                )}
              </StyledCardFooterButton>
              {/* {!isPending && remainingSwaps.gt(BigNumber.from(0)) && (
                <StyledCardFooterButton
                  variant="contained"
                  color="secondary"
                  onClick={() => setShouldShowMigrate(true)}
                  fullWidth
                >
                  <Typography variant="body2">
                    <FormattedMessage description="migratePosition" defaultMessage="Migrate position" />
                  </Typography>
                </StyledCardFooterButton>
              )} */}
            </StyledCallToActionContainer>
          </Grid>
          <Grid item xs={12}>
            <StyledProgressWrapper>
              <BorderLinearProgress
                swaps={remainingSwaps.toNumber()}
                variant="determinate"
                value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
              />
            </StyledProgressWrapper>
          </Grid>
        </Grid>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
