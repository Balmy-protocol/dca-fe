import React from 'react';
import styled from 'styled-components';
import { formatUnits, parseUnits } from '@ethersproject/units';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks';
import { FULL_DEPOSIT_TYPE, PERMISSIONS, RATE_TYPE, STRING_SWAP_INTERVALS, TRANSACTION_TYPES } from 'config/constants';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { BigNumber } from 'ethers';
import Grid from '@mui/material/Grid';
import TokenInput from 'common/token-input';
import {
  setFrequencyValue,
  setFromValue,
  setRate,
  setModeType,
  setUseWrappedProtocolToken,
} from 'state/modify-rate-settings/actions';
import FrequencyInput from 'common/frequency-easy-input';
import {
  useModifyRateSettingsFrequencyValue,
  useModifyRateSettingsFromValue,
  useModifyRateSettingsModeType,
  useModifyRateSettingsRate,
  useModifyRateSettingsUseWrappedProtocolToken,
} from 'state/modify-rate-settings/hooks';
import useBalance from 'hooks/useBalance';
import { useAppDispatch } from 'state/hooks';
import { getFrequencyLabel } from 'utils/parsing';
import useAllowance from 'hooks/useAllowance';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import { ButtonTypes } from 'common/button';
import useSupportsSigning from 'hooks/useSupportsSigning';
import usePositionService from 'hooks/usePositionService';
import useWalletService from 'hooks/useWalletService';
import useContractService from 'hooks/useContractService';
import useRawUsdPrice from 'hooks/useUsdRawPrice';
import { parseUsdPrice } from 'utils/currency';

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
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [hasSignSupport] = useSupportsSigning();
  const remainingLiquidity = (depositedRateUnderlying || oldRate).mul(remainingSwaps);
  let useWrappedProtocolToken = useModifyRateSettingsUseWrappedProtocolToken();

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
  const [allowance] = useAllowance(
    useWrappedProtocolToken ? wrappedProtocolToken : position.from,
    fromHasYield,
    version
  );
  const [balance] = useBalance(fromToUse);
  const hasPendingApproval = useHasPendingApproval(fromToUse, walletService.getAccount(), fromHasYield);
  const realBalance = balance && balance.add(remainingLiquidity);
  const hasYield = !!from.underlyingTokens.length;
  const [usdPrice] = useRawUsdPrice(from);
  const fromValueUsdPrice = parseUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals)) || null,
    usdPrice
  );
  const rateUsdPrice = parseUsdPrice(from, (rate !== '' && parseUnits(rate, from?.decimals)) || null, usdPrice);

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
    fromToUse.address !== PROTOCOL_TOKEN_ADDRESS &&
    position.user === walletService.getAccount().toLowerCase() &&
    allowance.allowance &&
    allowance.token.address !== PROTOCOL_TOKEN_ADDRESS &&
    allowance.token.address === fromToUse.address &&
    isIncreasingPosition &&
    !hasPendingApproval &&
    parseUnits(allowance.allowance, fromToUse.decimals).lt(
      remainingLiquidity.sub(parseUnits(fromValue || '0', fromToUse.decimals)).abs()
    );

  const handleCancel = () => {
    onCancel();
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
                  frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb,
                  frequencyTypePlural: getFrequencyLabel(position.swapInterval.toString(), frequencyValue),
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
              frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb,
              frequencyTypePlural: getFrequencyLabel(position.swapInterval.toString(), frequencyValue),
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'Error changing rate and swaps',
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const handleApproveToken = async () => {
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
      const result = await walletService.approveToken(fromToUse, fromHasYield, version);
      const hubAddress = await contractService.getHUBAddress(position.version);
      const companionAddress = await contractService.getHUBCompanionAddress(position.version);

      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: fromToUse,
          addressFor: fromHasYield ? companionAddress : hubAddress,
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
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  let actions: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: keyof typeof ButtonTypes;
    variant?: 'text' | 'outlined' | 'contained';
  }[] = [];

  if (needsToApprove) {
    actions = [
      {
        color: 'primary',
        variant: 'contained',
        label: (
          <FormattedMessage
            description="Allow us to use your coin"
            defaultMessage="Approve {token}"
            values={{
              token: fromToUse.symbol,
            }}
          />
        ),
        onClick: handleApproveToken,
        disabled: !!hasPendingApproval,
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
        disabled: !!cantFund || frequencyValue === '0',
      },
    ];
  }

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={handleCancel}
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
                  label={`Use ${wrappedProtocolToken.symbol}`}
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
                  type: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject,
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
                defaultMessage="{yield}{frequency} for you for"
                values={{
                  frequency: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every,
                  yield: hasYield ? '+ yield ' : '',
                }}
              />
            </Typography>
            <StyledInputContainer>
              <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} isMinimal />
            </StyledInputContainer>
            {STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject}
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
                      addAmmount: formatUnits(
                        remainingLiquidity
                          .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(rate || '0', fromToUse.decimals)))
                          .abs(),
                        fromToUse.decimals
                      ),
                    }}
                  />
                ) : (
                  <FormattedMessage
                    description="rate withdraw detail"
                    defaultMessage="We will return {returnAmmount} {from} to you"
                    values={{
                      from: fromToUse.symbol,
                      returnAmmount: formatUnits(
                        remainingLiquidity
                          .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(rate || '0', fromToUse.decimals)))
                          .abs(),
                        fromToUse.decimals
                      ),
                    }}
                  />
                )}
              </Typography>
            )}
        </Grid>
      </Grid>
    </Modal>
  );
};
export default ModifySettingsModal;
