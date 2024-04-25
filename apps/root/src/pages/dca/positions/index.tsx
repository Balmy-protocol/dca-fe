import React from 'react';
import styled from 'styled-components';
import { Typography, Tabs, Tab, createStyles, ContainerBox, colors, Theme } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useOpenClosePositionTab } from '@state/tabs/hooks';
import { useAppDispatch } from '@state/hooks';
import { changeOpenClosePositionTab } from '@state/tabs/actions';
import { withStyles } from 'tss-react/mui';
import useCurrentPositions from '@hooks/useCurrentPositions';
import History from './components/positions-list/history';
import CurrentPositions from './components/positions-list/current-positions';
import PositionDashboard from './components/dashboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledDashboardContainer = styled.div`
  ${({ theme: { spacing } }) => `
    margin-bottom: ${spacing(10)};
  `}
  display: flex;
  flex-direction: column;
`;

const StyledTabsContainers = styled.div`
  display: flex;
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
      padding: '10px',
    },
    selected: {
      fontWeight: '500',
    },
  })
);

const StyledTabs = withStyles(Tabs, (theme: Theme) =>
  createStyles({
    root: {
      overflow: 'visible',
      flex: 1,
    },
    flexContainer: {
      borderBottom: `2px solid ${colors[theme.palette.mode].border.border1}`,
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
  const { hasFetchedCurrentPositions, currentPositions } = useCurrentPositions();

  return (
    <StyledContainer>
      {!hasFetchedCurrentPositions ||
        (hasFetchedCurrentPositions && !!currentPositions.length && (
          <StyledDashboardContainer>
            <PositionDashboard />
          </StyledDashboardContainer>
        ))}
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="h4">
          <FormattedMessage description="positions title" defaultMessage="Your positions" />
        </Typography>
        <Typography variant="bodyRegular">
          <FormattedMessage
            description="positions description"
            defaultMessage="Here you will see the details of your open positions and be able to see further details about them. You will only be able to interact with them if you are on the correct network."
          />
        </Typography>
      </ContainerBox>
      <ContainerBox flexDirection="column" flex={1} gap={14}>
        <StyledTabsContainers>
          <StyledTabs value={tabIndex} onChange={(e, index: number) => dispatch(changeOpenClosePositionTab(index))}>
            <StyledTab
              disableRipple
              label={
                <Typography variant="bodyRegular" color="inherit">
                  <FormattedMessage description="openPositions" defaultMessage="Open positions" />
                </Typography>
              }
            />
            <StyledTab
              disableRipple
              sx={{ marginLeft: ({ spacing }) => spacing(6) }}
              label={
                <Typography variant="bodyRegular" color="inherit">
                  <FormattedMessage description="terminatedPositions" defaultMessage="Closed positions" />
                </Typography>
              }
            />
          </StyledTabs>
        </StyledTabsContainers>
        <StyledPositionsContainer>
          {tabIndex === 0 ? <CurrentPositions isLoading={!hasFetchedCurrentPositions} /> : <History />}
        </StyledPositionsContainer>
      </ContainerBox>
    </StyledContainer>
  );
};
export default Positions;
