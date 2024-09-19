import React from 'react';
import styled from 'styled-components';
import {
  BackgroundPaper,
  ButtonProps,
  ContainerBox,
  EyeIcon,
  IconButton,
  Typography,
  colors,
  EyeSlashIcon,
} from 'ui-library';
import WalletSelector, { WalletSelectorProps } from '../wallet-selector';
import useNetWorth from '@hooks/useNetWorth';
import NetWorthNumber from '../networth-number';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import { useAppDispatch } from '@state/hooks';
import { toggleShowBalances } from '@state/config/actions';
import { useShowBalances } from '@state/config/hooks';

export enum NetWorthVariants {
  main = 'main',
  nav = 'nav',
}

interface NetWorthProps {
  walletSelector: WalletSelectorProps;
  chainId?: number;
  variant?: NetWorthVariants;
}

const StyledNetWorthContainer = styled(BackgroundPaper)<{
  $size: ButtonProps['size'];
  $netWorthVariant: NetWorthVariants;
}>`
  ${({ theme: { spacing }, $size, $netWorthVariant }) => `
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: ${spacing(1)};
    padding: ${$netWorthVariant === NetWorthVariants.nav ? `${spacing(2)} ${spacing(6)}` : `${spacing($size === 'medium' ? 3 : 2)} ${spacing($size === 'medium' ? 5 : 4)}`};
    ${$netWorthVariant === NetWorthVariants.nav ? 'border: none; outline: none' : ''}
    ${$netWorthVariant === NetWorthVariants.main ? 'flex: 1;' : ''}
  `}
`;

const NetWorth = ({ walletSelector, chainId, variant = NetWorthVariants.main }: NetWorthProps) => {
  const dispatch = useAppDispatch();
  const showBalances = useShowBalances();

  const { isLoadingSomePrices, totalAssetValue } = useNetWorth({
    walletSelector: walletSelector.options.selectedWalletOption,
    chainId,
  });
  const isLoggingUser = useIsLoggingUser();

  const onToggleShowBalances = () => {
    dispatch(toggleShowBalances());
  };

  return (
    <StyledNetWorthContainer variant="outlined" $size={walletSelector.size} $netWorthVariant={variant}>
      <ContainerBox alignItems="center">
        <WalletSelector {...walletSelector} />
        <IconButton onClick={onToggleShowBalances} sx={{ padding: 0, margin: 0 }}>
          <Typography
            variant="bodyLargeRegular"
            sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo3, display: 'inline-flex' }}
          >
            {showBalances ? <EyeIcon /> : <EyeSlashIcon />}
          </Typography>
        </IconButton>
      </ContainerBox>
      <NetWorthNumber
        isLoading={isLoadingSomePrices || isLoggingUser}
        withAnimation
        value={totalAssetValue}
        variant={variant === NetWorthVariants.main ? 'h4Bold' : 'h6Bold'}
        size="large"
      />
    </StyledNetWorthContainer>
  );
};

export default NetWorth;
