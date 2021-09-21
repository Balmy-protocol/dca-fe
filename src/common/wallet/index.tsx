import React from 'react';
import styled from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import { useAppSelector } from 'state/hooks';
import { useAllTransactions, useHasPendingTransactions } from 'state/transactions/hooks';
import { useBadgeNumber } from 'state/transactions-badge/hooks';
import { updateBadgeNumber } from 'state/transactions-badge/actions';
import { useAppDispatch } from 'state/hooks';
import Badge from '@material-ui/core/Badge';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Web3Service } from 'types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import WalletMenu from 'common/wallet-menu';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

const StyledButtonContainer = styled.div<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.breakpoint === 'xs' ? 'center' : 'flex-end')};
`;

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
`;

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
  const currentBreakPoint = useCurrentBreakpoint();

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
      <Badge
        badgeContent={
          hasPendingTransactions ? <CircularProgress size={10} /> : Object.keys(transactions).length - badge
        }
        color="secondary"
        component="div"
      >
        <StyledButton
          aria-controls="customized-menu"
          aria-haspopup="true"
          color="primary"
          onClick={onOpen}
          style={{ maxWidth: '200px', textTransform: 'none' }}
        >
          <Typography noWrap>{web3Service.getAccount()}</Typography>
        </StyledButton>
      </Badge>
      <WalletMenu open={shouldOpenMenu} onClose={() => setShouldOpenMenu(false)} />
    </>
  );
};

export default WalletButton;
