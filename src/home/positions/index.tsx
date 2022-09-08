import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { useOpenClosePositionTab } from 'state/tabs/hooks';
import { useAppDispatch } from 'state/hooks';
import { changeOpenClosePositionTab } from 'state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import usePositionService from 'hooks/usePositionService';
import useWalletService from 'hooks/useWalletService';
import usePrevious from 'hooks/usePrevious';
import History from '../history';
import CurrentPositions from '../current-positions';
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

const Positions = () => {
  const tabIndex = useOpenClosePositionTab();
  const dispatch = useAppDispatch();
  const positionService = usePositionService();
  const [hasLoadedPositions, setHasLoadedPositions] = React.useState(positionService.getHasFetchedCurrentPositions());
  const walletService = useWalletService();
  const account = walletService.getAccount();
  const [isLoading, setIsLoading] = React.useState(false);
  const prevAccount = usePrevious(account);

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
      <StyledDashboardContainer>{hasLoadedPositions && !isLoading && <PositionDashboard />}</StyledDashboardContainer>
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
                  <FormattedMessage description="openPositions" defaultMessage="Open positions" />
                </Typography>
              }
            />
            <StyledTab
              disableRipple
              sx={{ marginLeft: '32px' }}
              label={
                <Typography variant="h6">
                  <FormattedMessage description="terminatedPositions" defaultMessage="Terminated positions" />
                </Typography>
              }
            />
          </StyledTabs>
        </StyledTabsContainers>
        <StyledPositionsContainer>
          <StyledPaper variant="outlined">
            {tabIndex === 0 ? <CurrentPositions isLoading={!hasLoadedPositions || isLoading} /> : <History />}
          </StyledPaper>
        </StyledPositionsContainer>
      </StyledPositions>
    </StyledContainer>
  );
};
export default Positions;
