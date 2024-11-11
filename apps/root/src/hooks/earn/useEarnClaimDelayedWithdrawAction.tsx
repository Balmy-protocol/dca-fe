import React from 'react';
import { DelayedWithdrawalPositions, EarnClaimDelayedWithdrawTypeData, TransactionTypes } from 'common-types';
import { FormattedMessage } from 'react-intl';
import useTrackEvent from '@hooks/useTrackEvent';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { Typography } from 'ui-library';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import useEarnService from '@hooks/earn/useEarnService';

const useEarnClaimDelayedWithdrawAction = () => {
  const trackEvent = useTrackEvent();
  const errorService = useErrorService();
  const earnService = useEarnService();
  const addTransaction = useTransactionAdder();
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();

  const onClaimDelayedWithdraw = React.useCallback(
    async (position: DelayedWithdrawalPositions) => {
      const strategy = position.strategy;

      // NOTE: For now, strategies should only have one claimable token
      const claimToken = position.delayed.find((delayed) => delayed.ready.amount > 0n);

      try {
        if (!claimToken) throw new Error('No claimable token found');

        setModalLoading({
          content: (
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="earn.strategy-management.claim-delayed-withdraw.modal.loading"
                defaultMessage="You are now claiming {amount} {token} from {farm}. Time to enjoy the rewards you've cultivated 🎉"
                values={{
                  farm: strategy.farm.name,
                  token: claimToken.token.symbol,
                  amount: claimToken.ready.amount.toString(),
                }}
              />
            </Typography>
          ),
        });

        trackEvent(`Earn - Claim delayed withdraw submitting`, {
          token: claimToken.token.symbol,
          chainId: strategy.farm.chainId,
        });

        const result = await earnService.claimDelayedWithdrawPosition({
          earnPositionId: position.id,
          claim: claimToken.token.address,
        });

        const typeData: EarnClaimDelayedWithdrawTypeData = {
          type: TransactionTypes.earnClaimDelayedWithdraw,
          typeData: {
            strategyId: strategy.id,
            positionId: position.id,
            claim: claimToken.token,
            withdrawn: claimToken.ready.amount.toString(),
          },
        };

        trackEvent(`Earn - Claim delayed withdraw submitted`, {
          token: claimToken.token.symbol,
          strategy: strategy.id,
        });

        addTransaction(result, typeData);

        setModalClosed({ content: '' });
      } catch (e) {
        // User rejecting transaction
        if (shouldTrackError(e as Error)) {
          trackEvent('Earn - Claim delayed withdraw error');
          void errorService.logError('Error claiming delayed withdraw', JSON.stringify(e), {
            token: claimToken?.token,
            strategy: strategy.id,
            position: position.id,
          });
        }

        setModalError({
          content: (
            <FormattedMessage
              description="earn.strategy-management.claim-delayed-withdraw.modal.error"
              defaultMessage="Error claiming delayed withdraw"
            />
          ),
          /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
          error: {
            ...e,
            extraData: {
              token: claimToken?.token,
              chainId: strategy.network.chainId,
            },
          },
        });
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      }
    },
    [addTransaction, earnService, errorService]
  );

  return onClaimDelayedWithdraw;
};

export default useEarnClaimDelayedWithdrawAction;