import React from 'react';
import styled from 'styled-components';
import { formatUnits, parseUnits } from '@ethersproject/units';
import Modal from '@common/components/modal';
import { Position } from '@types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import useTransactionModal from '@hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useHasPendingApproval, useTransactionAdder } from '@state/transactions/hooks';
import {
  DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT,
  DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
  FULL_DEPOSIT_TYPE,
  MINIMUM_USD_RATE_FOR_DEPOSIT,
  MINIMUM_USD_RATE_FOR_YIELD,
  PERMISSIONS,
  RATE_TYPE,
  STRING_SWAP_INTERVALS,
  TRANSACTION_TYPES,
} from '@constants';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { BigNumber } from 'ethers';
import Grid from '@mui/material/Grid';
import TokenInput from '@common/components/token-input';
import { AllowanceTooltip } from '@common/components/allowance-split-button';
import {
  setFrequencyValue,
  setFromValue,
  setRate,
  setModeType,
  setUseWrappedProtocolToken,
  resetModifySettingsModal,
} from '@state/modify-rate-settings/actions';
import {
  useModifyRateSettingsFrequencyValue,
  useModifyRateSettingsFromValue,
  useModifyRateSettingsModeType,
  useModifyRateSettingsRate,
  useModifyRateSettingsUseWrappedProtocolToken,
} from '@state/modify-rate-settings/hooks';
import useBalance from '@hooks/useBalance';
import { useAppDispatch } from '@state/hooks';
import { getFrequencyLabel } from '@common/utils/parsing';
import { formatCurrencyAmount, parseUsdPrice, usdPriceToToken } from '@common/utils/currency';
import useAllowance from '@hooks/useAllowance';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import { ButtonTypes } from '@common/components/button';
import { SplitButtonOptions } from '@common/components/split-button';
import useSupportsSigning from '@hooks/useSupportsSigning';
import usePositionService from '@hooks/usePositionService';
import useWalletService from '@hooks/useWalletService';
import useContractService from '@hooks/useContractService';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import useAccount from '@hooks/useAccount';
import useErrorService from '@hooks/useErrorService';
import { shouldTrackError } from '@common/utils/errors';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import { TransactionResponse } from '@ethersproject/providers';
import useTrackEvent from '@hooks/useTrackEvent';
import FrequencyInput from '../frequency-easy-input';

const StyledRateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const StyledFrequencyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const StyledSummaryContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const StyledInputContainer = styled.div`
  margin: 5px 6px;
  display: inline-flex;
`;

interface ModifySettingsModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const ModifySettingsModal = ({ position, open, onCancel }: ModifySettingsModalProps) => {
  const { swapInterval, from, version, remainingSwaps, rate: oldRate, depositedRateUnderlying } = position;
  const account = useAccount();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const fromValue = useModifyRateSettingsFromValue();
  const frequencyValue = useModifyRateSettingsFrequencyValue();
  const dispatch = useAppDispatch();
  const rate = useModifyRateSettingsRate();
  const modeType = useModifyRateSettingsModeType();
  const positionService = usePositionService();
  const walletService = useWalletService();
  const contractService = useContractService();
  const addTransaction = useTransactionAdder();
  const currentNetwork = useCurrentNetwork();
  const intl = useIntl();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [hasSignSupport] = useSupportsSigning();
  const remainingLiquidity = (depositedRateUnderlying || oldRate).mul(remainingSwaps);
  let useWrappedProtocolToken = useModifyRateSettingsUseWrappedProtocolToken();
  const loadedAsSafeApp = useLoadedAsSafeApp();

  let fromToUse = position.from;
  if (fromToUse.address === PROTOCOL_TOKEN_ADDRESS) {
    if (hasSignSupport) {
      if (useWrappedProtocolToken) {
        fromToUse = wrappedProtocolToken;
      }
    } else {
      fromToUse = wrappedProtocolToken;
      useWrappedProtocolToken = true;
    }
  }
  const shouldShowWrappedProtocolSwitch = position.from.address === PROTOCOL_TOKEN_ADDRESS && hasSignSupport;
  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;
  const errorService = useErrorService();
  const [allowance] = useAllowance(
    useWrappedProtocolToken ? wrappedProtocolToken : position.from,
    fromHasYield,
    version
  );
  const [balance] = useBalance(fromToUse);
  const hasPendingApproval = useHasPendingApproval(fromToUse, account, fromHasYield);
  const hasConfirmedApproval = useHasPendingApproval(fromToUse, account, fromHasYield);
  const realBalance = balance && balance.add(remainingLiquidity);
  const hasYield = !!from.underlyingTokens.length;
  const [usdPrice] = useRawUsdPrice(from);
  const trackEvent = useTrackEvent();
  const fromValueUsdPrice = parseUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals)) || null,
    usdPrice
  );
  const rateUsdPrice = parseUsdPrice(from, (rate !== '' && parseUnits(rate, from?.decimals)) || null, usdPrice);
  const remainingLiquidityDifference = remainingLiquidity
    .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(rate || '0', fromToUse.decimals)))
    .abs();

  const cantFund =
    fromValue &&
    realBalance &&
    parseUnits(fromValue, fromToUse.decimals).gt(BigNumber.from(0)) &&
    frequencyValue &&
    BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
    parseUnits(fromValue, fromToUse.decimals).gt(realBalance);

  const isIncreasingPosition = remainingLiquidity
    .sub(parseUnits(fromValue || '0', fromToUse.decimals))
    .lte(BigNumber.from(0));

  const needsToApprove =
    !hasConfirmedApproval &&
    fromToUse.address !== PROTOCOL_TOKEN_ADDRESS &&
    position.user === account.toLowerCase() &&
    allowance.allowance &&
    allowance.token.address !== PROTOCOL_TOKEN_ADDRESS &&
    allowance.token.address === fromToUse.address &&
    isIncreasingPosition &&
    !hasPendingApproval &&
    parseUnits(allowance.allowance, fromToUse.decimals).lt(remainingLiquidityDifference);

  const handleCancel = () => {
    onCancel();
  };

  const handleClose = () => {
    handleCancel();
    dispatch(resetModifySettingsModal());
  };

  const handleFromValueChange = (newFromValue: string) => {
    if (!fromToUse) return;
    dispatch(setModeType(FULL_DEPOSIT_TYPE));
    dispatch(setFromValue(newFromValue));
    dispatch(
      setRate(
        (newFromValue &&
          parseUnits(newFromValue, fromToUse.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          fromToUse &&
          formatUnits(
            parseUnits(newFromValue, fromToUse.decimals).div(BigNumber.from(frequencyValue)),
            fromToUse.decimals
          )) ||
          '0'
      )
    );
  };

  const handleRateValueChange = (newRate: string) => {
    if (!fromToUse) return;
    dispatch(setModeType(RATE_TYPE));
    dispatch(setRate(newRate));
    dispatch(
      setFromValue(
        (newRate &&
          parseUnits(newRate, fromToUse.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          fromToUse &&
          formatUnits(
            parseUnits(newRate, fromToUse.decimals).mul(BigNumber.from(frequencyValue)),
            fromToUse.decimals
          )) ||
          ''
      )
    );
  };

  const handleFrequencyChange = (newFrequencyValue: string) => {
    if (!fromToUse) return;
    dispatch(setFrequencyValue(newFrequencyValue));
    if (modeType === RATE_TYPE) {
      dispatch(
        setFromValue(
          (rate &&
            parseUnits(rate, fromToUse.decimals).gt(BigNumber.from(0)) &&
            newFrequencyValue &&
            BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
            fromToUse &&
            formatUnits(
              parseUnits(rate, fromToUse.decimals).mul(BigNumber.from(newFrequencyValue)),
              fromToUse.decimals
            )) ||
            ''
        )
      );
    } else {
      dispatch(
        setRate(
          (fromValue &&
            parseUnits(fromValue, fromToUse.decimals).gt(BigNumber.from(0)) &&
            newFrequencyValue &&
            BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
            fromToUse &&
            formatUnits(
              parseUnits(fromValue, fromToUse.decimals).div(BigNumber.from(newFrequencyValue)),
              fromToUse.decimals
            )) ||
            '0'
        )
      );
    }
  };

  const handleModifyRateAndSwaps = async () => {
    if (!position) {
      return;
    }

    try {
      handleCancel();

      let hasPermission = true;

      if (!useWrappedProtocolToken || hasYield) {
        hasPermission = await positionService.companionHasPermission(
          position,
          isIncreasingPosition ? PERMISSIONS.INCREASE : PERMISSIONS.REDUCE
        );
      }

      trackEvent('DCA - Modify position submitting', { isIncreasingPosition, useWrappedProtocolToken });
      setModalLoading({
        content: (
          <>
            <Typography variant="body1">
              <FormattedMessage
                description="Modifying rate for position"
                defaultMessage="Changing your {from}/{to} position rate to swap {rate} {from} {frequencyType} for {frequencyTypePlural}"
                values={{
                  from: position.from.symbol,
                  to: position.to.symbol,
                  rate,
                  frequency: frequencyValue,
                  frequencyType: intl.formatMessage(STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb),
                  frequencyTypePlural: getFrequencyLabel(intl, position.swapInterval.toString(), frequencyValue),
                }}
              />
            </Typography>
            {((position.from.address === PROTOCOL_TOKEN_ADDRESS && !useWrappedProtocolToken) || hasYield) &&
              !hasPermission && (
                <Typography variant="body1">
                  {!isIncreasingPosition && (
                    <FormattedMessage
                      description="Approve signature companion text decrease"
                      defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you will get your balance back as {token}."
                      values={{ token: position.from.symbol }}
                    />
                  )}
                  {isIncreasingPosition && (
                    <FormattedMessage
                      description="Approve signature companion text increase"
                      defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you send the necessary {token}."
                      values={{ token: position.from.symbol }}
                    />
                  )}
                </Typography>
              )}
          </>
        ),
      });
      const result = await positionService.modifyRateAndSwaps(position, rate, frequencyValue, useWrappedProtocolToken);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION,
        typeData: { id: position.id, newRate: rate, newSwaps: frequencyValue, decimals: position.from.decimals },
        position,
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success modify rate for position"
            defaultMessage="Changing your {from}/{to} position rate to swap {rate} {from} {frequencyType} for {frequencyTypePlural} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              rate,
              frequency: frequencyValue,
              frequencyType: intl.formatMessage(STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb),
              frequencyTypePlural: getFrequencyLabel(intl, position.swapInterval.toString(), frequencyValue),
            }}
          />
        ),
      });
      trackEvent('DCA - Modify position submitted', { isIncreasingPosition, useWrappedProtocolToken });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
        trackEvent('DCA - Modify position error', { isIncreasingPosition, useWrappedProtocolToken });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error changin rate and swaps', JSON.stringify(e), {
          position: position.id,
          chainId: position.chainId,
          rate,
          swaps: frequencyValue,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: (
          <FormattedMessage description="modalErrorChangeRateAndSwaps" defaultMessage="Error changing rate and swaps" />
        ),
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

      dispatch(resetModifySettingsModal());
    }
  };

  const handleApproveAndModifyRateAndSwapsSafe = async () => {
    if (!position) {
      return;
    }

    try {
      handleCancel();

      setModalLoading({
        content: (
          <>
            <Typography variant="body1">
              <FormattedMessage
                description="Modifying rate for position"
                defaultMessage="Changing your {from}/{to} position rate to swap {rate} {from} {frequencyType} for {frequencyTypePlural}"
                values={{
                  from: position.from.symbol,
                  to: position.to.symbol,
                  rate,
                  frequency: frequencyValue,
                  frequencyType: intl.formatMessage(STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb),
                  frequencyTypePlural: getFrequencyLabel(intl, position.swapInterval.toString(), frequencyValue),
                }}
              />
            </Typography>
          </>
        ),
      });
      trackEvent('DCA - Safe modify position submitting', { isIncreasingPosition, useWrappedProtocolToken });
      const result = await positionService.approveAndModifyRateAndSwapsSafe(
        position,
        rate,
        frequencyValue,
        useWrappedProtocolToken
      );
      trackEvent('DCA - Safe modify position submitted', { isIncreasingPosition, useWrappedProtocolToken });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.hash = result.safeTxHash;

      addTransaction(result as unknown as TransactionResponse, {
        type: TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION,
        typeData: { id: position.id, newRate: rate, newSwaps: frequencyValue, decimals: position.from.decimals },
        position,
      });

      setModalSuccess({
        hash: result.safeTxHash,
        content: (
          <FormattedMessage
            description="success modify rate for position"
            defaultMessage="Changing your {from}/{to} position rate to swap {rate} {from} {frequencyType} for {frequencyTypePlural} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              rate,
              frequency: frequencyValue,
              frequencyType: intl.formatMessage(STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb),
              frequencyTypePlural: getFrequencyLabel(intl, position.swapInterval.toString(), frequencyValue),
            }}
          />
        ),
      });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
        trackEvent('DCA - Safe modify position error', { isIncreasingPosition, useWrappedProtocolToken });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error changin rate and swaps', JSON.stringify(e), {
          position: position.id,
          chainId: position.chainId,
          rate,
          swaps: frequencyValue,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: (
          <FormattedMessage description="modalErrorChangeRateAndSwaps" defaultMessage="Error changing rate and swaps" />
        ),
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }

    dispatch(resetModifySettingsModal());
  };

  const handleApproveToken = async (isExact?: boolean) => {
    if (!fromToUse) return;
    const fromSymbol = fromToUse.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: fromSymbol || '' }}
            />
          </Typography>
        ),
      });

      trackEvent('DCA - Modify position approve submitting', { isIncreasingPosition, useWrappedProtocolToken });
      const result = await walletService.approveToken(
        fromToUse,
        fromHasYield,
        version,
        isExact ? remainingLiquidityDifference : undefined
      );

      const hubAddress = await contractService.getHUBAddress(position.version);
      const companionAddress = await contractService.getHUBCompanionAddress(position.version);

      addTransaction(result, {
        type: isExact ? TRANSACTION_TYPES.APPROVE_TOKEN_EXACT : TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: fromToUse,
          addressFor: fromHasYield ? companionAddress : hubAddress,
          ...(isExact && { amount: remainingLiquidityDifference.toString() }),
        },
        position,
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success approving token"
            defaultMessage="Approving use of {from} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: fromSymbol || '' }}
          />
        ),
      });
      trackEvent('DCA - Modify position approve submitted', { isIncreasingPosition, useWrappedProtocolToken });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
        trackEvent('DCA - Modify position approve error', { isIncreasingPosition, useWrappedProtocolToken });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error approving token', JSON.stringify(e), {
          position: position.id,
          token: fromToUse,
          yield: !!fromHasYield,
          chainId: position.chainId,
        });
      }
      setModalError({
        content: <FormattedMessage description="modalErrorApprovingToken" defaultMessage="Error approving token" />,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: { code: e.code, message: e.message, data: e.data },
      });
    }
  };

  const minimumToUse =
    fromHasYield || toHasYield
      ? MINIMUM_USD_RATE_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD
      : MINIMUM_USD_RATE_FOR_DEPOSIT[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT;

  const hasEnoughUsdForModify = !!usdPrice && rateUsdPrice >= minimumToUse;

  const shouldDisableByUsd =
    rate !== '' && parseUnits(rate, from?.decimals).gt(BigNumber.from(0)) && !hasEnoughUsdForModify;

  const minimumTokensNeeded = usdPriceToToken(from, minimumToUse, usdPrice);

  let actions: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: keyof typeof ButtonTypes;
    variant?: 'text' | 'outlined' | 'contained';
    options?: SplitButtonOptions;
  }[] = [];

  if (needsToApprove && !loadedAsSafeApp) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: (
          <>
            <FormattedMessage
              description="Allow us to use your coin (modal max)"
              defaultMessage="Approve Max {symbol}"
              values={{
                symbol: fromToUse.symbol,
              }}
            />
            <AllowanceTooltip symbol={fromToUse.symbol} />
          </>
        ),
        onClick: () => handleApproveToken(),
        disabled: !!hasPendingApproval || shouldDisableByUsd,
        options: [
          {
            text: (
              <FormattedMessage
                description="Allow us to use your coin (modal exact)"
                defaultMessage="Approve {remainingLiquidityDifference} {symbol}"
                values={{
                  symbol: fromToUse.symbol,
                  remainingLiquidityDifference: formatCurrencyAmount(remainingLiquidityDifference, fromToUse, 4),
                }}
              />
            ),
            disabled: !!hasPendingApproval || shouldDisableByUsd,
            onClick: () => handleApproveToken(true),
          },
        ],
      },
    ];
  }

  if (hasPendingApproval) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: (
          <FormattedMessage
            description="waiting for approval"
            defaultMessage="Waiting for your {token} to be approved"
            values={{
              token: fromToUse.symbol,
            }}
          />
        ),
        onClick: () => {},
        disabled: true,
      },
    ];
  }

  if (!needsToApprove && !hasPendingApproval) {
    actions = [
      {
        color: 'secondary',
        variant: 'contained',
        label: <FormattedMessage description="modifyPosition" defaultMessage="Modify position" />,
        onClick: handleModifyRateAndSwaps,
        disabled: !!cantFund || frequencyValue === '0' || shouldDisableByUsd,
      },
    ];
  }

  if (needsToApprove && loadedAsSafeApp) {
    actions = [
      {
        color: 'secondary',
        variant: 'contained',
        label: <FormattedMessage description="modifyPosition" defaultMessage="Approve and modify position" />,
        onClick: handleApproveAndModifyRateAndSwapsSafe,
        disabled: !!cantFund || frequencyValue === '0' || shouldDisableByUsd,
      },
    ];
  }

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={handleClose}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="changeDuration title" defaultMessage="Change duration and rate" />}
      actions={actions}
    >
      <Grid container direction="column" alignItems="flex-start" spacing={2}>
        <Grid item xs={12}>
          <StyledRateContainer>
            <Typography variant="body1">
              <FormattedMessage
                description="howMuchToSell"
                defaultMessage="How much {from} do you want to invest?"
                values={{ from: fromToUse.symbol || '' }}
              />
            </Typography>
            {shouldShowWrappedProtocolSwitch && (
              <FormGroup row>
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Switch
                      checked={useWrappedProtocolToken}
                      onChange={() => dispatch(setUseWrappedProtocolToken(!useWrappedProtocolToken))}
                      name="enableDisableWrappedProtocolToken"
                      color="primary"
                    />
                  }
                  label={
                    <FormattedMessage
                      description="useWrappedToken"
                      defaultMessage="Use {token}"
                      values={{ token: wrappedProtocolToken.symbol }}
                    />
                  }
                />
              </FormGroup>
            )}
            <TokenInput
              id="from-value"
              error={cantFund ? 'Amount cannot exceed balance' : ''}
              value={fromValue}
              onChange={handleFromValueChange}
              withBalance={!!realBalance}
              balance={realBalance}
              token={fromToUse}
              withMax
              withHalf
              fullWidth
              usdValue={fromValueUsdPrice.toFixed(2)}
            />
          </StyledRateContainer>
        </Grid>
        <Grid item xs={12}>
          <StyledFrequencyContainer>
            <Typography variant="body1">
              <FormattedMessage
                description="howManyFreq"
                defaultMessage="How many {type}?"
                values={{
                  type: intl.formatMessage(
                    STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
                  ),
                }}
              />
            </Typography>
            <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} />
          </StyledFrequencyContainer>
        </Grid>
        <Grid item xs={12}>
          <StyledSummaryContainer>
            <Typography variant="body1" component="span">
              <FormattedMessage description="rate detail" defaultMessage="We'll swap" />
            </Typography>
            <StyledInputContainer>
              <TokenInput
                id="rate-value"
                value={rate}
                onChange={handleRateValueChange}
                withBalance={false}
                token={fromToUse}
                isMinimal
                usdValue={rateUsdPrice.toFixed(2)}
              />
            </StyledInputContainer>
            <Typography variant="body1" component="span">
              <FormattedMessage
                description="rate detail"
                defaultMessage="{yield} {frequency} for you for"
                values={{
                  frequency: intl.formatMessage(
                    STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every
                  ),
                  yield: hasYield
                    ? intl.formatMessage(
                        defineMessage({
                          defaultMessage: '+ yield',
                          description: 'plusYield',
                        })
                      )
                    : '',
                }}
              />
            </Typography>
            <StyledInputContainer>
              <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} isMinimal />
            </StyledInputContainer>
            {intl.formatMessage(
              STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
            )}
          </StyledSummaryContainer>
        </Grid>
        <Grid item xs={12}>
          {remainingLiquidity.gt(BigNumber.from(0)) &&
            !remainingLiquidity
              .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(rate || '0', fromToUse.decimals)))
              .eq(BigNumber.from(0)) && (
              <Typography variant="body2">
                {isIncreasingPosition ? (
                  <FormattedMessage
                    description="rate add detail"
                    defaultMessage="You will need to provide an aditional {addAmmount} {from}"
                    values={{
                      from: fromToUse.symbol,
                      addAmmount: formatUnits(remainingLiquidityDifference, fromToUse.decimals),
                    }}
                  />
                ) : (
                  <FormattedMessage
                    description="rate withdraw detail"
                    defaultMessage="We will return {returnAmmount} {from} to you"
                    values={{
                      from: fromToUse.symbol,
                      returnAmmount: formatUnits(remainingLiquidityDifference, fromToUse.decimals),
                    }}
                  />
                )}
              </Typography>
            )}
        </Grid>
        {shouldDisableByUsd && (
          <Grid item xs={12}>
            <StyledSummaryContainer>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" sx={{ textAlign: 'left' }}>
                <FormattedMessage
                  description="disabledByUsdValueModify"
                  // eslint-disable-next-line no-template-curly-in-string
                  defaultMessage="You have to invest at least a rate of ${minimum} USD ({minToken} {symbol}) per {frequency} to add funds to this position."
                  values={{
                    minimum: minimumToUse,
                    minToken: formatCurrencyAmount(minimumTokensNeeded, from, 3, 3),
                    symbol: from.symbol,
                    frequency: intl.formatMessage(
                      STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                        .singularSubject
                    ),
                  }}
                />
              </Typography>
            </StyledSummaryContainer>
          </Grid>
        )}
      </Grid>
    </Modal>
  );
};
export default ModifySettingsModal;
