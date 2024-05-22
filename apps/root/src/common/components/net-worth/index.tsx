import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, ButtonProps } from 'ui-library';
import WalletSelector, { WalletSelectorProps } from '../wallet-selector';
import useNetWorth from '@hooks/useNetWorth';
import NetWorthNumber from '../networth-number';
import useIsLoggingUser from '@hooks/useIsLoggingUser';

const StyledNetWorthContainer = styled(BackgroundPaper)<{ $size: ButtonProps['size'] }>`
  ${({ theme: { spacing }, $size }) => `
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: ${spacing(1)};
    padding: ${spacing($size === 'medium' ? 3 : 2)} ${spacing($size === 'medium' ? 5 : 4)};
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
    <StyledNetWorthContainer variant="outlined" $size={walletSelector.size}>
      <WalletSelector {...walletSelector} />
      <NetWorthNumber
        isLoading={isLoadingSomePrices || isLoggingUser}
        withAnimation
        value={totalAssetValue}
        variant="h4Bold"
        addDolarSign
      />
    </StyledNetWorthContainer>
  );
};

export default NetWorth;
