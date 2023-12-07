import React from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '@state/hooks';
import { useAllTransactions, useHasPendingTransactions } from '@state/transactions/hooks';
import { useBadgeNumber } from '@state/transactions-badge/hooks';
import { updateBadgeNumber } from '@state/transactions-badge/actions';
import { Typography, Badge, CircularProgress, createStyles, Button } from 'ui-library';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import Address from '@common/components/address';
import { withStyles } from 'tss-react/mui';
import TokenIcon from '@common/components/token-icon';
import { getGhTokenListLogoUrl, NETWORKS } from '@constants';
import { find } from 'lodash';
import { toToken } from '@common/utils/currency';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import WalletMenu from '../wallet-menu';
import useActiveWallet from '@hooks/useActiveWallet';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  padding: 4px 8px;
`;

const StyledBadge = withStyles(Badge, () =>
  createStyles({
    badge: {
      padding: '2px 6px',
    },
  })
);

const StyledTokenIconContainer = styled.div<{ small: boolean }>`
  margin-right: ${({ small }) => (small ? '0px' : '5px')};
  display: flex;
`;

interface ConnectWalletButtonProps {
  isLoading: boolean;
}

const WalletButton = ({ isLoading }: ConnectWalletButtonProps) => {
  const transactions = useAllTransactions();
  const [shouldOpenMenu, setShouldOpenMenu] = React.useState(false);
  const currentBreakPoint = useCurrentBreakpoint();
  const hasPendingTransactions = useHasPendingTransactions();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const badge = useBadgeNumber(currentNetwork.chainId);
  const activeWallet = useActiveWallet();

  const onOpen = () => {
    dispatch(
      updateBadgeNumber({
        viewedTransactions: Object.keys(transactions).length - (hasPendingTransactions ? 1 : 0),
        chainId: currentNetwork.chainId,
      })
    );
    setShouldOpenMenu(!shouldOpenMenu);
  };

  const foundNetwork = find(NETWORKS, { chainId: currentNetwork.chainId });

  if (isLoading || !activeWallet?.address) return null;

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
          color="secondary"
          variant="outlined"
          onClick={onOpen}
          style={{ maxWidth: '220px', textTransform: 'none', display: 'flex', alignItems: 'center' }}
        >
          <StyledTokenIconContainer small={false}>
            <TokenIcon
              size={currentBreakPoint === 'xs' ? '25px' : '20px'}
              token={toToken({
                address: foundNetwork?.mainCurrency || '',
                chainId: (foundNetwork || currentNetwork).chainId,
                logoURI: getGhTokenListLogoUrl((foundNetwork || currentNetwork).chainId, 'logo'),
              })}
            />
          </StyledTokenIconContainer>
          <Typography noWrap>
            <Address address={activeWallet?.address || ''} trimAddress />
          </Typography>
        </StyledButton>
      </StyledBadge>
      <WalletMenu open={shouldOpenMenu} onClose={() => setShouldOpenMenu(false)} />
    </>
  );
};

export default WalletButton;
