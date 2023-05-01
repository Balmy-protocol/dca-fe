import React from 'react';
import styled from 'styled-components';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import { FullPosition } from '@types';
import ProfitLossGraph, { Legends as ProfitLossLegends } from '@pages/position-detail/profit-loss-graph';
import AveragePriceGraph, { Legends as AveragePriceLegends } from '@pages/position-detail/average-price-graph';
import GasSavedGraph, { Legends as GasSavedLegends } from '@pages/position-detail/gas-saved-graph';
import SwapPriceGraph, { Legends as SwapPriceLegends } from '@pages/position-detail/swap-price-graph';
import { NETWORKS } from '@constants';
import GraphSelector from './graph-selector';

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
  align-items: center;

  margin-bottom: 15px;
`;

interface GraphContainerProps {
  position: FullPosition;
}

const GRAPHS = [
  {
    key: 0,
    title: <FormattedMessage description="averagePriceGraphTitle" defaultMessage="Average buy price" />,
    component: ({ position }: GraphContainerProps) => <AveragePriceGraph position={position} />,
    legend: <AveragePriceLegends />,
  },
  {
    key: 1,
    title: <FormattedMessage description="dcaVsLumpSumTitle" defaultMessage="DCA vs Lump sum" />,
    component: ({ position }: GraphContainerProps) => <ProfitLossGraph position={position} />,
    legend: <ProfitLossLegends />,
  },
  {
    key: 2,
    title: <FormattedMessage description="swapPriceGraphTitle" defaultMessage="Swaps" />,
    component: ({ position }: GraphContainerProps) => <SwapPriceGraph position={position} />,
    legend: <SwapPriceLegends />,
  },
  {
    key: 3,
    title: <FormattedMessage description="gasSavedGraphTitle" defaultMessage="Gas saved" />,
    component: ({ position }: GraphContainerProps) => <GasSavedGraph position={position} />,
    legend: <GasSavedLegends />,
    enabledChains: [NETWORKS.mainnet.chainId],
  },
];

const GraphContainer = ({ position }: GraphContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <StyledContainer elevation={0}>
      <StyledHeader>
        {GRAPHS[tabIndex].legend}
        <GraphSelector
          options={GRAPHS.filter((graph) => !graph.enabledChains || graph.enabledChains.includes(position.chainId))}
          selected={tabIndex}
          setGraph={setTabIndex}
        />
      </StyledHeader>
      {GRAPHS[tabIndex].component({ position })}
    </StyledContainer>
  );
};
export default GraphContainer;
