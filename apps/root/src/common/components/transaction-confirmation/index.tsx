import React from 'react';
import { useIsTransactionPending, useTransaction } from '@state/transactions/hooks';
import {
  TransactionConfirmation as UITransactionConfirmation,
  TransactionConfirmationProps as UITransactionConfirmationprops,
} from 'ui-library';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import usePrevious from '@hooks/usePrevious';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import confetti from 'canvas-confetti';
import useAggregatorService from '@hooks/useAggregatorService';
import useWalletService from '@hooks/useWalletService';
import {
  AmountsOfToken,
  Token,
  TransactionEventIncomingTypes,
  TransactionIdentifierForSatisfaction,
  TransactionTypes,
} from '@types';

import TokenIcon from '@common/components/token-icon';
import { Address } from 'viem';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { formatCurrencyAmount, parseUsdPrice } from '@common/utils/currency';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { useThemeMode } from '@state/config/hooks';
import { isUndefined } from 'lodash';
import useTransactionReceipt from '@hooks/useTransactionReceipt';

interface TransactionConfirmationProps {
  shouldShow: boolean;
  handleClose: () => void;
  transaction: string;
  to?: Token | null;
  from?: Token | null;
  showBalanceChanges: boolean;
  successTitle: React.ReactNode;
  successSubtitle?: React.ReactNode;
  loadingTitle: React.ReactNode;
  loadingSubtitle?: string;
  actions: UITransactionConfirmationprops['additionalActions'];
  txIdentifierForSatisfaction: TransactionIdentifierForSatisfaction;
}

const TransactionConfirmation = ({
  shouldShow,
  transaction,
  to,
  from,
  showBalanceChanges,
  successTitle,
  successSubtitle,
  actions,
  txIdentifierForSatisfaction,
  loadingTitle,
  loadingSubtitle,
}: TransactionConfirmationProps) => {
  const { confettiParticleCount } = useAggregatorSettingsState();
  const getPendingTransaction = useIsTransactionPending();
  const walletService = useWalletService();
  const isTransactionPending = getPendingTransaction(transaction);
  const [success, setSuccess] = React.useState(false);
  const [balanceAfter, setBalanceAfter] = React.useState<bigint | null>(null);
  const previousTransactionPending = usePrevious(isTransactionPending);
  const currentNetwork = useSelectedNetwork();
  const transactionReceipt = useTransaction(transaction);
  const aggregatorService = useAggregatorService();
  const [fromPrice] = useRawUsdPrice(from);
  const [toPrice] = useRawUsdPrice(to);
  const trackEvent = useTrackEvent();
  const mode = useThemeMode();
  const receipt = useTransactionReceipt(transaction);
  // Transaction receipt will exist by the time the transaction is confirmed
  const protocolToken = getProtocolToken(receipt?.tx.chainId || 1);
  const [protocolPrice] = useRawUsdPrice(protocolToken);

  React.useEffect(() => {
    setSuccess(false);
  }, [transaction]);

  React.useEffect(() => {
    if (!isTransactionPending && previousTransactionPending) {
      setSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      confetti({
        particleCount: confettiParticleCount,
        spread: 70,
        angle: 60,
        origin: { x: 0 },
      });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      confetti({
        particleCount: confettiParticleCount,
        spread: 70,
        angle: 120,
        origin: { x: 1 },
      });

      if (
        (from?.address === PROTOCOL_TOKEN_ADDRESS || to?.address === PROTOCOL_TOKEN_ADDRESS) &&
        transactionReceipt?.type === TransactionTypes.swap
      ) {
        walletService
          .getBalance({
            account: (transactionReceipt?.typeData.transferTo || transactionReceipt.from) as Address,
            token: protocolToken,
          })
          .then((newBalance) => setBalanceAfter(newBalance))
          .catch((e) => console.error('Error fetching balance after swap', e));
      }
    }
  }, [isTransactionPending, previousTransactionPending, success, from, to, transactionReceipt]);

  const onGoToEtherscan = () => {
    const url = buildEtherscanTransaction(transaction, currentNetwork.chainId);
    window.open(url, '_blank');
    trackEvent('View transaction details');
  };

  let sentFrom: AmountsOfToken;
  let sentFromAmount: bigint;
  let gotTo: AmountsOfToken;
  let gotToAmount: bigint | null;
  let gasUsed: AmountsOfToken | undefined = undefined;
  let typeData;
  const balanceChanges = [];

  if (transactionReceipt?.type === TransactionTypes.swap) {
    typeData = transactionReceipt.typeData;
  }
  const transferTo: string | undefined | null = typeData?.transferTo;
  if (transactionReceipt?.receipt && to && from && typeData) {
    const { balanceBefore } = typeData;

    const gasUsedAmount =
      BigInt(transactionReceipt.receipt.gasUsed) * BigInt(transactionReceipt.receipt.effectiveGasPrice);
    gasUsed = {
      amount: gasUsedAmount,
      amountInUnits: formatCurrencyAmount(gasUsedAmount, protocolToken),
      amountInUSD:
        (protocolPrice && parseUsdPrice(protocolToken, gasUsedAmount, protocolPrice).toString()) || undefined,
    };

    if (showBalanceChanges) {
      if (to.address !== PROTOCOL_TOKEN_ADDRESS) {
        gotToAmount = aggregatorService.findTransferValue(
          {
            ...transactionReceipt.receipt,
            gasUsed: BigInt(transactionReceipt.receipt.gasUsed),
            cumulativeGasUsed: BigInt(transactionReceipt.receipt.cumulativeGasUsed),
            effectiveGasPrice: BigInt(transactionReceipt.receipt.effectiveGasPrice),
          },
          to.address || '',
          { to: { address: transferTo || transactionReceipt.from } }
        )[0];

        gotTo = {
          amount: gotToAmount,
          amountInUnits: formatCurrencyAmount(gotToAmount, to),
          amountInUSD: (toPrice && parseUsdPrice(to, gotToAmount, toPrice).toString()) || undefined,
        };

        balanceChanges.push({
          token: {
            ...to,
            icon: <TokenIcon token={to} />,
          },
          amount: gotTo,
          inflow: TransactionEventIncomingTypes.INCOMING,
          transferedTo: (transferTo as Address) || undefined,
        });
      } else if (balanceAfter && balanceBefore) {
        gotToAmount = balanceAfter - (BigInt(balanceBefore) - gasUsedAmount);

        gotTo = {
          amount: gotToAmount,
          amountInUnits: formatCurrencyAmount(gotToAmount, to),
          amountInUSD: (toPrice && parseUsdPrice(to, gotToAmount, toPrice).toString()) || undefined,
        };

        balanceChanges.push({
          token: {
            ...to,
            icon: <TokenIcon token={to} />,
          },
          amount: gotTo,
          inflow: TransactionEventIncomingTypes.INCOMING,
          transferedTo: (transferTo as Address) || undefined,
        });
      }

      if (from.address !== PROTOCOL_TOKEN_ADDRESS) {
        sentFromAmount = aggregatorService.findTransferValue(
          {
            ...transactionReceipt.receipt,
            gasUsed: BigInt(transactionReceipt.receipt.gasUsed),
            cumulativeGasUsed: BigInt(transactionReceipt.receipt.cumulativeGasUsed),
            effectiveGasPrice: BigInt(transactionReceipt.receipt.effectiveGasPrice),
          },
          from.address || '',
          { from: { address: transactionReceipt.from } }
        )[0];

        sentFrom = {
          amount: sentFromAmount,
          amountInUnits: formatCurrencyAmount(sentFromAmount, from),
          amountInUSD: (fromPrice && parseUsdPrice(from, sentFromAmount, fromPrice).toString()) || undefined,
        };

        balanceChanges.push({
          token: {
            ...from,
            icon: <TokenIcon token={from} />,
          },
          amount: sentFrom,
          inflow: TransactionEventIncomingTypes.OUTGOING,
        });
      } else if (balanceAfter && balanceBefore) {
        sentFromAmount = BigInt(balanceBefore) - (balanceAfter + gasUsedAmount);
        sentFrom = {
          amount: sentFromAmount,
          amountInUnits: formatCurrencyAmount(sentFromAmount, from),
          amountInUSD: (fromPrice && parseUsdPrice(from, sentFromAmount, fromPrice).toString()) || undefined,
        };

        balanceChanges.push({
          token: {
            ...from,
            icon: <TokenIcon token={from} />,
          },
          amount: sentFrom,
          inflow: TransactionEventIncomingTypes.OUTGOING,
        });
      }
    }
  }

  const submitSatisfactionHandler = (value: number) => {
    trackEvent(`${txIdentifierForSatisfaction} satisfaction`, {
      sender: transactionReceipt?.from,
      score: value,
    });
  };

  return (
    <UITransactionConfirmation
      onGoToEtherscan={onGoToEtherscan}
      mode={mode}
      success={success}
      shouldShow={shouldShow}
      chainId={transactionReceipt?.chainId}
      receipt={receipt}
      successTitle={successTitle}
      successSubtitle={successSubtitle}
      additionalActions={actions || []}
      loadingTitle={loadingTitle}
      loadingSubtitle={loadingSubtitle}
      gasUsed={
        (!isUndefined(gasUsed) && {
          gasUsed,
          protocolToken,
        }) ||
        undefined
      }
      balanceChanges={balanceChanges}
      onClickSatisfactionOption={submitSatisfactionHandler}
    />
  );
};

export default TransactionConfirmation;
