import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { useAppSelector } from 'state/hooks';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { useBadgeNumber } from 'state/transactions-badge/hooks';
import { updateBadgeNumber } from 'state/transactions-badge/actions';
import { useAppDispatch } from 'state/hooks';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Web3Service } from 'types';
import { FormattedMessage } from 'react-intl';
import FloatingMenu from '../floating-menu';

interface ConnectWalletButtonProps {
  web3Service: Web3Service;
  isLoading: boolean;
}

const WalletButton = ({ web3Service, isLoading }: ConnectWalletButtonProps) => {
  const transactions = useAppSelector((state: any) => state.transactions);
  const hasPendingTransactions = useHasPendingTransactions();
  const dispatch = useAppDispatch();
  const badge = useBadgeNumber();

  const buttonContent = isLoading ? (
    <CircularProgress color="secondary" />
  ) : (
    <Typography noWrap>{web3Service.getAccount()}</Typography>
  );

  const onOpen = () => {
    dispatch(
      updateBadgeNumber({ viewedTransactions: Object.keys(transactions).length - (hasPendingTransactions ? 1 : 0) })
    );
  };

  return (
    <div>
      <FloatingMenu
        buttonContent={buttonContent}
        buttonStyles={{ maxWidth: '200px', textTransform: 'none' }}
        isIcon={false}
        badge={Object.keys(transactions).length - badge}
        isLoading={hasPendingTransactions}
        onOpen={onOpen}
      >
        <MenuItem onClick={() => web3Service.disconnect()}>
          <ListItemIcon>
            <LinkOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage description="Disconnect" defaultMessage="Disconnect" />
          </ListItemText>
        </MenuItem>
      </FloatingMenu>
    </div>
  );
};

export default WalletButton;
