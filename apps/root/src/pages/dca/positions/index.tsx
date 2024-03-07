import React from 'react';
import styled from 'styled-components';
import { Typography, Tabs, Tab, createStyles } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useOpenClosePositionTab } from '@state/tabs/hooks';
import { useAppDispatch } from '@state/hooks';
import { changeOpenClosePositionTab } from '@state/tabs/actions';
import { withStyles } from 'tss-react/mui';
import usePositionService from '@hooks/usePositionService';
import usePrevious from '@hooks/usePrevious';
import useAccount from '@hooks/useAccount';
import useCurrentPositions from '@hooks/useCurrentPositions';
import History from './components/history';
import CurrentPositions from './components/current-positions';
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

const StyledTab = withStyles(Tab, () =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
    },
    selected: {
      fontWeight: '500',
    },
  })
);

const StyledTabs = withStyles(Tabs, () =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
    indicator: {},
  })
);

const Positions = () => {
  const tabIndex = useOpenClosePositionTab();
  const dispatch = useAppDispatch();
  const positionService = usePositionService();
  const [hasLoadedPositions, setHasLoadedPositions] = React.useState(positionService.getHasFetchedCurrentPositions());
  const account = useAccount();
  const [isLoading, setIsLoading] = React.useState(false);
  const prevAccount = usePrevious(account);
  const positions = useCurrentPositions();

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
        <Typography variant="body">
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
            onChange={(e, index: number) => dispatch(changeOpenClosePositionTab(index))}
            TabIndicatorProps={{ style: { bottom: '8px' } }}
          >
            <StyledTab
              disableRipple
              label={
                <Typography variant="h6">
                  <FormattedMessage description="openPositions" defaultMessage="Open positions" />
                </Typography>
              }
            />
            <StyledTab
              disableRipple
              sx={{ marginLeft: '32px' }}
              label={
                <Typography variant="h6">
                  <FormattedMessage description="terminatedPositions" defaultMessage="Closed positions" />
                </Typography>
              }
            />
          </StyledTabs>
        </StyledTabsContainers>
        <StyledPositionsContainer>
          {tabIndex === 0 ? <CurrentPositions isLoading={!hasLoadedPositions || isLoading} /> : <History />}
        </StyledPositionsContainer>
      </StyledPositions>
    </StyledContainer>
  );
};
export default Positions;
