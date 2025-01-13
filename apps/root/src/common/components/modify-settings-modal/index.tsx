import React from 'react';
import styled from 'styled-components';
import find from 'lodash/find';
import isUndefined from 'lodash/isUndefined';
import { Address, formatUnits, parseUnits } from 'viem';
import { ApproveTokenExactTypeData, ApproveTokenTypeData, Position, TransactionTypes } from '@types';
import { FormattedMessage, useIntl } from 'react-intl';
import useTransactionModal from '@hooks/useTransactionModal';
import {
  Typography,
  Grid,
  FormControlLabel,
  FormGroup,
  Switch,
  ButtonProps,
  Modal,
  SplitButtonOptions,
  TokenAmounUsdInput,
  colors,
  ContainerBox,
  OptionsButtons,
  TextField,
  DividerBorder2,
} from 'ui-library';
import { useHasPendingApproval, useTransactionAdder } from '@state/transactions/hooks';
import {
  DCA_PREDEFINED_RANGES,
  DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT,
  DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
  MINIMUM_USD_RATE_FOR_DEPOSIT,
  MINIMUM_USD_RATE_FOR_YIELD,
  NETWORKS,
  PERMISSIONS,
  STRING_SWAP_INTERVALS,
} from '@constants';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import {
  setFrequencyValue,
  setFromValue,
  setUseWrappedProtocolToken,
  resetModifySettingsModal,
  setRate,
} from '@state/modify-rate-settings/actions';
import {
  useModifyRateSettingsFrequencyValue,
  useModifyRateSettingsFromValue,
  useModifyRateSettingsRate,
  useModifyRateSettingsUseWrappedProtocolToken,
} from '@state/modify-rate-settings/hooks';
import { useTokenBalance } from '@state/balances/hooks';
import { useAppDispatch } from '@state/hooks';
import { getFrequencyLabel } from '@common/utils/parsing';
import {
  formatCurrencyAmount,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
  usdPriceToToken,
} from '@common/utils/currency';
import useSupportsSigning from '@hooks/useSupportsSigning';
import usePositionService from '@hooks/usePositionService';
import useWalletService from '@hooks/useWalletService';
import useErrorService from '@hooks/useErrorService';
import { deserializeError, shouldTrackError } from '@common/utils/errors';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useAnalytics from '@hooks/useAnalytics';
import usePermit2Service from '@hooks/usePermit2Service';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import useDcaAllowanceTarget from '@hooks/useDcaAllowanceTarget';
import { abs } from '@common/utils/bigint';
import ChangesSummary from './components/changes-summary';
import { AddPositionToCalendarButton } from '../add-position-to-calendar';

const StyledSummaryContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
`;

interface ModifySettingsModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const ModifySettingsModal = ({ position, open, onCancel }: ModifySettingsModalProps) => {
  const { swapInterval, from, remainingSwaps, rate: oldRate } = position;
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const fromValue = useModifyRateSettingsFromValue();
  const frequencyValue = useModifyRateSettingsFrequencyValue();
  const dispatch = useAppDispatch();
  const rate = useModifyRateSettingsRate();
  const positionService = usePositionService();
  const walletService = useWalletService();
  const addTransaction = useTransactionAdder();
  const intl = useIntl();
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const hasSignSupport = useSupportsSigning();
  const remainingLiquidity = oldRate.amount * remainingSwaps;
  let useWrappedProtocolToken = useModifyRateSettingsUseWrappedProtocolToken();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const permit2Service = usePermit2Service();

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
  const yieldFrom = fromHasYield && position.from.underlyingTokens[0].address;
  const allowanceTarget = useDcaAllowanceTarget(position.chainId, fromToUse, yieldFrom || undefined, hasSignSupport);
  const [allowance] = useSpecificAllowance(
    useWrappedProtocolToken ? wrappedProtocolToken : position.from,
    position.user,
    allowanceTarget
  );
  const { balance } = useTokenBalance({ token: fromToUse, walletAddress: position.user });

  const hasPendingApproval = useHasPendingApproval(fromToUse, position.user, fromHasYield, allowanceTarget);
  const hasConfirmedApproval = useHasPendingApproval(fromToUse, position.user, fromHasYield, allowanceTarget);
  const realBalance = (balance && BigInt(balance.amount) + remainingLiquidity) || remainingLiquidity;
  const hasYield = !!from.underlyingTokens.length;
  const { trackEvent, trackPositionModified } = useAnalytics();
  const usdPrice = parseNumberUsdPriceToBigInt(from.price);
  const rateUsdPrice = parseUsdPrice(from, (rate !== '' && parseUnits(rate, from?.decimals)) || null, usdPrice);
  const remainingLiquidityDifference = abs(
    remainingLiquidity - BigInt(frequencyValue || '0') * parseUnits(rate || '0', fromToUse.decimals)
  );

  const cantFund =
    fromValue &&
    realBalance &&
    parseUnits(fromValue, fromToUse.decimals) > 0n &&
    frequencyValue &&
    BigInt(frequencyValue) > 0n &&
    parseUnits(fromValue, fromToUse.decimals) > realBalance;

  const isIncreasingPosition = remainingLiquidity - parseUnits(fromValue || '0', fromToUse.decimals) < 0n;

  const needsToApprove =
    !hasConfirmedApproval &&
    fromToUse.address !== PROTOCOL_TOKEN_ADDRESS &&
    allowance.allowance &&
    allowance.token.address !== PROTOCOL_TOKEN_ADDRESS &&
    allowance.token.address === fromToUse.address &&
    isIncreasingPosition &&
    !hasPendingApproval &&
    parseUnits(allowance.allowance, fromToUse.decimals) < remainingLiquidityDifference;

  const handleCancel = () => {
    onCancel();
  };

  const handleClose = () => {
    handleCancel();
    dispatch(resetModifySettingsModal());
  };

  const handleFromValueChange = (newFromValue: string) => {
    if (!fromToUse) return;
    dispatch(setFromValue(newFromValue));
    dispatch(
      setRate(
        (newFromValue &&
          parseUnits(newFromValue, fromToUse.decimals) > 0n &&
          frequencyValue &&
          BigInt(frequencyValue) > 0n &&
          fromToUse &&
          formatUnits(parseUnits(newFromValue, fromToUse.decimals) / BigInt(frequencyValue), fromToUse.decimals)) ||
          '0'
      )
    );
  };

  const handleFrequencyChange = (newFrequencyValue: string) => {
    if (!fromToUse) return;
    dispatch(setFrequencyValue(newFrequencyValue));
    dispatch(
      setRate(
        (fromValue &&
          parseUnits(fromValue, fromToUse.decimals) > 0n &&
          newFrequencyValue &&
          BigInt(newFrequencyValue) > 0n &&
          fromToUse &&
          formatUnits(parseUnits(fromValue, fromToUse.decimals) / BigInt(newFrequencyValue), fromToUse.decimals)) ||
          '0'
      )
    );
  };

  const validator = (nextValue: string) => {
    const inputRegex = RegExp(/^[0-9]*$/);
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      handleFrequencyChange(nextValue);
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

      const goesThroughPermit2 =
        (useWrappedProtocolToken || position.from.address !== PROTOCOL_TOKEN_ADDRESS) &&
        isIncreasingPosition &&
        hasSignSupport;

      trackEvent('DCA - Modify position submitting', { isIncreasingPosition, useWrappedProtocolToken });
      setModalLoading({
        content: (
          <>
            <Typography variant="bodyRegular">
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
            {(((position.from.address === PROTOCOL_TOKEN_ADDRESS && !useWrappedProtocolToken) || hasYield) &&
              !hasPermission) ||
              (goesThroughPermit2 && (
                <Typography variant="bodyRegular">
                  {!isIncreasingPosition && (
                    <FormattedMessage
                      description="Approve signature companion text decrease"
                      defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you will get your balance back as {token}."
                      values={{ token: position.from.symbol }}
                    />
                  )}
                  {isIncreasingPosition && (
                    <FormattedMessage
                      description="Approve signature companion text increase"
                      defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you send the necessary {token}."
                      values={{ token: position.from.symbol }}
                    />
                  )}
                </Typography>
              ))}
          </>
        ),
      });

      let signature;

      if (
        (useWrappedProtocolToken || position.from.address !== PROTOCOL_TOKEN_ADDRESS) &&
        isIncreasingPosition &&
        hasSignSupport
      ) {
        const newAmount = parseUnits(rate, position.from.decimals) * BigInt(frequencyValue);

        const amountToSign = newAmount - remainingLiquidity;

        signature = await permit2Service.getPermit2DcaSignedData(
          position.user,
          position.chainId,
          position.from.address !== PROTOCOL_TOKEN_ADDRESS ? position.from : wrappedProtocolToken,
          amountToSign
        );
      }

      const result = await positionService.modifyRateAndSwaps(
        position,
        rate,
        frequencyValue,
        useWrappedProtocolToken,
        signature
      );
      addTransaction(result, {
        type: TransactionTypes.modifyRateAndSwapsPosition,
        typeData: {
          id: position.id,
          newRate: parseUnits(rate, position.from.decimals).toString(),
          newSwaps: frequencyValue,
          decimals: position.from.decimals,
        },
        position,
      });
      setModalSuccess({
        hash: result.hash,
        extraActions:
          frequencyValue !== '0'
            ? [
                <AddPositionToCalendarButton
                  size="large"
                  key="addPositionToCalendar"
                  position={{ ...position, remainingSwaps: BigInt(frequencyValue) }}
                />,
              ]
            : [],
        content: (
          <ContainerBox justifyContent="center" alignItems="center" flexDirection="column">
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
          </ContainerBox>
        ),
      });
      trackEvent('DCA - Modify position submitted', { isIncreasingPosition, useWrappedProtocolToken });

      trackPositionModified({
        chainId: position.chainId,
        remainingLiquidityDifference,
        usdPrice,
        isIncreasingPosition,
        token: fromToUse,
      });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e as Error)) {
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
        error: {
          ...deserializeError(e),
          extraData: {
            chainId: position.chainId,
            rate,
            swaps: frequencyValue,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

      dispatch(resetModifySettingsModal());
    }
  };

  const handleModifyRateAndSwapsSafe = async () => {
    if (!position) {
      return;
    }

    try {
      handleCancel();

      setModalLoading({
        content: (
          <>
            <Typography variant="bodyRegular">
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
      const result = await positionService.modifyRateAndSwapsSafe(
        position,
        rate,
        frequencyValue,
        useWrappedProtocolToken
      );

      trackEvent('DCA - Safe modify position submitted', { isIncreasingPosition, useWrappedProtocolToken });

      trackPositionModified({
        chainId: position.chainId,
        remainingLiquidityDifference,
        usdPrice,
        isIncreasingPosition,
        token: fromToUse,
      });

      addTransaction(
        { hash: result.safeTxHash as Address, from: position.user, chainId: position.chainId },
        {
          type: TransactionTypes.modifyRateAndSwapsPosition,
          typeData: {
            id: position.id,
            newRate: parseUnits(rate, position.from.decimals).toString(),
            newSwaps: frequencyValue,
            decimals: position.from.decimals,
          },
          position,
        }
      );

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
      if (shouldTrackError(e as Error)) {
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
        error: {
          ...deserializeError(e),
          extraData: {
            chainId: position.chainId,
            rate,
            swaps: frequencyValue,
          },
        },
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
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: fromSymbol || '' }}
            />
          </Typography>
        ),
      });

      trackEvent('DCA - Modify position approve submitting', { isIncreasingPosition, useWrappedProtocolToken });
      const result = await walletService.approveSpecificToken(
        fromToUse,
        allowanceTarget as Address,
        position.user,
        isExact ? remainingLiquidityDifference : undefined
      );

      const transactionTypeDataBase = {
        token: fromToUse,
        addressFor: allowanceTarget,
      };

      let transactionTypeData: ApproveTokenExactTypeData | ApproveTokenTypeData = {
        type: TransactionTypes.approveToken,
        typeData: transactionTypeDataBase,
      };

      if (isExact) {
        transactionTypeData = {
          type: TransactionTypes.approveTokenExact,
          typeData: {
            ...transactionTypeDataBase,
            amount: remainingLiquidityDifference.toString(),
          },
        };
      }

      addTransaction(result, transactionTypeData);
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
      if (shouldTrackError(e as Error)) {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: {
          ...deserializeError(e),
          extraData: {
            chainId: position.chainId,
          },
        },
      });
    }
  };

  const minimumToUse =
    fromHasYield || toHasYield
      ? MINIMUM_USD_RATE_FOR_YIELD[position.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD
      : MINIMUM_USD_RATE_FOR_DEPOSIT[position.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const positionNetwork = find(NETWORKS, { chainId: position.chainId })!;

  const hasEnoughUsdForModify = positionNetwork.testnet || (!isUndefined(usdPrice) && rateUsdPrice >= minimumToUse);

  const shouldDisableByUsd = rate !== '' && parseUnits(rate, from?.decimals) > 0n && !hasEnoughUsdForModify;

  const minimumTokensNeeded = usdPriceToToken(from, minimumToUse, usdPrice);

  let actions: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: ButtonProps['color'];
    variant?: 'text' | 'outlined' | 'contained';
    options?: SplitButtonOptions;
  }[] = [];

  if (needsToApprove && !loadedAsSafeApp) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: (
          <FormattedMessage
            description="Allow us to use your coin (modal max)"
            defaultMessage="Authorize Max {symbol}"
            values={{
              symbol: fromToUse.symbol,
            }}
          />
        ),
        onClick: () => handleApproveToken(),
        disabled: !!hasPendingApproval || shouldDisableByUsd,
        options: [
          {
            text: (
              <FormattedMessage
                description="Allow us to use your coin (modal exact)"
                defaultMessage="Authorize {remainingLiquidityDifference} {symbol}"
                values={{
                  symbol: fromToUse.symbol,
                  remainingLiquidityDifference: formatCurrencyAmount({
                    amount: remainingLiquidityDifference,
                    token: fromToUse,
                    sigFigs: 4,
                    intl,
                  }),
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

  if (
    !needsToApprove &&
    !loadedAsSafeApp &&
    useWrappedProtocolToken &&
    position.from.address !== PROTOCOL_TOKEN_ADDRESS &&
    isIncreasingPosition
  ) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: <FormattedMessage description="modifyPositionPermit2" defaultMessage="Authorize and modify position" />,
        onClick: handleModifyRateAndSwaps,
        disabled: !!cantFund || frequencyValue === '0' || shouldDisableByUsd,
      },
    ];
  }

  if (!needsToApprove && !hasPendingApproval) {
    actions = [
      {
        color: 'primary',
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
        color: 'primary',
        variant: 'contained',
        label: <FormattedMessage description="modifyPositionSafe" defaultMessage="Authorize and modify position" />,
        onClick: handleModifyRateAndSwapsSafe,
        disabled: !!cantFund || frequencyValue === '0' || shouldDisableByUsd,
      },
    ];
  }

  if (!needsToApprove && loadedAsSafeApp) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: <FormattedMessage description="modifyPosition" defaultMessage="Modify position" />,
        onClick: handleModifyRateAndSwapsSafe,
        disabled: !!cantFund || frequencyValue === '0' || shouldDisableByUsd,
      },
    ];
  }

  if (cantFund) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: <FormattedMessage description="insufficientFunds" defaultMessage="Insufficient funds" />,
        onClick: () => {},
        disabled: true,
      },
    ];
  }

  const frequencyValueOptions = DCA_PREDEFINED_RANGES.map((range) => ({
    value: range.value,
    text: `${range.value} ${intl.formatMessage(
      STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
    )}`,
  }));

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={handleClose}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="changeDuration title" defaultMessage="Manage your position" />}
      actions={actions}
      actionsAlignment="horizontal"
    >
      <Grid container direction="column" alignItems="stretch" spacing={4}>
        <Grid item xs={12}>
          <ContainerBox flexDirection="column" gap={3} alignItems="stretch" flex={1}>
            <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage
                description="howMuchToSell"
                defaultMessage="How much <b>{from}</b> are you planning to invest?"
                values={{ from: from?.symbol || '', b: (chunks) => <b>{chunks}</b> }}
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
            <TokenAmounUsdInput
              value={fromValue}
              token={fromToUse}
              balance={balance}
              tokenPrice={usdPrice}
              onChange={handleFromValueChange}
            />
          </ContainerBox>
        </Grid>
        <Grid item xs={12}>
          <ContainerBox flexDirection="column" gap={3} flex={1} alignItems="stretch">
            <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
              <FormattedMessage description="investmentDuration" defaultMessage="Investment Duration" />
            </Typography>
            <ContainerBox gap={2} flex={1} alignSelf="stretch" alignItems="stretch">
              <TextField
                id="investment-duration-input"
                placeholder={`0 ${intl.formatMessage(
                  STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
                )}`}
                onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
                value={frequencyValue}
                fullWidth
                sx={{ flex: 1 }}
              />
              <OptionsButtons
                options={frequencyValueOptions}
                activeOption={frequencyValue}
                setActiveOption={handleFrequencyChange}
              />
            </ContainerBox>
          </ContainerBox>
        </Grid>
        <Grid item xs={12}>
          <DividerBorder2 />
        </Grid>
        <Grid item xs={12}>
          <ChangesSummary position={position} fromPrice={usdPrice} />
        </Grid>
        {remainingLiquidity > 0n &&
          remainingLiquidity - BigInt(frequencyValue || '0') * parseUnits(rate || '0', fromToUse.decimals) !== 0n && (
            <Grid item xs={12}>
              <Typography variant="bodySmallRegular">
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
            </Grid>
          )}
        {shouldDisableByUsd && (
          <Grid item xs={12}>
            <StyledSummaryContainer>
              <Typography variant="bodyRegular" sx={{ textAlign: 'left' }}>
                <FormattedMessage
                  description="disabledByUsdValueModify"
                  // eslint-disable-next-line no-template-curly-in-string
                  defaultMessage="You have to invest at least a rate of ${minimum} USD ({minToken} {symbol}) per {frequency} to add funds to this position."
                  values={{
                    minimum: minimumToUse,
                    minToken: formatCurrencyAmount({
                      amount: minimumTokensNeeded,
                      token: from,
                      sigFigs: 3,
                      maxDecimals: 3,
                      intl,
                    }),
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
        <Grid item xs={12}>
          <DividerBorder2 />
        </Grid>
      </Grid>
    </Modal>
  );
};
export default ModifySettingsModal;
