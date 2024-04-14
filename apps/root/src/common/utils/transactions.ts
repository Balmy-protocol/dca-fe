import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { NewPositionTypeData, Position, Positions, Token, TransactionDetails, TransactionTypes } from '@types';
import { emptyTokenWithAddress, parseNumberUsdPriceToBigInt, parseUsdPrice } from './currency';
import { sortTokens } from './parsing';
import { Address, formatUnits, parseUnits } from 'viem';
import { LATEST_VERSION } from '@constants';

export const getImpactedTokensByTxType = (tx: TransactionDetails, positions: Positions): Token[] => {
  switch (tx.type) {
    case TransactionTypes.transferToken:
      return [tx.typeData.token];

    case TransactionTypes.newPosition:
      return [tx.typeData.from];

    case TransactionTypes.wrapEther:
      return [getProtocolToken(tx.chainId), getWrappedProtocolToken(tx.chainId)];

    case TransactionTypes.terminatePosition:
      const terminatedPosition = positions.find((pos) => pos.id === tx.typeData.id);
      const tokensToUpdate: Token[] = [];
      if (terminatedPosition) {
        if (BigInt(tx.typeData.remainingLiquidity) !== 0n) {
          tokensToUpdate.push(terminatedPosition.from);
        }
        if (BigInt(tx.typeData.toWithdraw) !== 0n) {
          tokensToUpdate.push(terminatedPosition.to);
        }
      }
      return tokensToUpdate;

    case TransactionTypes.withdrawPosition:
    case TransactionTypes.modifyRateAndSwapsPosition:
    case TransactionTypes.withdrawFunds:
      const withdrawnPosition = positions.find((pos) => pos.id === tx.typeData.id);
      return withdrawnPosition ? [withdrawnPosition.from] : [];

    case TransactionTypes.swap:
    case TransactionTypes.wrap:
    case TransactionTypes.unwrap:
      const { from, to } = tx.typeData;
      return [from, to];

    default:
      return [];
  }
};

export const getImpactedTokenForOwnWallet = (
  tx: TransactionDetails,
  wallets: string[]
): { token?: Token; recipient?: string } => {
  let recipient: string | undefined;
  let impactedToken: Token | undefined;
  switch (tx.type) {
    case TransactionTypes.transferToken:
      if (wallets.includes(tx.typeData.to.toLowerCase())) {
        recipient = tx.typeData.to;
      }
      impactedToken = tx.typeData.token;
      break;
    case TransactionTypes.swap:
      if (tx.typeData.transferTo && wallets.includes(tx.typeData.transferTo.toLowerCase())) {
        recipient = tx.typeData.transferTo;
      }
      impactedToken = tx.typeData.to;
      break;
    default:
      return {};
  }

  return { token: impactedToken, recipient: recipient?.toLowerCase() };
};

export const getNewPositionFromTxTypeData = ({
  newPositionTypeData,
  chainId,
  user,
  id,
  pendingTransaction = '',
  positionId,
}: {
  newPositionTypeData: NewPositionTypeData['typeData'];
  chainId: number;
  user: Address;
  id: string;
  positionId?: bigint;
  pendingTransaction?: string;
}): Position => {
  const { fromYield, toYield } = newPositionTypeData;
  const protocolToken = getProtocolToken(chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(chainId);

  let fromToUse =
    newPositionTypeData.from.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.from;
  let toToUse =
    newPositionTypeData.to.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.to;

  if (fromYield) {
    fromToUse = {
      ...fromToUse,
      underlyingTokens: [emptyTokenWithAddress(fromYield)],
    };
  }
  if (toYield) {
    toToUse = {
      ...toToUse,
      underlyingTokens: [emptyTokenWithAddress(toYield)],
    };
  }

  const [tokenA, tokenB] = sortTokens(newPositionTypeData.from, newPositionTypeData.to);

  const rateAmount =
    parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals) /
    BigInt(newPositionTypeData.frequencyValue);
  const rateAmountInUnits = formatUnits(rateAmount, newPositionTypeData.from.decimals);

  return {
    from: fromToUse,
    to: toToUse,
    user,
    chainId: chainId,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    positionId: positionId || id,
    toWithdraw: {
      amount: 0n,
      amountInUnits: '0',
      amountInUSD: '0',
    },
    swapInterval: BigInt(newPositionTypeData.frequencyType),
    swapped: {
      amount: 0n,
      amountInUnits: '0',
      amountInUSD: '0',
    },
    rate: {
      amount: rateAmount,
      amountInUnits: rateAmountInUnits,
      amountInUSD: parseUsdPrice(fromToUse, rateAmount, parseNumberUsdPriceToBigInt(fromToUse.price)).toString(),
    },
    pairId: `${tokenA.address}-${tokenB.address}`,
    remainingLiquidity: {
      amount: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
      amountInUnits: newPositionTypeData.fromValue,
      amountInUSD: parseUsdPrice(
        fromToUse,
        parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        parseNumberUsdPriceToBigInt(fromToUse.price)
      ).toString(),
    },
    remainingSwaps: BigInt(newPositionTypeData.frequencyValue),
    totalSwaps: BigInt(newPositionTypeData.frequencyValue),
    totalExecutedSwaps: 0n,
    id,
    startedAt: newPositionTypeData.startedAt,
    pendingTransaction,
    status: 'ACTIVE',
    version: LATEST_VERSION,
    isStale: false,
    swappedYield: toYield
      ? {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        }
      : undefined,
    toWithdrawYield: toYield
      ? {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        }
      : undefined,
    remainingLiquidityYield: fromYield
      ? {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        }
      : undefined,
    nextSwapAvailableAt: newPositionTypeData.startedAt,
    permissions: [],
    yields: newPositionTypeData.yields,
  };
};
