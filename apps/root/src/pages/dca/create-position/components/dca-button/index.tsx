import React from 'react';
import styled from 'styled-components';
import isUndefined from 'lodash/isUndefined';
import find from 'lodash/find';
import { Tooltip, HelpOutlineIcon, Button } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';

import { formatCurrencyAmount, usdPriceToToken } from '@common/utils/currency';
import {
  DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT,
  MINIMUM_USD_RATE_FOR_DEPOSIT,
  NETWORKS,
  POSSIBLE_ACTIONS,
  STRING_SWAP_INTERVALS,
  SUPPORTED_NETWORKS_DCA,
  TESTNETS,
  WHALE_MINIMUM_VALUES,
  WHALE_MODE_FREQUENCIES,
} from '@constants';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useCanSupportPair from '@hooks/useCanSupportPair';
import { useCreatePositionState } from '@state/create-position/hooks';
import { formatUnits, maxUint32, parseUnits } from 'viem';
import { EMPTY_TOKEN, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useWalletService from '@hooks/useWalletService';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useAppDispatch } from '@state/hooks';
import { setNetwork } from '@state/config/actions';
import { NetworkStruct, WalletStatus } from '@types';
import useTrackEvent from '@hooks/useTrackEvent';
import useActiveWallet from '@hooks/useActiveWallet';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useWallets from '@hooks/useWallets';
import { getDisplayWallet } from '@common/utils/parsing';

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
`;

interface DcaButtonProps {
  cantFund: boolean;
  usdPrice?: bigint;
  shouldEnableYield: boolean;
  balance?: bigint;
  isApproved: boolean;
  rateUsdPrice: number;
  fromValueUsdPrice: number;
  allowanceErrors?: string;
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  isLoadingUsdPrice: boolean;
  onClick: (actionToDo: keyof typeof POSSIBLE_ACTIONS, amount?: bigint) => void;
  hasSetPeriodAmount: boolean;
}

const DcaButton = ({
  cantFund,
  usdPrice,
  isApproved,
  allowanceErrors,
  shouldEnableYield,
  balance,
  fromCanHaveYield,
  toCanHaveYield,
  isLoadingUsdPrice,
  onClick,
  rateUsdPrice,
  fromValueUsdPrice,
  hasSetPeriodAmount,
}: DcaButtonProps) => {
  const { from, to, fromValue, frequencyType, fromYield, toYield, frequencyValue } = useCreatePositionState();
  const currentNetwork = useSelectedNetwork();
  const intl = useIntl();
  const actualCurrentNetwork = useCurrentNetwork();
  const walletService = useWalletService();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const [pairIsSupported, isLoadingPairIsSupported] = useCanSupportPair(from, to, currentNetwork.chainId);
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const replaceHistory = useReplaceHistory();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const reconnectingWallet = activeWallet || find(wallets, { isAuth: true });
  const reconnectingWalletDisplay = getDisplayWallet(reconnectingWallet);
  const { openConnectModal } = useOpenConnectModal();
  const hasEnoughUsdForDeposit =
    currentNetwork.testnet ||
    (!isUndefined(usdPrice) &&
      rateUsdPrice >=
        (isUndefined(MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId])
          ? DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT
          : MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId]));

  const swapsIsMax = BigInt(frequencyValue || '0') > maxUint32;

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    !frequencyValue ||
    cantFund ||
    !balance ||
    allowanceErrors ||
    parseUnits(fromValue, from.decimals) <= 0 ||
    BigInt(frequencyValue) <= 0 ||
    (shouldEnableYield && fromCanHaveYield && isUndefined(fromYield)) ||
    (shouldEnableYield && toCanHaveYield && isUndefined(toYield));

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

  const isTestnet = TESTNETS.includes(currentNetwork.chainId);

  let shouldShowNotEnoughForWhale =
    from &&
    (WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
      frequencyType.toString()
    ) &&
    fromValue &&
    frequencyValue &&
    !isLoadingUsdPrice &&
    usdPrice &&
    parseFloat(formatUnits(parseUnits(fromValue, from.decimals) * BigInt(frequencyValue), from.decimals)) *
      fromValueUsdPrice <
      (WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] || Infinity);

  shouldShowNotEnoughForWhale =
    !isTestnet &&
    (shouldShowNotEnoughForWhale ||
      (!usdPrice &&
        (WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
          frequencyType.toString()
        )));

  const minimumTokensNeeded = usdPriceToToken(
    from,
    isUndefined(MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId])
      ? DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT
      : MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId],
    usdPrice
  );

  const onChangeNetwork = (chainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, activeWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId });
      replaceHistory(`/create/${chainId}`);
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('DCA - Change network', { chainId });
  };

  const NotConnectedButton = (
    <StyledButton size="large" variant="contained" fullWidth color="error">
      <FormattedMessage description="wrong chainId" defaultMessage="We do not support this chain yet" />
    </StyledButton>
  );

  const NoWalletButton = (
    <StyledButton size="large" variant="contained" fullWidth onClick={() => openConnectModal()}>
      <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
    </StyledButton>
  );

  const ReconnectWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={() => openConnectModal(true)}>
      <FormattedMessage
        description="reconnect wallet"
        defaultMessage="Switch to {wallet}'s Wallet"
        values={{
          wallet: reconnectingWalletDisplay
            ? `${reconnectingWalletDisplay}`
            : intl.formatMessage(
                defineMessage({
                  description: 'reconnectWalletFallback',
                  defaultMessage: 'Owner',
                })
              ),
        }}
      />
    </Button>
  );

  const IncorrectNetworkButton = (
    <StyledButton size="large" variant="contained" onClick={() => onChangeNetwork(currentNetwork.chainId)} fullWidth>
      <FormattedMessage
        description="incorrect network"
        defaultMessage="Change network to {network}"
        values={{ network: currentNetwork.name }}
      />
    </StyledButton>
  );

  const StartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale || swapsIsMax}
      fullWidth
      onClick={() => onClick(POSSIBLE_ACTIONS.createPosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && swapsIsMax && (
        <FormattedMessage
          description="swapsCannotBeMax"
          defaultMessage="Amount of swaps cannot be higher than {MAX_UINT_32}"
          values={{ MAX_UINT_32: maxUint32.toString() }}
        />
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && !swapsIsMax && (
        <FormattedMessage description="create position" defaultMessage="Create position" />
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && !swapsIsMax && (
        <FormattedMessage
          description="notenoughwhale"
          defaultMessage="You can only deposit with a minimum value of {value} USD"
          values={{ value: WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] }}
        />
      )}
      {(isLoadingPairIsSupported || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const SafeApproveAndStartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale || swapsIsMax}
      fullWidth
      onClick={() => onClick(POSSIBLE_ACTIONS.safeApproveAndCreatePosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && swapsIsMax && (
        <FormattedMessage
          description="swapsCannotBeMax"
          defaultMessage="Amount of swaps cannot be higher than {MAX_UINT_32}"
          values={{ MAX_UINT_32: maxUint32.toString() }}
        />
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && !swapsIsMax && (
        <FormattedMessage
          description="approve and create position"
          defaultMessage="Authorize {from} and create position"
          values={{ from: from?.symbol || '' }}
        />
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && !swapsIsMax && (
        <FormattedMessage
          description="notenoughwhale"
          defaultMessage="You can only deposit with a minimum value of {value} USD"
          values={{ value: WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] }}
        />
      )}
      {(isLoadingPairIsSupported || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const NoFundsButton = (
    <StyledButton size="large" variant="contained" fullWidth disabled>
      <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
    </StyledButton>
  );

  const NoMinForDepositButton = (
    <StyledButton size="large" variant="contained" fullWidth disabled>
      <FormattedMessage
        description="disabledDepositByUsdValue"
        // eslint-disable-next-line no-template-curly-in-string
        defaultMessage="The position must have a minimum rate of ${minimum} USD ({minToken} {symbol}) per {frequency} to be created."
        values={{
          minimum: isUndefined(MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId])
            ? DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT
            : MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId],
          minToken: formatCurrencyAmount({
            amount: minimumTokensNeeded,
            token: from || EMPTY_TOKEN,
            sigFigs: 3,
            maxDecimals: 3,
            intl,
          }),
          symbol: from?.symbol || '',
          frequency: intl.formatMessage(
            STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].singularSubject
          ),
        }}
      />
    </StyledButton>
  );

  const PairNotSupportedButton = (
    <StyledButton size="large" color="error" variant="contained" fullWidth disabled style={{ pointerEvents: 'all' }}>
      <FormattedMessage description="pairNotOnUniswap" defaultMessage="We do not support this pair" />
      <Tooltip
        title="If you want to use this pair of tokens you must first create a pool for it on UniswapV3"
        arrow
        placement="top"
      >
        <StyledHelpOutlineIcon fontSize="small" />
      </Tooltip>
    </StyledButton>
  );

  const LoadingButton = (
    <StyledButton size="large" variant="contained" fullWidth disabled>
      <CenteredLoadingIndicator />
    </StyledButton>
  );

  const ApproveTokenButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale || swapsIsMax}
      fullWidth
      onClick={() => onClick(POSSIBLE_ACTIONS.approveAndCreatePosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && swapsIsMax && (
        <FormattedMessage
          description="swapsCannotBeMax"
          defaultMessage="Amount of swaps cannot be higher than {MAX_UINT_32}"
          values={{ MAX_UINT_32: maxUint32.toString() }}
        />
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && !swapsIsMax && (
        <FormattedMessage description="create position" defaultMessage="Authorize and create position" />
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && !swapsIsMax && (
        <FormattedMessage
          description="notenoughwhale"
          defaultMessage="You can only deposit with a minimum value of {value} USD"
          values={{ value: WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] }}
        />
      )}
      {(isLoadingPairIsSupported || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  let ButtonToShow;

  if (!activeWallet?.address && !wallets.length) {
    ButtonToShow = NoWalletButton;
  } else if (
    (!activeWallet?.address && wallets.length > 0) ||
    (activeWallet && activeWallet.status === WalletStatus.disconnected)
  ) {
    ButtonToShow = ReconnectWalletButton;
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (!SUPPORTED_NETWORKS_DCA.includes(currentNetwork.chainId)) {
    ButtonToShow = NotConnectedButton;
  } else if (isLoadingPairIsSupported) {
    ButtonToShow = LoadingButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (!pairIsSupported && !isLoadingPairIsSupported && from && to) {
    ButtonToShow = PairNotSupportedButton;
  } else if (hasSetPeriodAmount && !hasEnoughUsdForDeposit) {
    ButtonToShow = NoMinForDepositButton;
  } else if (!isApproved && balance && balance > 0n && to && loadedAsSafeApp) {
    ButtonToShow = SafeApproveAndStartPositionButton;
  } else if (from?.address !== PROTOCOL_TOKEN_ADDRESS) {
    ButtonToShow = ApproveTokenButton;
  } else {
    ButtonToShow = StartPositionButton;
  }

  return ButtonToShow;
};

export default DcaButton;
