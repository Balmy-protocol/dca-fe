import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'ethers';
import { Position } from 'types';
import { useOpenClosePositionTab } from '@state/tabs/hooks';
import { useAppDispatch } from '@state/hooks';
import { changeOpenClosePositionTab } from '@state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import usePositionService from '@hooks/usePositionService';
import usePrevious from '@hooks/usePrevious';
import useAccount from '@hooks/useAccount';
import useCurrentPositions from '@hooks/useCurrentPositions';
import History from './components/history';
import PositionsList from '../positions-list';
import PositionDashboard from './components/dashboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const StyledDashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const StyledPositions = styled.div`
  display: flex;
  padding-bottom: 0px;
  flex-direction: column;
  flex: 1;
`;

const StyledTabsContainers = styled.div`
  display: flex;
  padding-bottom: 15px;
`;

const StyledPositionsContainer = styled.div`
  display: flex;
  flex: 1;
`;

const StyledTab = withStyles(() =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
      color: 'rgba(255,255,255,0.5)',
    },
    selected: {
      color: '#FFFFFF !important',
      fontWeight: '500',
    },
  })
)(Tab);

const StyledTabs = withStyles(() =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
    indicator: {
      background: '#3076F6',
    },
  })
)(Tabs);

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(216, 216, 216, 0.05);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
`;

function comparePositions(positionA: Position, positionB: Position) {
  const isAFinished = positionA.remainingSwaps.lte(BigNumber.from(0));
  const isBFinished = positionB.remainingSwaps.lte(BigNumber.from(0));
  if (isAFinished !== isBFinished) {
    return isAFinished ? 1 : -1;
  }

  return positionA.startedAt > positionB.startedAt ? -1 : 1;
}

const Positions = () => {
  const tabIndex = useOpenClosePositionTab();
  const dispatch = useAppDispatch();
  const positionService = usePositionService();
  const [hasLoadedPositions, setHasLoadedPositions] = React.useState(positionService.getHasFetchedCurrentPositions());
  const account = useAccount();
  const [isLoading, setIsLoading] = React.useState(false);
  const prevAccount = usePrevious(account);
  const positions = useCurrentPositions(true);

  const positionsInProgress = positions
    .filter(
      ({ toWithdraw, remainingSwaps, user }) =>
        (toWithdraw.gt(BigNumber.from(0)) || remainingSwaps.gt(BigNumber.from(0))) &&
        user.toLowerCase() === account.toLowerCase()
    )
    .sort(comparePositions);
  const positionsFinished = positions
    .filter(
      ({ toWithdraw, remainingSwaps, user }) =>
        toWithdraw.lte(BigNumber.from(0)) &&
        remainingSwaps.lte(BigNumber.from(0)) &&
        user.toLowerCase() === account.toLowerCase()
    )
    .sort(comparePositions);

  const permissionedPositionsInProgress = positions
    .filter(
      ({ toWithdraw, remainingSwaps, user }) =>
        (toWithdraw.gt(BigNumber.from(0)) || remainingSwaps.gt(BigNumber.from(0))) &&
        user.toLowerCase() !== account.toLowerCase()
    )
    .sort(comparePositions);

  React.useEffect(() => {
    const fetchPositions = async () => {
      await positionService.fetchCurrentPositions();
      setHasLoadedPositions(true);
      setIsLoading(false);
    };

    if (!isLoading && (!hasLoadedPositions || account !== prevAccount)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPositions();
      setIsLoading(true);
    }
  }, [account, prevAccount]);

  return (
    <StyledContainer>
      <StyledTitle>
        <Typography variant="h4">
          <FormattedMessage description="positions title" defaultMessage="Your positions" />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="positions description"
            defaultMessage="Here you will see the details of your open positions and be able to see further details about them. You will only be able to interact with them if you are on the correct network."
          />
        </Typography>
      </StyledTitle>
      {!!positions.length && (
        <StyledDashboardContainer>{hasLoadedPositions && !isLoading && <PositionDashboard />}</StyledDashboardContainer>
      )}
      <StyledPositions>
        <StyledTabsContainers>
          <StyledTabs
            value={tabIndex}
            onChange={(e, index) => dispatch(changeOpenClosePositionTab(index))}
            TabIndicatorProps={{ style: { bottom: '8px' } }}
          >
            <StyledTab
              disableRipple
              label={
                <Typography variant="h6">
                  <FormattedMessage description="openPositions" defaultMessage="Open" />
                </Typography>
              }
            />
            <StyledTab
              disableRipple
              sx={{ marginLeft: '32px' }}
              label={
                <Typography variant="h6">
                  <FormattedMessage description="emptyPositions" defaultMessage="Empty" />
                </Typography>
              }
            />
            <StyledTab
              disableRipple
              sx={{ marginLeft: '32px' }}
              label={
                <Typography variant="h6">
                  <FormattedMessage description="terminatedPositions" defaultMessage="Closed" />
                </Typography>
              }
            />
            {!!permissionedPositionsInProgress.length && (
              <StyledTab
                disableRipple
                sx={{ marginLeft: '32px' }}
                label={
                  <Typography variant="h6">
                    <FormattedMessage description="terminatedPositions" defaultMessage="Permissioned" />
                  </Typography>
                }
              />
            )}
          </StyledTabs>
        </StyledTabsContainers>
        <StyledPositionsContainer>
          <StyledPaper variant="outlined">
            {(() => {
              switch (tabIndex) {
                case 0: // OPEN
                  return <PositionsList isLoading={!hasLoadedPositions || isLoading} positions={positionsInProgress} />;
                case 1: // EMPTY
                  return (
                    <PositionsList
                      isLoading={!hasLoadedPositions || isLoading}
                      positions={positionsFinished}
                      finished
                    />
                  );
                case 2: // CLOSED
                  return <History />;
                case 3: // PERMISSIONED
                  return (
                    <PositionsList
                      isLoading={!hasLoadedPositions || isLoading}
                      positions={permissionedPositionsInProgress}
                    />
                  );
                default:
                  return null;
              }
            })()}
          </StyledPaper>
        </StyledPositionsContainer>
      </StyledPositions>
    </StyledContainer>
  );
};
export default Positions;
