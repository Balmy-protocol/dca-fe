import React from 'react';
import styled from 'styled-components';
import { BlowfishReponseData, BlowfishResponse, StateChangeKind } from 'types';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { toToken } from 'common/utils/currency';
import TokenIcon from 'common/components/token-icon';
import useSelectedNetwork from 'hooks/useSelectedNetwork';

const StyledTransactionSimulationsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledTransactionSimulations = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTransactionSimulation = styled.div`
  display: flex;
  gap: 24px;
  padding: 0px;
`;

const StyledTransactionSimulationIcon = styled.div<{ isFirst: boolean; isLast: boolean }>`
  display: flex;
  position: relative;
  padding-top: 10px;
  padding-bottom: 10px;
  &:after {
    content: '';
    position: absolute;
    left: calc(50% - 1px);
    top: 0px;
    right: 0px;
    bottom: 0;
    border-left: 1px dashed rgba(255, 255, 255, 0.5);
    ${({ isFirst }) => (isFirst ? 'top: 24px;' : '')}
    ${({ isLast }) => (isLast ? 'bottom: calc(100% - 24px);' : '')}
  }
`;

const StyledTransactionSimulationIconContent = styled.div`
  display: flex;
  align-self: flex-start;
`;

const StyledTransactionSimulationContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding-top: 10px;
  padding-bottom: 10px;
`;

interface ItemProps {
  isLast: boolean;
  isFirst: boolean;
  chainId: number;
  humanReadableDiff: string;
  rawInfo: {
    kind: StateChangeKind;
    data: BlowfishReponseData;
  };
}

const buildItem = ({ isLast, isFirst, chainId, humanReadableDiff, rawInfo: { data } }: ItemProps) => ({
  content: () => {
    const diff = BigNumber.from(data.amount.after).sub(BigNumber.from(data.amount.before));
    const isSubstracting = diff.lte(BigNumber.from(0));
    const token = toToken({ address: data.asset?.address || data.contract?.address || '', chainId });
    return (
      <>
        <StyledTransactionSimulationIcon isLast={isLast} isFirst={isFirst}>
          <StyledTransactionSimulationIconContent>
            <TokenIcon token={token} />
          </StyledTransactionSimulationIconContent>
        </StyledTransactionSimulationIcon>
        <StyledTransactionSimulationContent>
          <Typography variant="body1" color={isSubstracting ? '#EB5757' : '#219653'}>
            {humanReadableDiff}
          </Typography>
        </StyledTransactionSimulationContent>
      </>
    );
  },
});

interface TransactionSimulationProps {
  items: BlowfishResponse;
}

const ITEMS_MAP: Record<StateChangeKind, (props: ItemProps) => { content: () => JSX.Element }> = {
  [StateChangeKind.ERC20_TRANSFER]: buildItem,
  [StateChangeKind.ERC1155_APPROVAL_FOR_ALL]: buildItem,
  [StateChangeKind.ERC1155_TRANSFER]: buildItem,
  [StateChangeKind.ERC20_APPROVAL]: buildItem,
  [StateChangeKind.ERC721_APPROVAL]: buildItem,
  [StateChangeKind.ERC721_APPROVAL_FOR_ALL]: buildItem,
  [StateChangeKind.ERC721_TRANSFER]: buildItem,
  [StateChangeKind.NATIVE_ASSET_TRANSFER]: buildItem,
};

const SHOWN_TYPES = [
  StateChangeKind.ERC20_TRANSFER,
  StateChangeKind.ERC1155_TRANSFER,
  StateChangeKind.ERC721_TRANSFER,
  StateChangeKind.NATIVE_ASSET_TRANSFER,
];

const TransactionSimulation = ({ items }: TransactionSimulationProps) => {
  const selectedNetwork = useSelectedNetwork();
  const filteredSimulations = items.simulationResults.expectedStateChanges.filter((simulation) =>
    SHOWN_TYPES.includes(simulation.rawInfo.kind)
  );
  return (
    <StyledTransactionSimulationsContainer>
      <StyledTransactionSimulations>
        {filteredSimulations.map((simulation, index) => {
          const isFirst = index === 0;
          const isLast = index + 1 === filteredSimulations.length;

          const item = ITEMS_MAP[simulation.rawInfo.kind]({
            isFirst,
            isLast,
            chainId: selectedNetwork.chainId,
            ...simulation,
          });

          return (
            <StyledTransactionSimulation key={index}>
              <item.content />
            </StyledTransactionSimulation>
          );
        })}
      </StyledTransactionSimulations>
    </StyledTransactionSimulationsContainer>
  );
};

export default TransactionSimulation;
