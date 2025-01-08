import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import {
  AmountsOfToken,
  EarnCreateTypeData,
  EarnPermission,
  EarnPositionActionType,
  NewPositionTypeData,
  Position,
  Positions,
  SavedSdkEarnPosition,
  SdkEarnPositionId,
  SdkStrategyToken,
  Token,
  TransactionDetails,
  TransactionTypes,
} from '@types';
import { emptyTokenWithAddress, parseNumberUsdPriceToBigInt, parseUsdPrice } from './currency';
import { sortTokens } from './parsing';
import { Address, formatUnits, parseUnits } from 'viem';
import { LATEST_VERSION } from '@constants';
import { nowInSeconds } from './time';

export const getImpactedTokensByTxType = (tx: TransactionDetails, positions: Positions): Token[] => {
  switch (tx.type) {
    case TransactionTypes.transferToken:
      return [tx.typeData.token];

    case TransactionTypes.newPosition:
      return [tx.typeData.from];

    case TransactionTypes.earnCreate:
    case TransactionTypes.earnIncrease:
      if (tx.typeData.depositAsset) {
        return [tx.typeData.asset, tx.typeData.depositAsset];
      }
      return [tx.typeData.asset];
    case TransactionTypes.earnWithdraw:
      return tx.typeData.withdrawn.map((withdrawn) => withdrawn.token);

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

const tokenToSdkStrategyToken = ({ address, decimals, name, symbol, price }: Token): SdkStrategyToken => ({
  address,
  decimals,
  name,
  symbol,
  price,
});
export const getNewEarnPositionFromTxTypeData = ({
  newEarnPositionTypeData,
  depositFee,
  user,
  id,
  transaction,
  companionAddress,
}: {
  newEarnPositionTypeData: EarnCreateTypeData['typeData'];
  user: Address;
  id: SdkEarnPositionId;
  transaction: string;
  depositFee?: number;
  companionAddress?: Address;
}): SavedSdkEarnPosition => {
  const { asset, assetAmount: assetAmountString, strategyId } = newEarnPositionTypeData;
  const assetAmount = BigInt(assetAmountString);
  const depositedAmount = {
    amount: assetAmount,
    amountInUnits: formatUnits(assetAmount, asset.decimals),
    amountInUSD: parseUsdPrice(asset, assetAmount, parseNumberUsdPriceToBigInt(asset.price)).toString(),
  };

  let depositedAmountWithoutFee: AmountsOfToken | undefined;
  if (depositFee) {
    const feeAmount = (depositedAmount.amount * BigInt(depositFee * 100)) / 100000n;

    depositedAmountWithoutFee = {
      amount: assetAmount - feeAmount,
      amountInUnits: formatUnits(assetAmount - feeAmount, asset.decimals),
      amountInUSD: parseUsdPrice(asset, assetAmount - feeAmount, parseNumberUsdPriceToBigInt(asset.price)).toFixed(2),
    };
  }

  return {
    id,
    createdAt: nowInSeconds(),
    owner: user,
    lastUpdatedAt: nowInSeconds(),
    strategy: strategyId,
    hasFetchedHistory: false,
    permissions: companionAddress ? { [companionAddress]: [EarnPermission.INCREASE] } : {},
    balances: [
      {
        token: tokenToSdkStrategyToken(asset),
        amount: depositedAmountWithoutFee || depositedAmount,
        profit: {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        },
      },
    ],
    historicalBalances: [
      {
        timestamp: nowInSeconds(),
        balances: [
          {
            token: tokenToSdkStrategyToken(asset),
            amount: depositedAmountWithoutFee || depositedAmount,
            profit: {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            },
          },
        ],
      },
    ],
    history: [
      {
        action: EarnPositionActionType.CREATED,
        owner: user,
        deposited: depositedAmount,
        assetPrice: asset.price,
        permissions: {},
        tx: {
          hash: transaction,
          timestamp: nowInSeconds(),
        },
      },
    ],
  };
};
