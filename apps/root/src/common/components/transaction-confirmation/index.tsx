import React from 'react';
import { useIsTransactionPending, useTransaction } from '@state/transactions/hooks';
import {
  TransactionConfirmation as UITransactionConfirmation,
  TransactionConfirmationProps as UITransactionConfirmationprops,
} from 'ui-library';
import usePrevious from '@hooks/usePrevious';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import confetti from 'canvas-confetti';
import useAggregatorService from '@hooks/useAggregatorService';
import useWalletService from '@hooks/useWalletService';
import {
  AmountsOfToken,
  Token,
  TransactionEventIncomingTypes,
  TransactionApplicationIdentifier,
  TransactionTypes,
} from '@types';

import TokenIcon from '@common/components/token-icon';
import { Address, Hash } from 'viem';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { formatCurrencyAmount, parseUsdPrice } from '@common/utils/currency';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { useThemeMode } from '@state/config/hooks';
import { isUndefined } from 'lodash';
import useTransactionReceipt from '@hooks/useTransactionReceipt';
import { Chains } from '@balmy/sdk';
import { isUsingRabbyGasAccount } from '@common/utils/transactions';
import useActiveWallet from '@hooks/useActiveWallet';
import { useNativeBalancesSnapshot } from '@state/balances/hooks';

const TIMES_PER_NETWORK = {
  [Chains.ARBITRUM.chainId]: 10,
  [Chains.POLYGON.chainId]: 20,
  [Chains.OPTIMISM.chainId]: 10,
  [Chains.BASE.chainId]: 10,
  [Chains.ETHEREUM.chainId]: 40,
  [Chains.ROOTSTOCK.chainId]: 90,
};

export const DEFAULT_TIME_PER_NETWORK = 30;

type CustomBalanceChanges = UITransactionConfirmationprops['balanceChanges'];

interface TransactionConfirmationProps {
  shouldShow: boolean;
  transaction?: { hash: Hash; chainId: number };
  to?: Token | null;
  from?: Token | null;
  showWalletBalanceChanges: boolean;
  customBalanceChanges?: CustomBalanceChanges; // Like deposit balance changes in some Position
  successTitle: React.ReactNode;
  successSubtitle?: React.ReactNode;
  loadingTitle: React.ReactNode;
  loadingSubtitle?: string;
  actions: UITransactionConfirmationprops['additionalActions'];
  feeCost?: UITransactionConfirmationprops['feeCost'];
  txIdentifierForSatisfaction: TransactionApplicationIdentifier;
  setHeight?: (a?: number) => void;
}

const TransactionConfirmation = ({
  shouldShow,
  transaction,
  to,
  from,
  showWalletBalanceChanges,
  customBalanceChanges,
  successTitle,
  successSubtitle,
  actions,
  txIdentifierForSatisfaction,
  loadingTitle,
  loadingSubtitle,
  setHeight,
}: TransactionConfirmationProps) => {
  const { confettiParticleCount } = useAggregatorSettingsState();
  const isTransactionPending = useIsTransactionPending(transaction?.hash);
  const walletService = useWalletService();
  const activeWallet = useActiveWallet();
  const { nativeBalancesSnapshot, updateNativeBalancesSnapshot } = useNativeBalancesSnapshot();
  const [success, setSuccess] = React.useState(false);
  const [balanceAfter, setBalanceAfter] = React.useState<bigint | null>(null);
  const previousTransactionPending = usePrevious(isTransactionPending);
  const transactionReceipt = useTransaction(transaction);
  const aggregatorService = useAggregatorService();
  const [fromPrice] = useRawUsdPrice(from);
  const [toPrice] = useRawUsdPrice(to);
  const { trackEvent } = useAnalytics();
  const mode = useThemeMode();
  const receipt = useTransactionReceipt({ transaction, mergeTransactionsWithSameHash: true });
  // Transaction receipt will exist by the time the transaction is confirmed
  const protocolToken = getProtocolToken(receipt?.tx.chainId || 1);
  const [protocolPrice] = useRawUsdPrice(protocolToken);

  React.useEffect(() => {
    setSuccess(false);
    updateNativeBalancesSnapshot();
  }, [transaction]);

  React.useEffect(() => {
    if (!isTransactionPending && previousTransactionPending && !!transactionReceipt) {
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
    if (!transaction) return;
    const url = buildEtherscanTransaction(transaction.hash, transaction.chainId);
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
      amountInUnits: formatCurrencyAmount({ amount: gasUsedAmount, token: protocolToken }),
      amountInUSD:
        (protocolPrice && parseUsdPrice(protocolToken, gasUsedAmount, protocolPrice).toString()) || undefined,
    };

    if (showWalletBalanceChanges) {
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

        const returnedFromAmount = aggregatorService.findTransferValue(
          {
            ...transactionReceipt.receipt,
            gasUsed: BigInt(transactionReceipt.receipt.gasUsed),
            cumulativeGasUsed: BigInt(transactionReceipt.receipt.cumulativeGasUsed),
            effectiveGasPrice: BigInt(transactionReceipt.receipt.effectiveGasPrice),
          },
          from.address || '',
          { to: { address: transactionReceipt.from } }
        )[0];

        const sentFromAmountResult = (sentFromAmount || 0n) - (returnedFromAmount || 0n);

        sentFrom = {
          amount: sentFromAmountResult,
          amountInUnits: formatCurrencyAmount({ amount: sentFromAmountResult, token: from }),
          amountInUSD: (fromPrice && parseUsdPrice(from, sentFromAmountResult, fromPrice).toString()) || undefined,
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
          amountInUnits: formatCurrencyAmount({ amount: sentFromAmount, token: from }),
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
          amountInUnits: formatCurrencyAmount({ amount: gotToAmount, token: to }),
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
          amountInUnits: formatCurrencyAmount({ amount: gotToAmount, token: to }),
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
    }
  }

  const maxWaitingTime = React.useMemo(() => {
    if (!transactionReceipt || !activeWallet) return DEFAULT_TIME_PER_NETWORK;
    const usingRabbyGasAccount = isUsingRabbyGasAccount({
      chainId: transactionReceipt.chainId,
      activeWallet,
      nativeBalances: nativeBalancesSnapshot[transactionReceipt.chainId],
      txToCheck: transactionReceipt,
    });
    const standardWaitingTime = TIMES_PER_NETWORK[transactionReceipt.chainId] || DEFAULT_TIME_PER_NETWORK;

    return usingRabbyGasAccount ? standardWaitingTime * 3 : standardWaitingTime;
  }, [transactionReceipt?.chainId, activeWallet, nativeBalancesSnapshot]);

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
      setHeight={setHeight}
      gasUsed={
        (!isUndefined(gasUsed) && {
          gasUsed,
          protocolToken,
        }) ||
        undefined
      }
      balanceChanges={[...(customBalanceChanges ? customBalanceChanges : []), ...balanceChanges]}
      onClickSatisfactionOption={submitSatisfactionHandler}
      maxWaitingTime={maxWaitingTime}
    />
  );
};

export default TransactionConfirmation;
