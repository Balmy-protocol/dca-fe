import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, ContainerBox } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { Position } from '@types';
import { NETWORKS } from '@constants';
import ProfitLossGraph, { Legends as ProfitLossLegends } from './components/profit-loss-graph';
import AveragePriceGraph, { Legends as AveragePriceLegends } from './components/average-price-graph';
import GasSavedGraph, { Legends as GasSavedLegends } from './components/gas-saved-graph';
import SwapPriceGraph, { Legends as SwapPriceLegends } from './components/swap-price-graph';
import GraphSelector from './graph-selector';
import { GraphNoData, GraphSkeleton } from './components/graph-state';

const StyledContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    gap: ${spacing(6)};
    padding-bottom: ${spacing(12)};
  `};
  display: flex;
  flex-direction: column;
`;

const StyledGraphContainer = styled(ContainerBox)`
  .recharts-surface {
    overflow: visible;
  }
`;

export const StyledLegend = styled(ContainerBox).attrs({ alignItems: 'center', gap: 2 })``;

export const StyledLegendIndicator = styled.div<{ fill: string }>`
  ${({ theme: { spacing } }) => `
    width: ${spacing(3)};
    height: ${spacing(3)};
  `}
  background-color: ${({ fill }) => fill};
  border-radius: 50%;
`;

interface GraphContainerProps {
  position?: Position;
  isLoading: boolean;
}

interface GraphProps {
  position: Position;
}

const GRAPHS = [
  {
    key: 0,
    title: <FormattedMessage description="averagePriceGraphTitle" defaultMessage="Average buy price" />,
    component: ({ position }: GraphProps) => <AveragePriceGraph position={position} />,
    legend: <AveragePriceLegends />,
  },
  {
    key: 1,
    title: <FormattedMessage description="dcaVsLumpSumTitle" defaultMessage="DCA vs Lump sum" />,
    component: ({ position }: GraphProps) => <ProfitLossGraph position={position} />,
    legend: <ProfitLossLegends />,
  },
  {
    key: 2,
    title: <FormattedMessage description="swapPriceGraphTitle" defaultMessage="Swaps" />,
    component: ({ position }: GraphProps) => <SwapPriceGraph position={position} />,
    legend: <SwapPriceLegends />,
  },
  {
    key: 3,
    title: <FormattedMessage description="gasSavedGraphTitle" defaultMessage="Gas saved" />,
    component: ({ position }: GraphProps) => <GasSavedGraph position={position} />,
    legend: <GasSavedLegends />,
    enabledChains: [NETWORKS.mainnet.chainId],
  },
];

const GraphContainer = ({ position, isLoading }: GraphContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <StyledContainer>
      {isLoading ? (
        <GraphSkeleton />
      ) : !position ? (
        <GraphNoData />
      ) : (
        <>
          <ContainerBox justifyContent="space-between" alignItems="center">
            <ContainerBox gap={4}>{GRAPHS[tabIndex].legend}</ContainerBox>
            <GraphSelector
              options={GRAPHS.filter((graph) => !graph.enabledChains || graph.enabledChains.includes(position.chainId))}
              selected={tabIndex}
              setGraph={setTabIndex}
            />
          </ContainerBox>
          <ContainerBox flexDirection="column" flexGrow={1}>
            <StyledGraphContainer>{GRAPHS[tabIndex].component({ position })}</StyledGraphContainer>
          </ContainerBox>
        </>
      )}
    </StyledContainer>
  );
};
export default GraphContainer;
