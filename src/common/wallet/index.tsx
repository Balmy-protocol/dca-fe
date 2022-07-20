import React from 'react';
import styled from 'styled-components';
import { useAppDispatch } from 'state/hooks';
import { useAllTransactions, useHasPendingTransactions } from 'state/transactions/hooks';
import { useBadgeNumber } from 'state/transactions-badge/hooks';
import { updateBadgeNumber } from 'state/transactions-badge/actions';

import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Web3Service } from 'types';
import Button from 'common/button';
import WalletMenu from 'common/wallet-menu';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import Address from 'common/address';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  padding: 4px 8px;
`;

const StyledBadge = withStyles(() =>
  createStyles({
    badge: {
      backgroundColor: '#292929',
      border: '2px solid #121212',
      padding: '2px 6px',
      color: 'white',
    },
  })
)(Badge);

interface ConnectWalletButtonProps {
  web3Service: Web3Service;
  isLoading: boolean;
}

const WalletButton = ({ web3Service, isLoading }: ConnectWalletButtonProps) => {
  const transactions = useAllTransactions();
  const [shouldOpenMenu, setShouldOpenMenu] = React.useState(false);
  const hasPendingTransactions = useHasPendingTransactions();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const badge = useBadgeNumber(currentNetwork.chainId);

  const onOpen = () => {
    dispatch(
      updateBadgeNumber({
        viewedTransactions: Object.keys(transactions).length - (hasPendingTransactions ? 1 : 0),
        chainId: currentNetwork.chainId,
      })
    );
    setShouldOpenMenu(!shouldOpenMenu);
  };

  if (isLoading) return null;

  return (
    <>
      <StyledBadge
        badgeContent={
          hasPendingTransactions ? <CircularProgress size={10} /> : Object.keys(transactions).length - badge
        }
        color="primary"
      >
        <StyledButton
          aria-controls="customized-menu"
          aria-haspopup="true"
          color="transparent"
          variant="outlined"
          onClick={onOpen}
          style={{ maxWidth: '220px', textTransform: 'none' }}
        >
          <Typography noWrap>
            <Address address={web3Service.getAccount()} trimAddress />
          </Typography>
        </StyledButton>
      </StyledBadge>
      <WalletMenu open={shouldOpenMenu} onClose={() => setShouldOpenMenu(false)} />
    </>
  );
};

export default WalletButton;
