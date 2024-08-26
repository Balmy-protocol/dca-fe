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
    <StyledNetWorthContainer variant="outlined" $size={walletSelector.size}>
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
        variant="h4Bold"
        size="large"
      />
    </StyledNetWorthContainer>
  );
};

export default NetWorth;
