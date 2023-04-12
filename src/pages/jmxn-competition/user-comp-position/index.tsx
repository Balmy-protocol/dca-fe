import React from 'react';
import styled from 'styled-components';
import find from 'lodash/find';
import Button from 'common/button';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { FullPosition, Token, YieldOptions } from 'types';
import { BigNumber } from 'ethers';
import { Card, CardContent, Collapse, Divider, Paper, Typography } from '@mui/material';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { JMXN_ADDRESS, JMXN_TOKEN } from 'pages/jmxn-competition/constants';
import { formatCurrencyAmount, parseUsdPrice } from 'utils/currency';
import TokenIcon from 'common/token-icon';
import CustomChip from 'common/custom-chip';
import ComposedTokenIcon from 'common/composed-token-icon';
import Address from 'common/address';
import { getDisplayToken } from 'utils/parsing';
import { NETWORKS, POSITION_VERSION_4, STRING_SWAP_INTERVALS } from 'config';
import { useAppDispatch } from 'hooks/state';
import { useHistory } from 'react-router-dom';
import { setPosition } from 'state/position-details/actions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { changePositionDetailsTab } from 'state/tabs/actions';

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
  overflow: visible;
  flex-direction: column;
`;

const StyledPaper = styled(Paper)`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 10px;
`;

const StyledCardContent = styled(CardContent)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const StyledDetailWrapper = styled.div<{ $spaceItems?: boolean; $noMargin?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  flex-wrap: wrap;
  ${(props) => (props.onClick ? 'cursor: pointer;' : '')}
  ${({ $spaceItems }) => ($spaceItems ? 'justify-content: space-between' : 'justify-content: flex-start')};
  ${({ $noMargin }) => ($noMargin ? '' : 'margin-bottom: 5px;')}
`;

const StyledDivider = styled(Divider)`
  margin: 16px 0px;
`;

const StyledArrowRightContainer = styled.div`
  margin: 0 5px !important;
  font-size: 35px;
  display: flex;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledHeaderTitle = styled.div<{
  $showDetails: boolean;
  $isFirst: boolean;
  $isSecond: boolean;
  $isThird: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  flex-wrap: wrap;
  cursor: pointer;
  justify-content: space-between;
  flex: 1;
  padding: 0px 16px;
  ${({ $showDetails }) => ($showDetails ? 'border-bottom: 1px solid rgba(255,255,255,0.12);' : '')};
  ${({ $isFirst }) => ($isFirst ? 'background-color: rgb(172 128 8);' : '')};
  ${({ $isSecond }) => ($isSecond ? 'background-color: rgb(132 130 137);' : '')};
  ${({ $isThird }) => ($isThird ? 'background-color: rgb(233 138 77);' : '')};
`;

const StyledPosition = styled.div`
  padding: 16px 16px 16px 0px;
  margin-right: 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
`;

const StyledMainData = styled.div<{ $spaceBetween?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  ${({ $spaceBetween }) => ($spaceBetween ? 'justify-content: space-between;' : '')}
`;

const StyledPositionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

interface UserCompPositionProps {
  userPosition: {
    user: string;
    generatedUsd: number;
    totalDepositedUsd: number;
    totalUsedUsd: number;
    totalDeposited: BigNumber;
    totalUsed: BigNumber;
    generated: { token: Token; amount: BigNumber }[];
    positions: FullPosition[];
  };
  prices?: Record<string, BigNumber>;
  leaderboardPosition: number;
  yieldOptions?: YieldOptions;
}

const UserCompPosition = ({ userPosition, prices, yieldOptions, leaderboardPosition }: UserCompPositionProps) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();
  const [showDetails, setShowDetails] = React.useState(false);
  const [showPositions, setShowPositions] = React.useState(false);
  const jmxnInUsd = (prices && prices[JMXN_ADDRESS]) || BigNumber.from(1);
  const rankingPosition = leaderboardPosition + 1;

  const onViewDetails = (event: React.MouseEvent, positionId: string) => {
    event.preventDefault();
    dispatch(setPosition(null));
    dispatch(changePositionDetailsTab(0));
    history.push(`/${NETWORKS.polygon.chainId}/positions/${POSITION_VERSION_4}/${positionId}`);
  };

  const profit = (userPosition.generatedUsd / userPosition.totalUsedUsd - 1) * 100;

  return (
    <StyledCard variant="outlined">
      <StyledHeaderTitle
        onClick={() => setShowDetails(!showDetails)}
        $showDetails={showDetails}
        $isFirst={rankingPosition === 1}
        $isSecond={rankingPosition === 2}
        $isThird={rankingPosition === 3}
      >
        <StyledCardTitleHeader>
          <StyledPosition>
            <Typography variant="h5">{rankingPosition}</Typography>
          </StyledPosition>
          <Typography variant="h6">
            <Address address={userPosition.user} trimAddress />
          </Typography>
        </StyledCardTitleHeader>
        <StyledDetailWrapper>
          <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
            <FormattedMessage description="jmxnUserCompInvestingIn" defaultMessage="Investing in:" />
          </Typography>
          {userPosition.generated.map(({ token }) => (
            <TokenIcon token={token} />
          ))}
          <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
            <FormattedMessage description="jmxnUserCompTotalEarned" defaultMessage="Total earned:" />
          </Typography>
          <Typography variant="body1" sx={{ marginLeft: '5px' }}>
            {userPosition.generatedUsd.toFixed(2)} MXN
          </Typography>
          {showDetails ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
        </StyledDetailWrapper>
      </StyledHeaderTitle>
      <Collapse in={showDetails}>
        <StyledCardContent>
          <StyledMainData $spaceBetween>
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="jmxnUserCompTotalDeposited" defaultMessage="Total deposited:" />
              </Typography>
              <Typography variant="body1" sx={{ marginLeft: '5px' }}>
                {formatCurrencyAmount(BigNumber.from(userPosition.totalDeposited), JMXN_TOKEN, 4)} MXN
              </Typography>
            </StyledDetailWrapper>
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="jmxnUserCompPositions" defaultMessage="Positions:" />
              </Typography>
              <Typography variant="body1" sx={{ marginLeft: '5px' }}>
                {userPosition.positions.length}
              </Typography>
            </StyledDetailWrapper>
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="jmxnUserCompTotalUsed" defaultMessage="Used funds:" />
              </Typography>
              <Typography variant="body1" sx={{ marginLeft: '5px' }}>
                {formatCurrencyAmount(BigNumber.from(userPosition.totalUsed), JMXN_TOKEN, 4)} MXN
              </Typography>
            </StyledDetailWrapper>
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="jmxnUserCompTotalProfi" defaultMessage="Profit:" />
              </Typography>
              <Typography variant="body1" sx={{ marginLeft: '5px' }}>
                {profit.toFixed(2)}%
              </Typography>
            </StyledDetailWrapper>
          </StyledMainData>
          <StyledDivider />
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="jmxnUserCompEarnedInToken" defaultMessage="Earned by token:" />
            </Typography>
          </StyledDetailWrapper>
          <StyledMainData>
            {userPosition.generated.map(({ token, amount }) => (
              <StyledDetailWrapper>
                <CustomChip
                  extraText={
                    prices &&
                    prices[token.address] &&
                    `(${parseUsdPrice(
                      token,
                      amount,
                      prices[token.address].mul(BigNumber.from(10).pow(18)).div(jmxnInUsd)
                    ).toFixed(2)} MXN)`
                  }
                  icon={<ComposedTokenIcon isInChip size="18px" tokenBottom={token} />}
                >
                  <Typography variant="body1">{formatCurrencyAmount(amount, token, 4)}</Typography>
                </CustomChip>
              </StyledDetailWrapper>
            ))}
          </StyledMainData>
          <StyledDivider />
          <StyledDetailWrapper onClick={() => setShowPositions(!showPositions)} $spaceItems>
            <Typography variant="body1">
              <FormattedMessage description="jmxnUserCompViewPositions" defaultMessage="View positons" />
            </Typography>
            {showPositions ? <ExpandLessIcon fontSize="medium" /> : <ExpandMoreIcon fontSize="medium" />}
          </StyledDetailWrapper>
          <Collapse in={showPositions}>
            <StyledPositionsContainer>
              {userPosition.positions.map((position) => {
                const from = getDisplayToken(position.from, NETWORKS.polygon.chainId);
                const to = getDisplayToken(position.to, NETWORKS.polygon.chainId);

                const foundYieldTo =
                  position.to.type === 'YIELD_BEARING_SHARE' &&
                  find(yieldOptions, { tokenAddress: position.to.address });
                return (
                  <StyledPaper>
                    <StyledCardTitleHeader>
                      <TokenIcon token={from} size="20px" />
                      <Typography variant="body1">{from.symbol}</Typography>
                      <StyledArrowRightContainer>
                        <ArrowRightAltIcon fontSize="inherit" />
                      </StyledArrowRightContainer>
                      {foundYieldTo ? (
                        <ComposedTokenIcon isInChip size="20px" tokenTop={foundYieldTo.token} tokenBottom={to} />
                      ) : (
                        <TokenIcon token={position.to} size="20px" />
                      )}
                      <Typography variant="body1">{to.symbol}</Typography>
                    </StyledCardTitleHeader>
                    <StyledDetailWrapper $noMargin>
                      <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                        <FormattedMessage
                          description="total earned"
                          defaultMessage="Total earned:"
                          values={{
                            b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          }}
                        />
                      </Typography>
                      <CustomChip
                        extraText={
                          prices &&
                          prices[to.address] &&
                          `(${parseUsdPrice(
                            to,
                            BigNumber.from(position.totalSwapped),
                            prices[to.address].mul(BigNumber.from(10).pow(18)).div(jmxnInUsd)
                          ).toFixed(2)} MXN)`
                        }
                        icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={to} />}
                      >
                        <Typography variant="body2">
                          {formatCurrencyAmount(BigNumber.from(position.totalSwapped), to, 4)}
                        </Typography>
                      </CustomChip>
                    </StyledDetailWrapper>
                    <StyledDetailWrapper $noMargin>
                      <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                        <FormattedMessage
                          description="current remaining"
                          defaultMessage="Remaining:"
                          values={{
                            b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          }}
                        />
                      </Typography>
                      <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={from} />}>
                        <Typography variant="body2">
                          {formatCurrencyAmount(BigNumber.from(position.remainingLiquidity), from, 4)}
                        </Typography>
                      </CustomChip>
                    </StyledDetailWrapper>
                    <StyledDetailWrapper $noMargin>
                      <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                        <FormattedMessage
                          description="current rate remaining"
                          defaultMessage="Rate:"
                          values={{
                            b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          }}
                        />
                      </Typography>
                      <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={from} />}>
                        <Typography variant="body2">
                          {formatCurrencyAmount(
                            BigNumber.from(position.depositedRateUnderlying || position.rate),
                            from,
                            4
                          )}
                        </Typography>
                      </CustomChip>
                      <FormattedMessage
                        description="positionDetailsCurrentRate"
                        defaultMessage="{frequency} {hasYield}"
                        values={{
                          b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          hasYield: position.from.underlyingTokens.length
                            ? intl.formatMessage(
                                defineMessage({
                                  defaultMessage: '+ yield',
                                  description: 'plusYield',
                                })
                              )
                            : '',
                          frequency: intl.formatMessage(
                            STRING_SWAP_INTERVALS[position.swapInterval.interval as keyof typeof STRING_SWAP_INTERVALS]
                              .adverb
                          ),
                        }}
                      />
                    </StyledDetailWrapper>
                    <Button variant="outlined" color="default" onClick={(e) => onViewDetails(e, position.id)}>
                      <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
                    </Button>
                  </StyledPaper>
                );
              })}
            </StyledPositionsContainer>
          </Collapse>
        </StyledCardContent>
      </Collapse>
    </StyledCard>
  );
};

export default UserCompPosition;
