import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper } from 'ui-library';
import WalletSelector, { WalletSelectorProps } from '../wallet-selector';
import useNetWorth from '@hooks/useNetWorth';
import NetWorthNumber from '../networth-number';
import useIsLoggingUser from '@hooks/useIsLoggingUser';

const StyledNetWorthContainer = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: ${spacing(1)};
    padding: ${spacing(2)} ${spacing(8)};
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
  const isLoggingUser = useIsLoggingUser();

  return (
    <StyledNetWorthContainer variant="outlined">
      <WalletSelector {...walletSelector} />
      <NetWorthNumber
        isLoading={isLoadingSomePrices || isLoggingUser}
        withAnimation
        value={totalAssetValue}
        variant={walletSelector.size === 'medium' ? 'h2Bold' : 'h4Bold'}
      />
    </StyledNetWorthContainer>
  );
};

export default NetWorth;
