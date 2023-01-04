import React from 'react';
import styled from 'styled-components';
import Paper from '@mui/material/Paper';
import MinimalTabs from 'common/minimal-tabs';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { FullPosition } from 'types';
import ProfitLossGraph from 'position-detail/profit-loss-graph';
import AveragePriceGraph from 'position-detail/average-price-graph';
import GasSavedGraph from 'position-detail/gas-saved-graph';
import { NETWORKS } from 'config';

const StyledContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: transparent;
  margin-bottom: 30px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;

  margin-bottom: 15px;
`;

interface GraphContainerProps {
  position: FullPosition;
}

const GRAPHS = [
  {
    title: <FormattedMessage description="averagePriceGraphTitle" defaultMessage="Market price vs DCA price" />,
    component: ({ position }: GraphContainerProps) => <AveragePriceGraph position={position} />,
  },
  {
    title: <FormattedMessage description="dcaVsLumpSumTitle" defaultMessage="DCA vs Lump sum" />,
    component: ({ position }: GraphContainerProps) => <ProfitLossGraph position={position} />,
  },
  {
    title: <FormattedMessage description="gasSavedGraphTitle" defaultMessage="Gas saved" />,
    component: ({ position }: GraphContainerProps) => <GasSavedGraph position={position} />,
  },
];

const GraphContainer = ({ position }: GraphContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <StyledContainer elevation={0}>
      <StyledHeader>
        <Typography variant="h6">{GRAPHS[tabIndex].title}</Typography>
        <MinimalTabs
          options={[
            { key: 0, label: 'Average buy price' },
            { key: 1, label: 'DCA vs Lump sum' },
            ...(position.chainId === NETWORKS.mainnet.chainId ? [{ key: 2, label: 'Gas saved' }] : []),
          ]}
          selected={{ key: tabIndex, label: '' }}
          onChange={({ key }) => setTabIndex(key as number)}
        />
      </StyledHeader>
      {GRAPHS[tabIndex].component({ position })}
    </StyledContainer>
  );
};
export default GraphContainer;
