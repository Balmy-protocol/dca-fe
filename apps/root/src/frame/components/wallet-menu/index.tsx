import React from 'react';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import Button from '@common/components/button';
import { Typography, Link, OpenInNewIcon } from 'ui-library';
import Modal from '@common/components/modal';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  useAllNotClearedTransactions,
  useHasPendingTransactions,
  useIsTransactionPending,
} from '@state/transactions/hooks';
import { NetworkStruct, TransactionDetails, UserType } from '@types';
import useBuildTransactionDetail from '@hooks/useBuildTransactionDetail';
import { clearAllTransactions, removeTransaction } from '@state/transactions/actions';
import { useAppDispatch } from '@state/hooks';
import { buildEtherscanTransaction, buildEtherscanAddress } from '@common/utils/etherscan';
import useWeb3Service from '@hooks/useWeb3Service';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { getGhTokenListLogoUrl, NETWORKS } from '@constants';
import TokenIcon from '@common/components/token-icon';
import { toToken } from '@common/utils/currency';
import Address from '@common/components/address';
import MinimalTimeline from './components/minimal-timeline';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import WalletIcon from '@mui/icons-material/Wallet';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import DiscordIcon from '@assets/svg/atom/discord';
import GitHubIcon from '@mui/icons-material/GitHub';
import { WalletWithMetadata, useLogout, usePrivy } from '@privy-io/react-auth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useUser from '@hooks/useUser';
import useAccountService from '@hooks/useAccountService';
import useActiveWallet from '@hooks/useActiveWallet';
import useWallets from '@hooks/useWallets';
import { find } from 'lodash';

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

const StyledExternalAccount = styled(StyledAccount)`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledCheckCircleOutlineIcon = styled(CheckCircleOutlineIcon)`
  color: rgb(17 147 34);
`;

const StyledWalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: start;
  flex: 1;
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

const StyledLoginOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const StyledExternalWalletsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

interface WalletMenuProps {
  open: boolean;
  onClose: () => void;
}

const WalletMenu = ({ open, onClose }: WalletMenuProps) => {
  const { linkDiscord, linkEmail, linkTwitter, linkWallet, linkGoogle, linkApple, linkGithub } = usePrivy();
  const { logout } = useLogout();
  const user = useUser();
  const wallets = useWallets();
  const accountService = useAccountService();
  const allTransactions = useAllNotClearedTransactions();
  const hasPendingTransactions = useHasPendingTransactions();
  const isPendingTransaction = useIsTransactionPending();
  const buildTransactionDetail = useBuildTransactionDetail();
  const dispatch = useAppDispatch();
  const web3Service = useWeb3Service();
  const activeWallet = useActiveWallet();
  const account = activeWallet?.address;
  const currentNetwork = useCurrentNetwork();

  const networks = React.useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.keys(NETWORKS).reduce<Record<number, NetworkStruct>>(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (acc, chainId) => ({ ...acc, [NETWORKS[chainId].chainId]: NETWORKS[chainId] }),
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

  const onSetActiveWallet = React.useCallback(
    (wallet: string) => {
      void accountService.setActiveWallet(wallet);
    },
    [accountService]
  );

  const onClearAll = () => {
    dispatch(clearAllTransactions({ chainId: currentNetwork.chainId }));
  };
  const onDisconnect = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    web3Service.disconnect();
    onClearAll();
    onClose();
    void logout();
  };

  const onRemoveTransactionItem = ({ hash, chainId }: { hash: string; chainId: number }) => {
    dispatch(removeTransaction({ hash, chainId }));
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
              <Address address={account || ''} trimAddress trimSize={10} />
            </Typography>
          </StyledAccount>
          {user?.type === UserType.privy && (
            <>
              <Typography variant="body2" component="span">
                <FormattedMessage description="connect another account" defaultMessage="Connect another account:" />
              </Typography>
              <StyledLoginOptionsContainer>
                <Button
                  variant="outlined"
                  color="default"
                  disabled={!!user.privyUser?.discord}
                  onClick={linkDiscord}
                  endIcon={user.privyUser?.discord ? <StyledCheckCircleOutlineIcon /> : null}
                >
                  <DiscordIcon size="24px" />
                  {user.privyUser?.discord?.username}
                </Button>
                <Button
                  variant="outlined"
                  color="default"
                  disabled={!!user.privyUser?.email}
                  onClick={linkEmail}
                  endIcon={user.privyUser?.email ? <StyledCheckCircleOutlineIcon /> : null}
                >
                  <EmailIcon />
                  {user.privyUser?.email?.address}
                </Button>
                <Button
                  variant="outlined"
                  color="default"
                  disabled={!!user.privyUser?.twitter}
                  onClick={linkTwitter}
                  endIcon={user.privyUser?.twitter ? <StyledCheckCircleOutlineIcon /> : null}
                >
                  <TwitterIcon />
                  {user.privyUser?.twitter?.username}
                </Button>
                <Button variant="outlined" color="default" onClick={linkWallet}>
                  <WalletIcon />
                </Button>
                <Button
                  variant="outlined"
                  color="default"
                  disabled={!!user.privyUser?.google}
                  onClick={linkGoogle}
                  endIcon={user.privyUser?.google ? <StyledCheckCircleOutlineIcon /> : null}
                >
                  <GoogleIcon />
                  {user.privyUser?.google?.name}({user.privyUser?.google?.email})
                </Button>
                <Button
                  variant="outlined"
                  color="default"
                  disabled={!!user.privyUser?.apple}
                  onClick={linkApple}
                  endIcon={user.privyUser?.apple ? <StyledCheckCircleOutlineIcon /> : null}
                >
                  <AppleIcon />
                  {user.privyUser?.apple?.email}
                </Button>
                <Button
                  variant="outlined"
                  color="default"
                  disabled={!!user.privyUser?.github}
                  onClick={linkGithub}
                  endIcon={user.privyUser?.github ? <StyledCheckCircleOutlineIcon /> : null}
                >
                  <GitHubIcon />
                  {user.privyUser?.github?.username}
                </Button>
              </StyledLoginOptionsContainer>
              <StyledExternalWalletsContainer>
                <Typography variant="body2" component="span">
                  <FormattedMessage description="connected wallets" defaultMessage="Connected external wallets:" />
                </Typography>
                {user.privyUser?.linkedAccounts
                  .filter((linkedAccount) => linkedAccount.type === 'wallet')
                  .map((wallet: WalletWithMetadata) => {
                    const walletIsConnected = find(wallets, { address: wallet.address.toLowerCase() });
                    return (
                      <StyledExternalAccount key={wallet.address}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          <Address address={wallet.address} trimAddress trimSize={10} /> connected with:{' '}
                          {wallet.walletClientType}
                        </Typography>
                        <Button
                          disabled={wallet.address.toLowerCase() === account?.toLowerCase() || !walletIsConnected}
                          variant="contained"
                          color="secondary"
                          onClick={() => onSetActiveWallet(wallet.address)}
                        >
                          {walletIsConnected ? (
                            <FormattedMessage description="setAsActive" defaultMessage="Set as active wallet" />
                          ) : (
                            <FormattedMessage description="walletNotConnected" defaultMessage="Wallet not connected" />
                          )}
                        </Button>
                      </StyledExternalAccount>
                    );
                  })}
              </StyledExternalWalletsContainer>
            </>
          )}
          <StyledLink
            underline="none"
            href={buildEtherscanAddress(activeWallet?.address || '', currentNetwork.chainId)}
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
          items={allOrderedTransactions.map((transaction) => {
            const chainId = transaction.chainId || transaction.position?.chainId;

            return {
              content: buildTransactionDetail(transaction),
              link: buildEtherscanTransaction(
                transaction.realSafeHash || transaction.hash,
                transaction.chainId || currentNetwork.chainId
              ),
              isPending: transaction.isPending,
              id: transaction.hash,
              contextMenu: [
                {
                  label: <FormattedMessage description="ignoretransaction" defaultMessage="Ignore transaction" />,
                  action: onRemoveTransactionItem,
                  extraData: {
                    hash: transaction.hash,
                    chainId,
                  },
                },
              ],
              icon:
                (chainId && networks[chainId] && (
                  <TokenIcon
                    size="20px"
                    token={toToken({
                      address: networks[chainId].mainCurrency,
                      chainId,
                      logoURI: getGhTokenListLogoUrl(chainId, 'logo'),
                    })}
                  />
                )) ||
                undefined,
            };
          })}
        />
      </StyledWalletContainer>
    </Modal>
  );
};

export default WalletMenu;
