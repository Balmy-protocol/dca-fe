import React from 'react';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import Modal from 'common/modal';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  useAllNotClearedTransactions,
  useHasPendingTransactions,
  useIsTransactionPending,
} from 'state/transactions/hooks';
import { NetworkStruct, TransactionDetails } from 'types';
import useBuildTransactionDetail from 'hooks/useBuildTransactionDetail';
import { clearAllTransactions } from 'state/transactions/actions';
import { useAppDispatch } from 'state/hooks';
import Link from '@mui/material/Link';
import { buildEtherscanTransaction, buildEtherscanAddress } from 'utils/etherscan';
import useWeb3Service from 'hooks/useWeb3Service';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import MinimalTimeline from 'common/minimal-timeline';
import { NETWORKS, NETWORKS_FOR_MENU } from 'config';
import TokenIcon from 'common/token-icon';
import { emptyTokenWithAddress } from 'utils/currency';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'};
    text-align: start;
  `}
`;

const StyledAccount = styled.div`
  padding: 14px 16px;
  font-weight: 500;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
`;

const StyledWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: start;
`;

const StyledWalletInformationContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
`;

const StyledRecentTransactionsTitleContainer = styled.div<{ withMargin?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) => (props.withMargin ? 'margin-bottom: 10px' : '')};
`;

interface WalletMenuProps {
  open: boolean;
  onClose: () => void;
}

const WalletMenu = ({ open, onClose }: WalletMenuProps) => {
  const allTransactions = useAllNotClearedTransactions();
  const hasPendingTransactions = useHasPendingTransactions();
  const isPendingTransaction = useIsTransactionPending();
  const buildTransactionDetail = useBuildTransactionDetail();
  const dispatch = useAppDispatch();
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const currentNetwork = useCurrentNetwork();

  const networks = React.useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      NETWORKS_FOR_MENU.reduce<Record<number, NetworkStruct>>(
        (acc, chainId) => ({ ...acc, [chainId]: find(NETWORKS, { chainId })! }),
        {}
      ),
    []
  );

  const allOrderedTransactions = React.useMemo(
    () =>
      orderBy(
        values(allTransactions).map((transaction: TransactionDetails) => ({
          ...transaction,
          isPending: isPendingTransaction(transaction.hash),
        })),
        'addedTime',
        'desc'
      ),
    [allTransactions, hasPendingTransactions, currentNetwork]
  );

  const onClearAll = () => {
    dispatch(clearAllTransactions({ chainId: currentNetwork.chainId }));
  };
  const onDisconnect = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    web3Service.disconnect();
    onClearAll();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="walletSettings" defaultMessage="Wallet settings" />}
    >
      <StyledWalletContainer>
        <StyledWalletInformationContainer>
          <StyledRecentTransactionsTitleContainer>
            <Typography variant="body2" component="span">
              <FormattedMessage
                description="connected with"
                defaultMessage="Connected with {provider}"
                values={{ provider: web3Service.getProviderInfo().name }}
              />
            </Typography>
            <Button variant="text" color="error" size="small" onClick={onDisconnect}>
              <FormattedMessage description="disconnect" defaultMessage="Disconnect" />
            </Button>
          </StyledRecentTransactionsTitleContainer>
          <StyledAccount>
            <Typography variant="subtitle1" fontWeight={500}>
              {account}
            </Typography>
          </StyledAccount>
          <StyledLink
            underline="none"
            href={buildEtherscanAddress(web3Service.getAccount(), currentNetwork.chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="body2" component="span">
              <FormattedMessage description="view on etherscan" defaultMessage="View on explorer" />
            </Typography>
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </StyledLink>
        </StyledWalletInformationContainer>
        <StyledRecentTransactionsTitleContainer withMargin>
          <Typography variant="h6">
            <FormattedMessage description="recent transactions" defaultMessage="Recent transactions" />
          </Typography>
        </StyledRecentTransactionsTitleContainer>
        <MinimalTimeline
          items={allOrderedTransactions.map((transaction) => ({
            content: buildTransactionDetail(transaction),
            link: buildEtherscanTransaction(transaction.hash, transaction.chainId || currentNetwork.chainId),
            isPending: transaction.isPending,
            icon: networks[transaction.chainId] && (
              <TokenIcon size="20px" token={emptyTokenWithAddress(networks[transaction.chainId]?.mainCurrency || '')} />
            ),
          }))}
        />
      </StyledWalletContainer>
    </Modal>
  );
};

export default WalletMenu;
