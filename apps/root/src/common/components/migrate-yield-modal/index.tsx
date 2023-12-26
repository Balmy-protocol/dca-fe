import React from 'react';
import styled from 'styled-components';
import isUndefined from 'lodash/isUndefined';
import { Position, YieldOption, TransactionTypes } from '@types';
import { FormattedMessage } from 'react-intl';
import useTransactionModal from '@hooks/useTransactionModal';
import { Typography, Grid, HelpOutlineOutlinedIcon, ButtonProps, Modal } from 'ui-library';
import { useTransactionAdder } from '@state/transactions/hooks';
import { PERMISSIONS } from '@constants';
import usePositionService from '@hooks/usePositionService';
import useYieldOptions from '@hooks/useYieldOptions';
import { formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import useErrorService from '@hooks/useErrorService';
import { shouldTrackError } from '@common/utils/errors';
import YieldTokenSelector from '../yield-token-selector';

const StyledGrid = styled(Grid)`
  display: flex;
`;

const StyledContent = styled.div`
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledYieldHelpContainer = styled(Typography)`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const StyledYieldHelpDescriptionContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
`;

interface MigrateYieldModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const MigrateYieldModal = ({ position, open, onCancel }: MigrateYieldModalProps) => {
  const { from, to, toWithdraw, chainId, remainingLiquidity } = position;
  const [fromYield, setFromYield] = React.useState<YieldOption | null | undefined>(undefined);
  const [toYield, setToYield] = React.useState<YieldOption | null | undefined>(undefined);
  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(chainId);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const positionService = usePositionService();
  const addTransaction = useTransactionAdder();
  const errorService = useErrorService();

  const handleCancel = () => {
    onCancel();
  };

  const handleClose = () => {
    handleCancel();
    setFromYield(undefined);
    setToYield(undefined);
  };

  const handleMigrate = async () => {
    if (!position) {
      return;
    }

    try {
      handleCancel();

      const hasPermission = await positionService.companionHasPermission(position, PERMISSIONS.TERMINATE);

      setModalLoading({
        content: (
          <>
            <Typography variant="body">
              <FormattedMessage
                description="Migrating your position"
                defaultMessage="Making your {from}/{to} position start generating yield"
                values={{
                  from: position.from.symbol,
                  to: position.to.symbol,
                }}
              />
            </Typography>
            {!hasPermission && (
              <Typography variant="body">
                <FormattedMessage
                  description="Authorize signature companion text migrate"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you migrate the position."
                />
              </Typography>
            )}
          </>
        ),
      });
      const result = await positionService.migrateYieldPosition(position, fromYield, toYield);
      addTransaction(result, {
        type: TransactionTypes.migratePositionYield,
        typeData: {
          id: position.id,
          from: position.from.symbol,
          to: position.to.symbol,
          fromYield: fromYield?.tokenAddress,
          toYield: toYield?.tokenAddress,
        },
        position,
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success migrating your position"
            defaultMessage="Making your {from}/{to} position start generating yield has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e as Error)) {
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error making new positions start generating yield position', JSON.stringify(e), {
          from: position.from.address,
          to: position.to.address,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: (
          <FormattedMessage
            description="modalErrorMigratingYieldPosition"
            defaultMessage="Error making new position start generating yield"
          />
        ),
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    } finally {
      setFromYield(undefined);
      setToYield(undefined);
    }
  };

  const actions: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: ButtonProps['color'];
    variant?: 'text' | 'outlined' | 'contained';
  }[] = [
    {
      color: 'secondary',
      variant: 'contained',
      label: (
        <FormattedMessage description="generateYield" defaultMessage="Migrate position and start generating yield" />
      ),
      onClick: handleMigrate,
      disabled: isUndefined(fromYield) || isUndefined(toYield),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="gainYield title" defaultMessage="Start generating yield" />}
      actions={actions}
    >
      <Grid container alignItems="stretch" spacing={2}>
        <StyledGrid item xs={6}>
          <StyledContent>
            <YieldTokenSelector
              token={from}
              yieldOptions={yieldOptions || []}
              isLoading={isLoadingYieldOptions}
              setYieldOption={setFromYield}
              yieldSelected={fromYield}
              inModal
            />
          </StyledContent>
        </StyledGrid>
        <StyledGrid item xs={6}>
          <StyledContent>
            <YieldTokenSelector
              token={to}
              yieldOptions={yieldOptions || []}
              isLoading={isLoadingYieldOptions}
              setYieldOption={setToYield}
              yieldSelected={toYield}
              inModal
            />
          </StyledContent>
        </StyledGrid>
        <Grid item xs={12}>
          <StyledContent>
            <StyledYieldHelpContainer variant="body">
              <HelpOutlineOutlinedIcon fontSize="inherit" color="primary" />
              <FormattedMessage description="howItWorks" defaultMessage="How it works" />
            </StyledYieldHelpContainer>
            <StyledYieldHelpDescriptionContainer>
              <Typography variant="bodySmall" textAlign="left">
                <FormattedMessage
                  description="howItWorksDescriptionStep1"
                  defaultMessage="In order to start generating yield we will need to close your current position and create a new one. Your historical data from this position will appear as a closed position"
                />
              </Typography>
              {toWithdraw.gt(BigNumber.from(0)) && (
                <Typography variant="bodySmall" textAlign="left">
                  <FormattedMessage
                    description="howItWorksDescriptionStep3"
                    defaultMessage="By terminating the current position {toWithdraw} {to} will be sent to your wallet."
                    values={{
                      toWithdraw: formatCurrencyAmount(toWithdraw, to),
                      to: to.symbol,
                    }}
                  />
                </Typography>
              )}
              <Typography variant="bodySmall" textAlign="left">
                <FormattedMessage
                  description="howItWorksDescriptionStep4"
                  defaultMessage="The remaining {remainingLiquidity} {from} will be used to create a new position with the same rate and remaining duration as your current one."
                  values={{
                    from: from.symbol,
                    remainingLiquidity: formatCurrencyAmount(remainingLiquidity, from),
                  }}
                />
              </Typography>
            </StyledYieldHelpDescriptionContainer>
          </StyledContent>
        </Grid>
      </Grid>
    </Modal>
  );
};
export default MigrateYieldModal;
