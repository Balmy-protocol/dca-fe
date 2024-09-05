import React from 'react';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { DisplayStrategy, EarnPermission, EarnWithdrawTypeData, TransactionTypes } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { parseUnits } from 'viem';
import useTrackEvent from '@hooks/useTrackEvent';
import useActiveWallet from '@hooks/useActiveWallet';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { Typography } from 'ui-library';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import useEarnService from '@hooks/earn/useEarnService';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { isSameToken } from '@common/utils/currency';
import useSupportsSigning from '@hooks/useSupportsSigning';

interface UseEarnWithdrawActionsParams {
  strategy?: DisplayStrategy;
}

const useEarnWithdrawActions = ({ strategy }: UseEarnWithdrawActionsParams) => {
  const asset = strategy?.asset;
  const activeWallet = useActiveWallet();
  const trackEvent = useTrackEvent();
  const errorService = useErrorService();
  const earnService = useEarnService();
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const { withdrawAmount: assetAmountInUnits, withdrawRewards } = useEarnManagementState();
  const addTransaction = useTransactionAdder();
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const hasSignSupport = useSupportsSigning();

  const onWithdraw = React.useCallback(async () => {
    const notWithdrawing = !assetAmountInUnits && !withdrawRewards;
    if (!asset || !activeWallet?.address || !strategy || notWithdrawing) return;

    const currentPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);
    if (!currentPosition) return;

    const hasPermission = await earnService.companionHasPermission(currentPosition.id, EarnPermission.WITHDRAW);

    const protocolToken = getProtocolToken(strategy.farm.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(strategy.farm.chainId);

    // Protocol tokens will be unwrapped
    const assetIsWrappedProtocol = isSameToken(wrappedProtocolToken, asset);

    try {
      setModalLoading({
        content: (
          <>
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="earn.strategy-management.withdraw.modal.loading"
                defaultMessage="Withdrawing funds from {farm}"
                values={{ farm: strategy.farm.name }}
              />
            </Typography>
            {assetIsWrappedProtocol && !hasPermission && hasSignSupport && (
              <Typography variant="bodyRegular">
                <FormattedMessage
                  description="earn.strategy-management.withdraw.modal.sign-companion"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you get your balance back as {protocolToken}"
                  values={{ protocolToken: protocolToken.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });

      const rewardsBalances = currentPosition.balances
        .filter((balance) => isSameToken(balance.token, asset))
        .map((balance) => ({
          amount: balance.amount.amount,
          token: balance.token,
        }));

      const assetAmount = parseUnits(assetAmountInUnits || '0', asset.decimals);

      const tokensToWithdraw = [
        ...(withdrawRewards ? rewardsBalances : []),
        ...(assetAmount > 0n
          ? [
              {
                amount: assetAmount,
                token: asset,
                convertTo: assetIsWrappedProtocol ? protocolToken.address : undefined,
              },
            ]
          : []),
      ];

      trackEvent(`Earn - Withdraw position submitting`, {
        asset: asset.symbol,
        chainId: strategy.farm.chainId,
        amount: assetAmountInUnits,
        withdrawRewards,
      });

      const result = await earnService.withdrawPosition({
        earnPositionId: currentPosition.id,
        withdraw: tokensToWithdraw,
      });

      const parsedTokensToWithdraw = tokensToWithdraw.map((token) => ({
        amount: token.amount.toString(),
        token: token.token,
      }));

      const typeData: EarnWithdrawTypeData = {
        type: TransactionTypes.earnWithdraw,
        typeData: {
          strategyId: strategy.id,
          positionId: currentPosition.id,
          withdrawn: parsedTokensToWithdraw,
          assetAddress: asset.address,
        },
      };

      trackEvent(`Earn - Withdraw position submitted`, {
        asset: asset.symbol,
        strategy: strategy.id,
        amount: assetAmountInUnits,
        withdrawRewards,
      });

      addTransaction(result, typeData);

      setModalClosed({ content: '' });

      setShouldShowConfirmation(true);
      setCurrentTransaction(result.hash);

      window.scrollTo(0, 0);
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('Earn - Withdraw position error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error withdrawing position', JSON.stringify(e), {
          asset: asset.address,
          chainId: strategy.network.chainId,
        });
      }

      setModalError({
        content: (
          <FormattedMessage
            description="earn.strategy-management.withdraw.modal.error"
            defaultMessage="Error withdrawing"
          />
        ),
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: {
          ...e,
          extraData: {
            asset: asset.address,
            chainId: strategy.network.chainId,
            assetAmountInUnits,
            withdrawRewards,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  }, [activeWallet?.address, addTransaction, asset, assetAmountInUnits, earnService, errorService, strategy]);

  return React.useMemo(
    () => ({
      shouldShowConfirmation,
      onWithdraw,
      currentTransaction,
      setShouldShowConfirmation,
    }),
    [shouldShowConfirmation, currentTransaction, onWithdraw]
  );
};

export default useEarnWithdrawActions;
