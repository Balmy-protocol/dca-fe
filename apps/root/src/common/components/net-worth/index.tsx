import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper } from 'ui-library';
import WalletSelector, { WalletSelectorProps } from '../wallet-selector';
import useNetWorth from '@hooks/useNetWorth';
import NetWorthNumber from '../networth-number';

const StyledNetWorthContainer = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: ${spacing(1)};
    padding: ${spacing(4)};
  `}
`;

interface NetWorthProps {
  walletSelector: WalletSelectorProps;
  chainId?: number;
}

const NetWorth = ({ walletSelector, chainId }: NetWorthProps) => {
  const { isLoadingSomePrices, totalAssetValue } = useNetWorth({
    walletSelector: walletSelector.options.selectedWalletOption,
    chainId,
  });

  return (
    <StyledNetWorthContainer variant="outlined">
      <WalletSelector {...walletSelector} />
      <NetWorthNumber
        isLoading={isLoadingSomePrices}
        withAnimation
        value={totalAssetValue}
        variant={walletSelector.size === 'medium' ? 'h2' : 'h4'}
      />
    </StyledNetWorthContainer>
  );
};

export default NetWorth;
