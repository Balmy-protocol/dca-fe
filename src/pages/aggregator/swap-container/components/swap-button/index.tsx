import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import Typography from '@mui/material/Typography';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'ethers';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useWeb3Service from '@hooks/useWeb3Service';
import { parseUnits } from '@ethersproject/units';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import { useAggregatorState } from '@state/aggregator/hooks';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useWalletService from '@hooks/useWalletService';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useAppDispatch } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
import { NetworkStruct } from '@types';

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
`;

interface SwapButtonProps {
  fromValue: string;
  cantFund: boolean;
  balance?: BigNumber;
  balanceErrors?: string;
  allowanceErrors?: string;
  isLoadingRoute: boolean;
  transactionWillFail: boolean;
  isApproved: boolean;
  handleMultiSteps: () => void;
  handleSwap: () => void;
  handleSafeApproveAndSwap: () => void;
}

const SwapButton = ({
  cantFund,
  fromValue,
  isApproved,
  allowanceErrors,
  balance,
  balanceErrors,
  isLoadingRoute,
  transactionWillFail,
  handleMultiSteps,
  handleSwap,
  handleSafeApproveAndSwap,
}: SwapButtonProps) => {
  const { from, to, selectedRoute } = useAggregatorState();
  const currentNetwork = useSelectedNetwork();
  const { openConnectModal } = useConnectModal();
  const actualCurrentNetwork = useCurrentNetwork();
  const web3Service = useWeb3Service();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const walletService = useWalletService();
  const replaceHistory = useReplaceHistory();
  const dispatch = useAppDispatch();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    cantFund ||
    !balance ||
    !selectedRoute ||
    balanceErrors ||
    allowanceErrors ||
    parseUnits(fromValue, selectedRoute?.sellToken.decimals || from.decimals).lte(BigNumber.from(0)) ||
    isLoadingRoute;

  const shouldDisableButton = shouldDisableApproveButton || !isApproved || !selectedRoute.tx || transactionWillFail;

  const onChangeNetwork = (chainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, () => {
      const networkToSet = find(NETWORKS, { chainId });
      replaceHistory(`/swap/${chainId}`);
      dispatch(setNetwork(networkToSet as NetworkStruct));
      if (networkToSet) {
        web3Service.setNetwork(networkToSet?.chainId);
      }
    });
  };

  const NoWalletButton = (
    <StyledButton size="large" color="default" variant="outlined" fullWidth onClick={openConnectModal}>
      <Typography variant="body1">
        <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
      </Typography>
    </StyledButton>
  );

  const IncorrectNetworkButton = (
    <StyledButton
      size="large"
      color="secondary"
      variant="contained"
      onClick={() => onChangeNetwork(currentNetwork.chainId)}
      fullWidth
    >
      <Typography variant="body1">
        <FormattedMessage
          description="incorrect network"
          defaultMessage="Change network to {network}"
          values={{ network: currentNetwork.name }}
        />
      </Typography>
    </StyledButton>
  );

  const ProceedButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      color="secondary"
      fullWidth
      onClick={handleMultiSteps}
    >
      <Typography variant="body1">
        <FormattedMessage description="proceed agg" defaultMessage="Continue" />
      </Typography>
    </StyledButton>
  );

  const ActualSwapButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton}
      color="secondary"
      fullWidth
      onClick={handleSwap}
    >
      {isLoadingRoute && <CenteredLoadingIndicator />}
      {!isLoadingRoute && (
        <Typography variant="body1">
          {from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address && (
            <FormattedMessage description="wrap agg" defaultMessage="Wrap" />
          )}
          {from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS && (
            <FormattedMessage description="unwrap agg" defaultMessage="Unwrap" />
          )}
          {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
            (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
            <FormattedMessage description="swap agg" defaultMessage="Swap" />
          )}
        </Typography>
      )}
    </StyledButton>
  );

  const ApproveAndSwapSafeButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      color="secondary"
      fullWidth
      onClick={handleSafeApproveAndSwap}
    >
      {isLoadingRoute && <CenteredLoadingIndicator />}
      {!isLoadingRoute && (
        <Typography variant="body1">
          {from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address && (
            <FormattedMessage
              description="wrap agg"
              defaultMessage="Approve {from} and wrap"
              values={{ from: from.symbol }}
            />
          )}
          {from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS && (
            <FormattedMessage description="unwrap agg" defaultMessage="Unwrap" />
          )}
          {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
            (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
            <FormattedMessage
              description="approve and swap agg"
              defaultMessage="Approve {from} and swap"
              values={{ from: from?.symbol || '' }}
            />
          )}
        </Typography>
      )}
    </StyledButton>
  );

  const NoFundsButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <Typography variant="body1">
        <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
      </Typography>
    </StyledButton>
  );

  let ButtonToShow;

  if (!web3Service.getAccount()) {
    ButtonToShow = NoWalletButton;
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to && loadedAsSafeApp) {
    ButtonToShow = ApproveAndSwapSafeButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to) {
    ButtonToShow = ProceedButton;
  } else {
    ButtonToShow = ActualSwapButton;
  }

  return ButtonToShow;
};

export default SwapButton;
