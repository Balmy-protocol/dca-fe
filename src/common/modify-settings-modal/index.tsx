import React from 'react';
import styled from 'styled-components';
import { formatUnits, parseUnits } from '@ethersproject/units';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks';
import {
  COMPANION_ADDRESS,
  FULL_DEPOSIT_TYPE,
  HUB_ADDRESS,
  PERMISSIONS,
  RATE_TYPE,
  STRING_SWAP_INTERVALS,
  TRANSACTION_TYPES,
} from 'config/constants';
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
import useWeb3Service from 'hooks/useWeb3Service';
import { useAppDispatch } from 'state/hooks';
import { getFrequencyLabel } from 'utils/parsing';
import useAllowance from 'hooks/useAllowance';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import { ButtonTypes } from 'common/button';

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
  const { from, to, swapInterval, remainingLiquidity } = position;
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const fromValue = useModifyRateSettingsFromValue();
  const frequencyValue = useModifyRateSettingsFrequencyValue();
  const dispatch = useAppDispatch();
  const rate = useModifyRateSettingsRate();
  const modeType = useModifyRateSettingsModeType();
  const web3Service = useWeb3Service();
  const addTransaction = useTransactionAdder();
  const currentNetwork = useCurrentNetwork();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const useWrappedProtocolToken = useModifyRateSettingsUseWrappedProtocolToken();
  const shouldShowWrappedProtocolSwitch = position.from.address === PROTOCOL_TOKEN_ADDRESS;
  const [allowance] = useAllowance(useWrappedProtocolToken ? wrappedProtocolToken : position.from);
  const fromToUse = shouldShowWrappedProtocolSwitch && useWrappedProtocolToken ? wrappedProtocolToken : position.from;
  const [balance, isLoadingBalance] = useBalance(fromToUse);
  const hasPendingApproval = useHasPendingApproval(fromToUse, web3Service.getAccount());
  const realBalance = balance && balance.add(position.remainingLiquidity);

  const cantFund =
    fromValue &&
    realBalance &&
    parseUnits(fromValue, position.from.decimals).gt(BigNumber.from(0)) &&
    frequencyValue &&
    BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
    parseUnits(fromValue, position.from.decimals).gt(realBalance);

  const isIncreasingPosition = position.remainingLiquidity
    .sub(parseUnits(fromValue || '0', fromToUse.decimals))
    .lte(BigNumber.from(0));

  const needsToApprove =
    fromToUse.address !== PROTOCOL_TOKEN_ADDRESS &&
    allowance &&
    isIncreasingPosition &&
    !hasPendingApproval &&
    parseUnits(allowance.allowance, position.from.decimals).lt(
      position.remainingLiquidity.sub(parseUnits(fromValue || '0', fromToUse.decimals)).abs()
    );

  const handleCancel = () => {
    onCancel();
  };

  const handleFromValueChange = (newFromValue: string) => {
    if (!from) return;
    dispatch(setModeType(FULL_DEPOSIT_TYPE));
    dispatch(setFromValue(newFromValue));
    dispatch(
      setRate(
        (newFromValue &&
          parseUnits(newFromValue, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(newFromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
          '0'
      )
    );
  };

  const handleRateValueChange = (newRate: string) => {
    if (!from) return;
    dispatch(setModeType(RATE_TYPE));
    dispatch(setRate(newRate));
    dispatch(
      setFromValue(
        (newRate &&
          parseUnits(newRate, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(newRate, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) ||
          ''
      )
    );
  };

  const handleFrequencyChange = (newFrequencyValue: string) => {
    if (!from) return;
    dispatch(setFrequencyValue(newFrequencyValue));
    if (modeType === RATE_TYPE) {
      dispatch(
        setFromValue(
          (rate &&
            parseUnits(rate, from.decimals).gt(BigNumber.from(0)) &&
            newFrequencyValue &&
            BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
            from &&
            formatUnits(parseUnits(rate, from.decimals).mul(BigNumber.from(newFrequencyValue)), from.decimals)) ||
            ''
        )
      );
    } else {
      dispatch(
        setRate(
          (fromValue &&
            parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
            newFrequencyValue &&
            BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
            from &&
            formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(newFrequencyValue)), from.decimals)) ||
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

      const hasPermission = await web3Service.companionHasPermission(
        position,
        isIncreasingPosition ? PERMISSIONS.INCREASE : PERMISSIONS.REDUCE
      );

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
            {position.from.address === PROTOCOL_TOKEN_ADDRESS && !useWrappedProtocolToken && !hasPermission && (
              <Typography variant="body1">
                {!isIncreasingPosition && (
                  <FormattedMessage
                    description="Approve signature companion text decrease"
                    defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as ETH."
                  />
                )}
                {isIncreasingPosition && (
                  <FormattedMessage
                    description="Approve signature companion text increase"
                    defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you send the necessary ETH."
                  />
                )}
              </Typography>
            )}
          </>
        ),
      });
      const result = await web3Service.modifyRateAndSwaps(position, rate, frequencyValue, useWrappedProtocolToken);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION,
        typeData: { id: position.id, newRate: rate, newSwaps: frequencyValue, decimals: position.from.decimals },
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
    if (!from) return;
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
      const result = await web3Service.approveToken(fromToUse);
      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_TOKEN,
        typeData: {
          token: fromToUse,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS
              ? COMPANION_ADDRESS[currentNetwork.chainId]
              : HUB_ADDRESS[currentNetwork.chainId],
        },
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
        disabled: !!cantFund,
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
                values={{ from: from?.symbol || '' }}
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
              withBalance={!isLoadingBalance}
              balance={balance}
              token={fromToUse}
              withMax
              withHalf
              fullWidth
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
              />
            </StyledInputContainer>
            <Typography variant="body1" component="span">
              <FormattedMessage
                description="rate detail"
                defaultMessage="{frequency} for you for"
                values={{
                  frequency: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every,
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
            !position.remainingLiquidity
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
                        position.remainingLiquidity
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
                        position.remainingLiquidity
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
