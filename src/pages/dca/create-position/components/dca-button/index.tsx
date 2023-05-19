import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import isUndefined from 'lodash/isUndefined';
import find from 'lodash/find';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { FormattedMessage, useIntl } from 'react-intl';
import AllowanceSplitButton from '@common/components/allowance-split-button';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount, usdPriceToToken } from '@common/utils/currency';
import {
  DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT,
  MAX_UINT_32,
  MINIMUM_USD_RATE_FOR_DEPOSIT,
  NETWORKS,
  POSSIBLE_ACTIONS,
  STRING_SWAP_INTERVALS,
  SUPPORTED_NETWORKS,
  TESTNETS,
  WHALE_MINIMUM_VALUES,
  WHALE_MODE_FREQUENCIES,
} from '@constants';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useWeb3Service from '@hooks/useWeb3Service';
import { useHasConfirmedApproval, useHasPendingApproval, useHasPendingPairCreation } from '@state/transactions/hooks';
import useCanSupportPair from '@hooks/useCanSupportPair';
import { useCreatePositionState } from '@state/create-position/hooks';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { Allowance } from '@hooks/useAllowance';
import { EMPTY_TOKEN, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useWalletService from '@hooks/useWalletService';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useAppDispatch } from '@state/hooks';
import { setNetwork } from '@state/config/actions';
import { NetworkStruct } from '@types';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledButton = styled(Button)`
  padding: 10px 18px;
  border-radius: 12px;
`;

interface DcaButtonProps {
  handleSetStep: (newStep: number) => void;
  cantFund: boolean;
  usdPrice?: BigNumber;
  shouldEnableYield: boolean;
  balance?: BigNumber;
  allowance: Allowance;
  rateUsdPrice: number;
  fromValueUsdPrice: number;
  balanceErrors?: string;
  allowanceErrors?: string;
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  isLoadingUsdPrice: boolean;
  step: 0 | 1;
  onClick: (actionToDo: keyof typeof POSSIBLE_ACTIONS, amount?: BigNumber) => void;
}

const DcaButton = ({
  cantFund,
  usdPrice,
  allowance,
  allowanceErrors,
  shouldEnableYield,
  balance,
  balanceErrors,
  fromCanHaveYield,
  toCanHaveYield,
  isLoadingUsdPrice,
  handleSetStep,
  step,
  onClick,
  rateUsdPrice,
  fromValueUsdPrice,
}: DcaButtonProps) => {
  const { from, to, fromValue, frequencyType, fromYield, toYield, frequencyValue } = useCreatePositionState();
  const currentNetwork = useSelectedNetwork();
  const { openConnectModal } = useConnectModal();
  const intl = useIntl();
  const actualCurrentNetwork = useCurrentNetwork();
  const walletService = useWalletService();
  const web3Service = useWeb3Service();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const isCreatingPair = useHasPendingPairCreation(from, to);
  const hasPendingApproval = useHasPendingApproval(from, web3Service.getAccount(), !!fromYield?.tokenAddress);
  const [pairIsSupported, isLoadingPairIsSupported] = useCanSupportPair(from, to);
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const replaceHistory = useReplaceHistory();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  const hasConfirmedApproval = useHasConfirmedApproval(from, web3Service.getAccount(), !!fromYield?.tokenAddress);

  const hasEnoughUsdForDeposit =
    currentNetwork.testnet ||
    (!isUndefined(usdPrice) &&
      rateUsdPrice >=
        (isUndefined(MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId])
          ? DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT
          : MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId]));

  const isApproved =
    !from ||
    hasConfirmedApproval ||
    (from &&
      (!fromValue
        ? true
        : (allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  const swapsIsMax = BigNumber.from(frequencyValue || '0').gt(BigNumber.from(MAX_UINT_32));

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    !frequencyValue ||
    cantFund ||
    !balance ||
    balanceErrors ||
    allowanceErrors ||
    parseUnits(fromValue, from.decimals).lte(BigNumber.from(0)) ||
    BigNumber.from(frequencyValue).lte(BigNumber.from(0)) ||
    (shouldEnableYield && fromCanHaveYield && isUndefined(fromYield)) ||
    (shouldEnableYield && toCanHaveYield && isUndefined(toYield));

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

  const isApproveTokenDisabled = !!isApproved || hasPendingApproval || !!shouldDisableApproveButton;

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
    parseFloat(formatUnits(parseUnits(fromValue, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) *
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
    walletService.changeNetwork(chainId, () => {
      const networkToSet = find(NETWORKS, { chainId });
      replaceHistory(`/create/${chainId}`);
      dispatch(setNetwork(networkToSet as NetworkStruct));
      if (networkToSet) {
        web3Service.setNetwork(networkToSet?.chainId);
      }
    });
    trackEvent('DCA - Change network', { chainId });
  };

  const NotConnectedButton = (
    <StyledButton size="large" variant="contained" fullWidth color="error">
      <Typography variant="body1">
        <FormattedMessage description="wrong chainId" defaultMessage="We do not support this chain yet" />
      </Typography>
    </StyledButton>
  );

  const NoWalletButton = (
    <StyledButton size="large" color="primary" variant="contained" fullWidth onClick={openConnectModal}>
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

  const ApproveTokenButton = (
    <AllowanceSplitButton
      onMaxApprove={() => onClick(POSSIBLE_ACTIONS.approveToken as keyof typeof POSSIBLE_ACTIONS)}
      onApproveExact={(amount) => onClick(POSSIBLE_ACTIONS.approveTokenExact as keyof typeof POSSIBLE_ACTIONS, amount)}
      amount={from && (fromValue ? parseUnits(fromValue, from?.decimals) : null)}
      disabled={isApproveTokenDisabled}
      token={from}
      tokenYield={fromYield}
    />
  );

  const StartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableButton || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale || swapsIsMax}
      color="secondary"
      fullWidth
      onClick={() => onClick(POSSIBLE_ACTIONS.createPosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage
            description="swapsCannotBeMax"
            defaultMessage="Amount of swaps cannot be higher than {MAX_UINT_32}"
            values={{ MAX_UINT_32 }}
          />
        </Typography>
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && !swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage description="create position" defaultMessage="Create position" />
        </Typography>
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && !swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage
            description="notenoughwhale"
            defaultMessage="You can only deposit with a minimum value of {value} USD"
            values={{ value: WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] }}
          />
        </Typography>
      )}
      {(isLoadingPairIsSupported || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const SafeApproveAndStartPositionButton = (
    <StyledButton
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton || isLoadingPairIsSupported || !!shouldShowNotEnoughForWhale || swapsIsMax}
      color="secondary"
      fullWidth
      onClick={() => onClick(POSSIBLE_ACTIONS.approveAndCreatePosition as keyof typeof POSSIBLE_ACTIONS)}
    >
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage
            description="swapsCannotBeMax"
            defaultMessage="Amount of swaps cannot be higher than {MAX_UINT_32}"
            values={{ MAX_UINT_32 }}
          />
        </Typography>
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && !shouldShowNotEnoughForWhale && !swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage
            description="approve and create position"
            defaultMessage="Approve {from} and create position"
            values={{ from: from?.symbol || '' }}
          />
        </Typography>
      )}
      {!isLoadingPairIsSupported && !isLoadingUsdPrice && shouldShowNotEnoughForWhale && !swapsIsMax && (
        <Typography variant="body1">
          <FormattedMessage
            description="notenoughwhale"
            defaultMessage="You can only deposit with a minimum value of {value} USD"
            values={{ value: WHALE_MINIMUM_VALUES[currentNetwork.chainId][frequencyType.toString()] }}
          />
        </Typography>
      )}
      {(isLoadingPairIsSupported || isLoadingUsdPrice) && <CenteredLoadingIndicator />}
    </StyledButton>
  );

  const CreatingPairButton = (
    <StyledButton size="large" variant="contained" disabled color="secondary" fullWidth>
      <Typography variant="body1">
        <FormattedMessage description="creating pair" defaultMessage="Creating this pair" />
      </Typography>
    </StyledButton>
  );

  const NoFundsButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <Typography variant="body1">
        <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
      </Typography>
    </StyledButton>
  );

  const NoMinForDepositButton = (
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <Typography variant="body1">
        <FormattedMessage
          description="disabledDepositByUsdValue"
          // eslint-disable-next-line no-template-curly-in-string
          defaultMessage="The position must have a minimum rate of ${minimum} USD ({minToken} {symbol}) per {frequency} to be created."
          values={{
            minimum: isUndefined(MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId])
              ? DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT
              : MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId],
            minToken: formatCurrencyAmount(minimumTokensNeeded, from || EMPTY_TOKEN, 3, 3),
            symbol: from?.symbol || '',
            frequency: intl.formatMessage(
              STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].singularSubject
            ),
          }}
        />
      </Typography>
    </StyledButton>
  );

  const PairNotSupportedButton = (
    <StyledButton size="large" color="error" variant="contained" fullWidth disabled style={{ pointerEvents: 'all' }}>
      <Typography variant="body1">
        <FormattedMessage description="pairNotOnUniswap" defaultMessage="We do not support this pair" />
      </Typography>
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
    <StyledButton size="large" color="default" variant="contained" fullWidth disabled>
      <CenteredLoadingIndicator />
    </StyledButton>
  );

  const NextStepButton = (
    <StyledButton
      size="large"
      disabled={!from || !to || !fromValue || parseFloat(fromValue) === 0 || !frequencyValue || frequencyValue === '0'}
      color="secondary"
      variant="contained"
      fullWidth
      onClick={() => handleSetStep(1)}
    >
      <Typography variant="body1">
        <FormattedMessage description="continue" defaultMessage="Continue" />
      </Typography>
    </StyledButton>
  );

  let ButtonToShow;

  if (!web3Service.getAccount()) {
    ButtonToShow = NoWalletButton;
  } else if (!SUPPORTED_NETWORKS.includes(currentNetwork.chainId)) {
    ButtonToShow = NotConnectedButton;
  } else if (isLoadingPairIsSupported) {
    ButtonToShow = LoadingButton;
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (!pairIsSupported && !isLoadingPairIsSupported && from && to) {
    ButtonToShow = PairNotSupportedButton;
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (step === 0) {
    ButtonToShow = NextStepButton;
  } else if (!hasEnoughUsdForDeposit) {
    ButtonToShow = NoMinForDepositButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to && loadedAsSafeApp) {
    ButtonToShow = SafeApproveAndStartPositionButton;
  } else if (!isApproved && balance && balance.gt(BigNumber.from(0)) && to) {
    ButtonToShow = ApproveTokenButton;
  } else if (isCreatingPair) {
    ButtonToShow = CreatingPairButton;
  } else {
    ButtonToShow = StartPositionButton;
  }

  return ButtonToShow;
};

export default DcaButton;
